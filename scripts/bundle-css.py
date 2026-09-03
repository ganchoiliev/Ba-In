#!/usr/bin/env python3
"""
bundle-css.py — collapse the stylesheet waterfall into two files.

WHY (2026-09-03, PSI desktop CLS 0.128, Agentic browsing 1/3). index.html loads
the theme CSS asynchronously (media="print" onload="this.media='all'"), one
<link> per file. Each file applies the moment IT arrives, so the page passes
through intermediate layouts: bootstrap lands (container 1320 -> 1326, hero
1200 -> 1140), ~900 ms later mediox.css lands and puts everything back.
Measured with a layout-shift observer: two shifts, 0.07 + 0.20. The inline
critical CSS already matches the FINAL layout — only the in-between state
moves anything. One async file applies atomically, so there is no in-between.

Also: five small sync sheets (ai-chat, cookie-consent, contact-widget,
google-reviews, custom) cost five round-trips on the critical path (PSI
mobile: 730 ms est. savings). One sync file instead.

Sources stay where they are and stay editable; this regenerates the bundles.
Relative url() references are rewritten so fonts/images resolve from the
bundle's directory. Idempotent. Run BEFORE scripts/cache-bust.py.

Usage:  python3 scripts/bundle-css.py
"""
import re, glob, os, pathlib, posixpath

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = 'assets/css'

THEME = [  # async on index.html — applied atomically
    'assets/vendors/bootstrap/css/bootstrap.min.css',
    'assets/vendors/bootstrap-select/bootstrap-select.min.css',
    'assets/vendors/fontawesome/css/fa-subset.min.css',
    'assets/vendors/jarallax/jarallax.css',
    'assets/vendors/jquery-magnific-popup/jquery.magnific-popup.css',
    'assets/vendors/mediox-icons/style.css',
    'assets/vendors/owl-carousel/css/owl.carousel.min.css',
    'assets/vendors/owl-carousel/css/owl.theme.default.min.css',
    'assets/css/mediox.css',
    'assets/css/i18n.css',
]
SITE = [  # sync everywhere
    'assets/css/ai-chat.css',
    'assets/css/cookie-consent.css',
    'assets/css/contact-widget.css',
    'assets/css/google-reviews.css',
    'assets/css/custom.css',
]

URL_RE = re.compile(r'url\(\s*(["\']?)([^"\')]+)\1\s*\)')

def rebase(css, src_path):
    src_dir = posixpath.dirname(src_path)
    def fix(m):
        q, ref = m.group(1), m.group(2).strip()
        if ref.startswith(('data:', 'http://', 'https://', '//', '#', '/')):
            return m.group(0)
        abs_ref = posixpath.normpath(posixpath.join(src_dir, ref))
        rel = posixpath.relpath(abs_ref, OUT_DIR)
        return f'url({q}{rel}{q})'
    return URL_RE.sub(fix, css)

def build(files, out_name):
    parts = []
    for f in files:
        p = ROOT / f
        if not p.exists():
            print(f'  ! missing {f}'); continue
        css = p.read_text(encoding='utf-8', errors='replace')
        css = re.sub(r'^\s*@charset[^;]*;', '', css)
        parts.append(f'/* ==== {f} ==== */\n' + rebase(css, f))
    out = ROOT / OUT_DIR / out_name
    data = '\n'.join(parts) + '\n'
    if not out.exists() or out.read_text(encoding='utf-8') != data:
        out.write_text(data, encoding='utf-8')
        print(f'  wrote {out_name} ({len(data)//1024} KiB)')
    else:
        print(f'  {out_name} unchanged')

build(THEME, 'theme.bundle.css')
build(SITE, 'site.bundle.css')

LINK = re.compile(r'[ \t]*<link rel="stylesheet" href="(assets/[^"?]+)(\?v=[0-9a-f]+)?"([^>]*)/?>\s*\n?')
theme_set, site_set = set(THEME), set(SITE)

changed = 0
for html in sorted(glob.glob(str(ROOT / '*.html'))):
    s = pathlib.Path(html).read_text(encoding='utf-8')
    if 'site.bundle.css' in s:
        continue  # already bundled
    async_theme = 'bootstrap.min.css' in s and 'media="print"' in s
    head_end = s.find('</head>')
    head = s[:head_end]
    found_theme = found_site = False
    first_pos = None
    def repl(m):
        global found_theme, found_site, first_pos
        href = m.group(1)
        if href in site_set:
            found_site = True
            if first_pos is None: first_pos = m.start()
            return '\x00SITE\x00'
        if async_theme and href in theme_set:
            found_theme = True
            if first_pos is None: first_pos = m.start()
            return '\x00THEME\x00'
        return m.group(0)
    new_head = LINK.sub(repl, head)
    if not (found_site or found_theme):
        continue
    # drop the noscript duplicates of theme files on async pages
    if async_theme:
        new_head = re.sub(r'\s*<noscript>\s*(?:<link rel="stylesheet" href="assets/[^"]+"\s*/?>\s*)+</noscript>', '', new_head)
    theme_tag = ('    <link rel="stylesheet" href="assets/css/theme.bundle.css" media="print" onload="this.media=\'all\'" />\n'
                 '    <noscript><link rel="stylesheet" href="assets/css/theme.bundle.css" /></noscript>\n') if found_theme else ''
    site_tag = '    <link rel="stylesheet" href="assets/css/site.bundle.css" />\n'
    # theme first in DOM (cascade order: site/custom must win), then site
    first_marker = True
    def place(m):
        global first_marker
        if first_marker:
            first_marker = False
            return theme_tag + site_tag
        return ''
    new_head = re.sub('\x00(THEME|SITE)\x00', place, new_head)
    pathlib.Path(html).write_text(new_head + s[head_end:], encoding='utf-8')
    changed += 1
    print(f'  rewrote {os.path.basename(html)} ({"theme+site" if found_theme else "site"})')
print(f'bundle-css: {changed} pages rewritten')
