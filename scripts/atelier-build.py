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
# The header carries a simpler lockup than the footer: one colour and no
# signature line, because at header size (36-44px tall) the gold monogram
# washed out on cream and "ILIYANA NIKOL" was about 4px high.
LOCKUP_HEADER = inline_svg('logo-header.svg')
MARK = inline_svg('logo-mark.svg')

def render(tpl):
    out = tpl.replace('{{LOCKUP_HEADER}}', LOCKUP_HEADER).replace('{{LOCKUP}}', LOCKUP)
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
@font-face{font-family:"Bona Nova";font-style:italic;font-weight:400;font-display:swap;src:url('assets/fonts/bona-nova/bona-nova-cyrillic-400-italic.woff2') format('woff2');unicode-range:U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116}
@font-face{font-family:"Bona Nova";font-style:italic;font-weight:400;font-display:swap;src:url('assets/fonts/bona-nova/bona-nova-latin-400-italic.woff2') format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
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
    'contact': 'contact',
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


# ---------------------------------------------------------------------------
# Legacy pages: blog index, articles, FAQ, legal pages, 404.
#
# These keep their content markup (everything inside <main>) exactly as it is,
# because auto-blog.js clones pmu-removal-guide.html and string-matches that
# markup, and scripts/sidebar-recent.py rewrites the sidebar in every article.
# Only the chrome around it is replaced: stylesheets, header, footer, scripts.
# The first run converts a page; later runs only restamp the marked regions.
# A post freshly generated by auto-blog.js inherits the converted template, so
# it needs nothing extra beyond this script and cache-bust.py.
# ---------------------------------------------------------------------------
LEGACY_SKIP = {p + '.html' for p in PAGES}
LEGACY_HEAD = HEAD_BLOCK + """
    <link rel="stylesheet" href="assets/css/atelier-article.css" />
    <script>document.documentElement.classList.add('at-js')</script>"""
CONSENT_STUB = """    <!-- Google Consent Mode v2 (default deny) -->
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent','default',{
            analytics_storage:'denied',
            ad_storage:'denied',
            ad_user_data:'denied',
            ad_personalization:'denied',
            wait_for_update:500
        });
        gtag('set','ads_data_redaction',true);
        gtag('set','url_passthrough',true);
    </script>
"""
LEGACY_SCRIPTS = ['atelier', 'atelier-legacy', 'ai-chat-v2', 'i18n', 'cookie-consent']

OLD_HEAD_ASSETS = re.compile(
    r'[ \t]*(?:<noscript>\s*<link[^>]*rel="stylesheet"[^>]*>\s*</noscript>'
    r'|<link\b[^>]*\brel="stylesheet"[^>]*>'
    r'|<link\b[^>]*\brel="preload"[^>]*\bas="(?:font|style)"[^>]*>'
    r'|<link\b[^>]*\brel="preconnect"[^>]*>)[ \t]*\n?', re.I)


def set_region(html, name, body):
    pattern = re.compile(r'<!-- at:%s -->.*?<!-- /at:%s -->' % (name, name), re.S)
    if not pattern.search(html):
        sys.exit('missing at:%s region' % name)
    return pattern.sub(lambda _m: region(name, body), html, count=1)


def convert_legacy(html, filename):
    """One-time conversion of an old-theme page. Returns html with empty regions."""
    head, sep, rest = html.partition('</head>')
    if not sep:
        sys.exit(f'{filename}: no </head>')
    first = OLD_HEAD_ASSETS.search(head)
    at = first.start() if first else len(head)
    before, after = head[:at], OLD_HEAD_ASSETS.sub('', head[at:])
    # the old theme inlined its critical CSS and font faces; page-specific
    # <style> blocks (they come after the stylesheets) are kept
    def drop_critical(m):
        return '' if ('@font-face' in m.group(0) or 'Critical CSS' in m.group(0)) else m.group(0)
    before = re.sub(r'[ \t]*<style\b[^>]*>.*?</style>[ \t]*\n?', drop_critical, before, flags=re.S)
    after = re.sub(r'[ \t]*<style\b[^>]*>.*?</style>[ \t]*\n?', drop_critical, after, flags=re.S)
    head = before.rstrip() + '\n\n' + region('head', '') + '\n' + after.lstrip('\n')
    head = re.sub(r'(<meta name="viewport" content=")[^"]*(")',
                  r'\1width=device-width, initial-scale=1, viewport-fit=cover\2', head, count=1)

    body = rest[rest.index('<body'):]
    if filename == '404.html':
        main = '<!-- at:main -->\n<!-- /at:main -->'
        head = re.sub(r'[ \t]*<style\b[^>]*>.*?</style>[ \t]*\n?', '', head, flags=re.S)
        if '<base ' not in head:
            # the error page is served for any missing path, however deep
            head = head.replace('<meta charset', '<base href="/" />\n    <meta charset', 1)
    elif '<main' in body:
        main = body[body.index('<main'):body.index('</main>') + len('</main>')]
    else:
        start = body.index('</header>') + len('</header>')
        main = '<main id="main">\n' + body[start:body.index('<footer')].strip() + '\n</main>'
    cls = 'at-page at-legacy' + (' at-notfound-page' if filename == '404.html' else '')
    parts = [
        f'<body class="{cls}">',
        region('header', ''),
        main,
        region('footer', ''),
        region('scripts', ''),
        '</body>',
        '</html>',
        '',
    ]
    return head.rstrip() + '\n</head>\n\n' + '\n'.join(parts)


def build_legacy(page):
    previous = page.read_text(encoding='utf-8')
    html = previous
    if '<!-- at:header -->' not in html:
        html = convert_legacy(html, page.name)
    in_blog = 'blog-details-page' in html or 'class="blog-page' in html
    header = HEADER
    if in_blog:
        link = 'href="blog.html" data-i18n="shared.nav.'
        header = header.replace(link, 'aria-current="%s" ' % ('page' if page.name == 'blog.html' else 'true') + link)
    if 'function gtag' not in html:
        # cookie-consent.js calls gtag(); a page without the consent-mode stub
        # (the old 404 loaded no scripts at all) would throw on load
        html = html.replace('<!-- at:head -->', CONSENT_STUB + '<!-- at:head -->', 1)
    html = set_region(html, 'head', LEGACY_HEAD)
    html = set_region(html, 'header', header)
    html = set_region(html, 'footer', FOOTER)
    if '<!-- at:main -->' in html:
        html = set_region(html, 'main', render(read(page.stem + '-main.html')).rstrip())
    scripts = []
    for script in LEGACY_SCRIPTS:
        dictionary = ' data-translations="assets/js/translations.js"' if script == 'i18n' else ''
        scripts.append(f'    <script defer src="assets/js/{script}.js"{dictionary}></script>')
    html = set_region(html, 'scripts', '\n'.join(scripts))
    if html != previous:
        page.write_text(html, encoding='utf-8')
        print(f'  wrote {page.name}')


if __name__ == '__main__':
    for filename, name in PAGES.items():
        build_page(filename, name)
    for page in sorted(ROOT.glob('*.html')):
        if page.name not in LEGACY_SKIP:
            build_legacy(page)
