#!/usr/bin/env python3
"""
atelier-build.py — stamp the shared chrome (header, drawer, footer, booking bar)
into pages, and assemble index.html from its partials.

WHY (2026-11 redesign). The site is 40+ hand-written .html files with no include
system, so the header and footer were copy-pasted into every one and drifted.
The new chrome lives once, in scripts/partials/, and this script writes it
between marker comments:

    <!-- at:header --> … <!-- /at:header -->
    <!-- at:footer --> … <!-- /at:footer -->

Edit the partial, run this, commit. Idempotent: a second run changes nothing.

index.html is assembled whole: the <head> metadata that already exists in the
file (schema, consent mode, title, meta, Open Graph) is kept byte for byte, and
only the stylesheet block and the <body> are generated.

Usage:  python3 scripts/atelier-build.py            # index.html
        python3 scripts/bundle-css.py && python3 scripts/cache-bust.py
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
PART = ROOT / 'scripts' / 'partials'

def read(name):
    return (PART / name).read_text(encoding='utf-8')

ICONS = dict(l.split('=', 1) for l in read('icons.txt').splitlines() if '=' in l)
def inline_svg(name):
    """An SVG that is pasted into HTML carries only its drawing. File-level
    <metadata> (the content-credentials block the .svg files carry) belongs to
    the standalone file: inlined, it would be ~8 KiB of base64 repeated on every
    page for nothing."""
    svg = read(name).strip()
    svg = re.sub(r'<metadata>.*?</metadata>', '', svg, flags=re.S)
    return re.sub(r'\s+xmlns:c2pa="[^"]*"', '', svg)

LOCKUP = inline_svg('logo-lockup.svg')
MARK = inline_svg('logo-mark.svg')

def render(tpl):
    out = tpl.replace('{{LOCKUP}}', LOCKUP)
    out = out.replace('{{MARK_MENU}}', MARK.replace('<svg ', '<svg class="at-menu__mark" fill="#C7A87E" ', 1))
    for k, v in ICONS.items():
        out = out.replace('{{%s}}' % k, v)
    left = re.findall(r'\{\{[A-Z_]+\}\}', out)
    if left:
        sys.exit('unresolved placeholders: %s' % sorted(set(left)))
    return out

HEADER = render(read('header.html')).rstrip()
FOOTER = render(read('footer.html')).rstrip()

def region(name, body):
    return '<!-- at:%s -->\n%s\n<!-- /at:%s -->' % (name, body, name)

HEAD_BLOCK = '''    <meta name="theme-color" content="#F2EDE6" />
    <meta name="color-scheme" content="light" />
    <link rel="preload" as="font" type="font/woff2" href="assets/fonts/bona-nova/bona-nova-cyrillic-400-normal.woff2" crossorigin>
    <link rel="preload" as="font" type="font/woff2" href="assets/fonts/manrope/manrope-cyrillic.woff2" crossorigin>
    <style>
@font-face{font-family:"Bona Nova";font-style:normal;font-weight:400;font-display:swap;src:url('assets/fonts/bona-nova/bona-nova-cyrillic-400-normal.woff2') format('woff2');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:"Bona Nova";font-style:normal;font-weight:400;font-display:swap;src:url('assets/fonts/bona-nova/bona-nova-latin-400-normal.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:"Manrope";font-style:normal;font-weight:200 800;font-display:swap;src:url('assets/fonts/manrope/manrope-cyrillic.woff2') format('woff2');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:"Manrope";font-style:normal;font-weight:200 800;font-display:swap;src:url('assets/fonts/manrope/manrope-latin-ext.woff2') format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Manrope";font-style:normal;font-weight:200 800;font-display:swap;src:url('assets/fonts/manrope/manrope-latin.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
    </style>
    <link rel="stylesheet" href="assets/css/home.bundle.css" />'''

def widget(html):
    """The WhatsApp / Viber / Messenger widget markup, reused as it stands."""
    m = re.search(r'<div class="contact-widget" id="contact-widget">.*?</button>\s*</div>', html, flags=re.S)
    return m.group(0) if m else ''

def build_home():
    f = ROOT / 'index.html'
    s = f.read_text(encoding='utf-8')
    if '<!-- at:head -->' in s:
        keep = s[:s.index('<!-- at:head -->')]
    else:
        cut = s.index('<!-- Hero image now uses')
        keep = s[:cut]
        # the viewport gains viewport-fit=cover so the booking bar can sit in the
        # home-indicator safe area on iPhones (env(safe-area-inset-bottom))
        keep = keep.replace('content="width=device-width, initial-scale=1.0"',
                            'content="width=device-width, initial-scale=1, viewport-fit=cover"')
    wid = widget(s)
    tr = re.search(r'data-translations="([^"]+)"', s)
    translations = tr.group(1) if tr else 'assets/js/translations.js'
    body = '\n'.join([
        '<body class="at-page at-home">',
        region('header', HEADER),
        render(read('home-main.html')).rstrip(),
        region('footer', FOOTER),
        '    <script defer src="assets/js/atelier.js"></script>',
        '    <script defer src="assets/js/ai-chat-v2.js"></script>',
        '    <script defer src="assets/js/i18n.js" data-translations="%s"></script>' % translations,
        '    <script defer src="assets/js/cookie-consent.js"></script>',
        '</body>',
        '</html>',
        '',
    ])
    out = keep.rstrip() + '\n\n<!-- at:head -->\n' + HEAD_BLOCK + '\n<!-- /at:head -->\n</head>\n\n' + body
    if out != s:
        f.write_text(out, encoding='utf-8')
        print('  wrote index.html (%d KiB, was %d KiB)' % (len(out) // 1024, len(s) // 1024))
    else:
        print('  index.html unchanged')

if __name__ == '__main__':
    build_home()
