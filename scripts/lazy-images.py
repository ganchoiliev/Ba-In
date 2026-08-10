#!/usr/bin/env python3
"""
lazy-images.py — apply the site's own lazy-loading convention sitewide.

index.html and gallery.html already did this (72/76 and 194/201 images lazy);
the other 33 pages did not, leaving 408 images fetched eagerly on load.

RULE — an <img> stays EAGER when any of these hold:
  * its src or class mentions a logo. Logos are 5-8 KB, frequently sit in the
    header above the fold, and deferring them buys nothing while risking a
    visible pop-in.
  * it carries fetchpriority, i.e. it was deliberately marked as the LCP.
  * it is the first real <img> in the document.
Everything else gets loading="lazy" decoding="async".

TWO TRAPS, both hit during development:
  * <img> tags appear INSIDE HTML comments (index.html has
    `<!-- Hero image now uses <img fetchpriority="high"> ... -->`). Matching
    naively lets a commented tag consume the "first image" slot, which is how
    index.html's real header logo got deferred on the first run. Comments are
    stripped before matching.
  * Lazy-loading is safe above the fold: an <img loading="lazy"> inside the
    initial viewport is still fetched immediately. The rule only defers what
    is genuinely off-screen. The logo carve-out is about priority, not
    correctness.

Idempotent. Usage: python3 scripts/lazy-images.py [--dry-run]
"""
import re, sys, glob, os

DRY = '--dry-run' in sys.argv
os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

IMG = re.compile(r'<img\b[^>]*>', re.I)
COMMENT = re.compile(r'<!--.*?-->', re.S)
LOGO = re.compile(r'logo', re.I)

rows, total = [], 0

for path in sorted(glob.glob('*.html')):
    src = open(path, encoding='utf-8').read()
    if 'jquery-3.7.0' not in src:
        continue

    # Spans occupied by comments, so tags inside them are never treated as real.
    blanked = COMMENT.sub(lambda m: ' ' * len(m.group(0)), src)
    real = {m.start() for m in IMG.finditer(blanked)}

    seen = 0
    n = 0

    def fix(m):
        global seen, n
        tag = m.group(0)
        if m.start() not in real:          # inside a comment — not an image
            return tag
        seen += 1
        if seen == 1:                      # first real image on the page
            return tag
        if 'loading=' in tag or 'fetchpriority' in tag or LOGO.search(tag):
            return tag
        n += 1
        extra = ' loading="lazy"' + ('' if 'decoding=' in tag else ' decoding="async"')
        stripped = tag.rstrip()
        self_closing = stripped.endswith('/>')
        body = stripped[:-2] if self_closing else stripped[:-1]
        return body.rstrip() + extra + ('/>' if self_closing else '>')

    out = IMG.sub(fix, src)
    if n:
        rows.append((path, n))
        total += n
        if not DRY:
            open(path, 'w', encoding='utf-8').write(out)

for p, n in sorted(rows, key=lambda r: -r[1]):
    print(f'  {p:<36}{n:>4} deferred')
print(f'\n{total} images across {len(rows)} pages{"  (DRY RUN)" if DRY else ""}')
