#!/usr/bin/env python3
"""
img-dimensions.py — give every <img> its intrinsic width/height attributes.

WHY (2026-09-03). A layout-shift trace on index.html (mobile) attributed a
0.06 shift to the "about" column: its photo had no width/height, so the box
was 30px tall until the file arrived, then 468px. The browser can only reserve
space for an image it knows the size of. With width/height set and the site's
existing `img{max-width:100%;height:auto}`, the aspect ratio is reserved at
first layout and nothing moves when bytes land.

Reads the real pixel size of each local image with Pillow. Skips <img> tags
that already carry width or height, SVGs, data: URIs, remote URLs, and tags
inside HTML comments. Idempotent.

Usage:  python3 scripts/img-dimensions.py
"""
import re, glob, pathlib
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
TAG = re.compile(r'<img\b[^>]*>', re.I)
SRC = re.compile(r'\bsrc="([^"]+)"', re.I)
COMMENT = re.compile(r'<!--.*?-->', re.S)
_dims = {}

def dims(rel):
    if rel not in _dims:
        p = ROOT / rel
        try:
            with Image.open(p) as im: _dims[rel] = im.size
        except Exception:
            _dims[rel] = None
    return _dims[rel]

total_pages = total_imgs = 0
for html in sorted(ROOT.glob('*.html')):
    src = html.read_text(encoding='utf-8')
    comments = [(m.start(), m.end()) for m in COMMENT.finditer(src)]
    def in_comment(pos): return any(a <= pos < b for a, b in comments)
    count = 0
    def fix(m):
        global count
        tag = m.group(0)
        if in_comment(m.start()) or re.search(r'\b(width|height)=', tag): return tag
        s = SRC.search(tag)
        if not s: return tag
        url = s.group(1).split('?')[0].split('#')[0]
        if url.startswith(('http', '//', 'data:')) or url.lower().endswith('.svg'): return tag
        d = dims(url)
        if not d: return tag
        count += 1
        return tag[:-1].rstrip('/').rstrip() + f' width="{d[0]}" height="{d[1]}"' + ('>' if not tag.endswith('/>') else ' />')
    out = TAG.sub(fix, src)
    if count:
        html.write_text(out, encoding='utf-8'); total_pages += 1; total_imgs += count
        print(f'  {html.name}: {count} images sized')
print(f'img-dimensions: {total_imgs} images across {total_pages} pages')
