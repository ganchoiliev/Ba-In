#!/usr/bin/env python3
"""Assemble the pages that use the atelier design system.

Edit the main content and shared navigation in scripts/partials/. Each output
page owns its search metadata above the at:head marker. To produce the final,
cache-stamped HTML, run these commands in order:

    python3 scripts/atelier-build.py
    python3 scripts/bundle-css.py
    python3 scripts/cache-bust.py
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

# Page-specific metadata stays above the at:head marker in each HTML file.
# The main partials contain the editable page content.
PAGES = {
    'index': 'home',
    'about': 'about',
    'procedures': 'procedures',
    'pricing': 'pricing',
    'appointment': 'appointment',
    'gallery': 'gallery',
    'laminirane': 'lamination',
    'vezhdi': 'treatment',
    'microblading': 'treatment',
    'microneedling': 'treatment',
    'piercing': 'treatment',
    'lashes': 'treatment',
    'plasma': 'treatment',
    'perm-makeup-removal': 'treatment',
}


def build_page(filename, name):
    page = ROOT / (filename + '.html')
    previous = page.read_text(encoding='utf-8')
    metadata, marker, _ = previous.partition('<!-- at:head -->')
    if not marker:
        sys.exit(f'{page.name}: missing at:head marker after page metadata')

    styles = HEAD_BLOCK
    scripts = ['atelier']
    styles += f'\n    <link rel="stylesheet" href="assets/css/atelier-{name}.css" />'
    if name == 'home':
        styles += '\n    <link rel="stylesheet" href="assets/css/atelier-home-sections.css" />'
    if (ROOT / 'assets' / 'js' / f'atelier-{name}.js').is_file():
        scripts.append(f'atelier-{name}')

    partial = filename if name == 'treatment' else name
    detail = name in ('treatment', 'lamination')
    nav_target = 'procedures' if detail else filename
    current = 'true' if detail else 'page'
    nav_link = f'href="{nav_target}.html" data-i18n="shared.nav.'
    header = HEADER.replace(nav_link, f'aria-current="{current}" ' + nav_link)
    body = [
        f'<body class="at-page at-{name}">',
        region('header', header),
        render(read(f'{partial}-main.html')).rstrip(),
        region('footer', FOOTER),
    ]
    for script in scripts + ['ai-chat-v2', 'i18n', 'cookie-consent']:
        dictionary = ' data-translations="assets/js/translations.js"' if script == 'i18n' else ''
        body.append(f'    <script defer src="assets/js/{script}.js"{dictionary}></script>')
    body.extend(['</body>', '</html>', ''])
    output = metadata.rstrip() + '\n\n' + region('head', styles) + '\n</head>\n\n' + '\n'.join(body)
    if output != previous:
        page.write_text(output, encoding='utf-8')
        print(f'  wrote {page.name}')


if __name__ == '__main__':
    for filename, name in PAGES.items():
        build_page(filename, name)
