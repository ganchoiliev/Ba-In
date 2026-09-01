#!/usr/bin/env python3
"""
cache-bust.py — stamp every local CSS/JS reference with a content hash.

WHY THIS EXISTS (2026-08-10). The homepage rendered as a column of giant
unstyled images for anyone who had visited before. Nothing was broken in the
code — the markup, the CSS and the JS on the server were all correct and all
parsed. The failure was entirely in caching:

  .htaccess:  Cache-Control: public, max-age=31536000, immutable   (1 year)
  index.html: assets/css/custom.css?v=6                            (never bumped)
              assets/js/mediox.js                                  (no version)

`immutable` tells the browser not to revalidate even on a normal reload. So a
returning visitor kept a year-old custom.css while receiving brand-new HTML
that referenced .ba-services / .ba-results — classes their cached stylesheet
had never heard of. New markup, old rules, no grid, everything stacks.

Only 3 of 28 referenced assets carried a version query at all, and mediox.js
and i18n.js — both edited that day — carried none, so every returning visitor
was still executing the old scripts.

Hand-maintained ?v= numbers fail the moment someone forgets, and someone
always forgets. The version is therefore derived from the file itself: change
the file, the URL changes, the cache misses, the visitor gets the new asset.
Nothing to remember. `immutable` becomes correct rather than dangerous,
because a given URL now really is immutable.

Idempotent — unchanged files keep their hash and produce no diff.
Usage:  python3 scripts/cache-bust.py [--check]
"""
import re, sys, glob, hashlib, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
# Images are served under the same immutable policy as CSS and JS, so replacing
# an image's bytes at a stable path has exactly the failure the header comment
# describes. Proven on 2026-08-10: the lamination hero was swapped for a real
# client photograph at the same URL, and every visitor who had loaded the blog
# earlier that day would have kept the previous file for a year.
REF = re.compile(
    r'(?P<attr>href|src)="(?P<path>assets/[^"?#]+\.(?:css|js|webp|jpg|jpeg|png|svg|ico|woff2))'
    r'(?P<query>\?[^"#]*)?"'
)
CHECK = '--check' in sys.argv

_hash = {}
def digest(rel):
    if rel not in _hash:
        f = ROOT / rel
        _hash[rel] = hashlib.sha256(f.read_bytes()).hexdigest()[:8] if f.exists() else None
    return _hash[rel]

changed_files, rewrites, missing = 0, 0, collections.Counter()

for html in sorted(ROOT.glob('*.html')):
    src = html.read_text(encoding='utf-8')

    def sub(m):
        global rewrites
        rel, h = m['path'], digest(m['path'])
        if h is None:
            missing[rel] += 1
            return m.group(0)
        new = f'{m["attr"]}="{rel}?v={h}"'
        if new != m.group(0):
            rewrites += 1
        return new

    out = REF.sub(sub, src)

    # translations.js is injected by i18n.js, not referenced from the HTML, so
    # the loop above never sees it. Stamp its hash onto the i18n.js tag as
    # data-translations; i18n.js prefers that over the path it derives.
    tr = next((p for p in _hash | {'assets/js/translations.js': None}
               if p.endswith('translations.js')), 'assets/js/translations.js')
    th = digest('assets/js/translations.js')
    if th:
        def stamp(m):
            tag, path = m.group(0), m.group('p')
            rel = path.replace('i18n.js', 'translations.js').split('?')[0]
            want = f'data-translations="{rel}?v={th}"'
            if 'data-translations=' in tag:
                return re.sub(r'data-translations="[^"]*"', want, tag)
            return tag[:-1].rstrip() + ' ' + want + '>'
        out = re.sub(r'<script[^>]*src="(?P<p>[^"]*i18n\.js[^"]*)"[^>]*>', stamp, out)
    if out != src:
        changed_files += 1
        if not CHECK:
            html.write_text(out, encoding='utf-8')

print(f"{'would rewrite' if CHECK else 'rewrote'} {rewrites} references across {changed_files} pages")
print(f"{len(_hash)} distinct assets hashed")
if missing:
    print("\n!! referenced but not on disk:")
    for rel, n in missing.most_common():
        print(f"   {rel}  ({n} pages)")

if CHECK and changed_files:
    print("\nHTML is out of date with the assets it references.")
    sys.exit(1)
