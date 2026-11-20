#!/usr/bin/env python3
"""
bundle-css.py — build assets/css/home.bundle.css, the one sync stylesheet
every page loads.

WHY ONE FILE. Each separate <link> is a round-trip on the critical path, and
stylesheets that arrive one after another apply one after another, so the page
passes through in-between layouts (measured on the old theme, 2026-09-03: CLS
0.128 from two shifts). One file applies atomically.

HISTORY. Until 2026-11 this also built theme.bundle.css (Bootstrap, Font
Awesome, the Mediox theme: 700 KiB) and site.bundle.css, and rewrote the
<link> tags of pages still on that theme. The last of those pages moved to
the atelier design on 2026-11-20 and the theme files were deleted, so that
half of the script went with them.

Sources stay where they are and stay editable; this regenerates the bundle.
Relative url() references are rewritten so they resolve from the bundle's
directory. Idempotent. Run BEFORE scripts/cache-bust.py.

Usage:  python3 scripts/bundle-css.py
"""
import re, pathlib, posixpath

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT_DIR = 'assets/css'

HOME = [
    'assets/css/atelier.css',
    'assets/css/ai-chat.css',
    'assets/css/cookie-consent.css',
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
            raise SystemExit(f'bundle-css: missing source {f}')
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

build(HOME, 'home.bundle.css')
