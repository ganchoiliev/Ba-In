#!/usr/bin/env python3
"""
social-cards.py — make every page share correctly on Facebook.

Found while preparing a post to boost: laminirane-vezhdi-migli.html carried

    <meta property="og:image" content="assets/images/blog/...-hero.jpg">

a RELATIVE path. The Open Graph spec requires an absolute URL; Facebook's
crawler does not reliably resolve relative ones, so the share renders as a
bare text link with no image. Paying to boost that is paying for a worse ad.

This normalises the whole set, idempotently:

  * og:image -> absolute https://ba-in.com/... (2 pages were relative)
  * og:image:width / :height  - without these Facebook must fetch and measure
    the file before it can choose a layout, so the FIRST share of a new link
    often renders as a small square thumb even when the image is wide enough.
    Declaring them gets the large card on the first scrape.
  * og:image:alt, og:site_name, og:locale, og:title, og:description
  * twitter:card = summary_large_image, twitter:image

Usage:  python3 scripts/social-cards.py
"""
import re, glob, os, struct, html, pathlib

SITE = 'https://ba-in.com/'
NAME = 'Beauty Atelier IN'

def dims(p):
    try:
        head = open(p, 'rb').read(32)
        if head[:2] == b'\xff\xd8':
            f = open(p, 'rb'); f.read(2)
            while True:
                b = f.read(1)
                while b and b != b'\xff': b = f.read(1)
                while b == b'\xff': b = f.read(1)
                if not b: return None
                if b[0] in range(0xC0, 0xC4):
                    f.read(3); h, w = struct.unpack('>HH', f.read(4)); return w, h
                f.read(struct.unpack('>H', f.read(2))[0] - 2)
        if head[:8] == b'\x89PNG\r\n\x1a\n':
            return struct.unpack('>II', head[16:24])
        if head[:4] == b'RIFF' and head[8:12] == b'WEBP':
            b = open(p, 'rb').read(40)
            if b[12:16] == b'VP8X':
                return int.from_bytes(b[24:27],'little')+1, int.from_bytes(b[27:30],'little')+1
            if b[12:16] == b'VP8 ':
                return struct.unpack('<H', b[26:28])[0] & 0x3fff, struct.unpack('<H', b[28:30])[0] & 0x3fff
            if b[12:16] == b'VP8L':
                n = int.from_bytes(b[21:25], 'little')
                return (n & 0x3fff)+1, ((n >> 14) & 0x3fff)+1
    except Exception:
        return None
    return None

def meta(s, key):
    m = re.search(r'<meta[^>]*(?:property|name)="' + re.escape(key) + r'"[^>]*content="([^"]*)"', s)
    return m.group(1) if m else None

changed = 0
report = []
for f in sorted(glob.glob('*.html')):
    s = open(f, encoding='utf-8').read()
    orig = s
    notes = []

    # ── og:image absolute ────────────────────────────────────────────
    img = meta(s, 'og:image')
    if img and not img.startswith('http'):
        s = s.replace(f'content="{img}"', f'content="{SITE}{img.lstrip("/")}"')
        notes.append('og:image -> absolute')
        img = SITE + img.lstrip('/')
    if not img:
        continue                                   # nothing to hang a card on

    local = img.replace(SITE, '')
    wh = dims(local) if os.path.exists(local) else None

    # ── anchor: insert new tags right after the og:image tag ─────────
    anchor = re.search(r'[ \t]*<meta[^>]*property="og:image"[^>]*>\n', s)
    if not anchor:
        continue
    indent = re.match(r'[ \t]*', anchor.group(0)).group(0)
    add = []

    def want(key, value, attr='property'):
        if value and meta(s, key) is None:
            add.append(f'{indent}<meta {attr}="{key}" content="{html.escape(value, quote=True)}" />')
            notes.append(key)

    if wh:
        want('og:image:width', str(wh[0]))
        want('og:image:height', str(wh[1]))

    title = meta(s, 'og:title')
    if not title:
        m = re.search(r'<title>(.*?)</title>', s, re.S)
        title = ' '.join(m.group(1).split()) if m else None
    desc = meta(s, 'og:description') or meta(s, 'description')

    want('og:title', title)
    want('og:description', desc)
    want('og:site_name', NAME)
    want('og:locale', 'bg_BG')
    want('og:image:alt', (title or NAME).split('|')[0].strip())
    want('twitter:card', 'summary_large_image', 'name')
    want('twitter:image', img, 'name')
    want('twitter:title', title, 'name')
    want('twitter:description', desc, 'name')

    if add:
        s = s.replace(anchor.group(0), anchor.group(0) + '\n'.join(add) + '\n', 1)

    if s != orig:
        open(f, 'w', encoding='utf-8').write(s)
        changed += 1
        report.append((f, notes))

print(f"✓ {changed} pages updated")
for f, n in report[:6]:
    print(f"   {f:42} +{len(n)}: {', '.join(n[:4])}{' …' if len(n) > 4 else ''}")
if len(report) > 6:
    print(f"   … and {len(report)-6} more")
