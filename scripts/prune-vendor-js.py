#!/usr/bin/env python3
"""
prune-vendor-js.py — per-page JavaScript payload surgery for ba-in.com

CONTEXT
Every page loaded the same 498 KB of JavaScript regardless of what it used.
mediox.js guards every plugin call by element presence (`$('.x').length &&
$('.x').plugin()`), which the template already relies on: it contains
call-sites for noUiSlider, WOW, slick, datepicker, circleProgress and
circleType whose vendor scripts are not loaded at all, and the site works.
That guard style is what makes per-page pruning safe — a vendor whose trigger
elements are absent from a page can be dropped from that page.

WHAT IT DOES, per page
  1. Drops vendor <script> tags whose trigger selectors do not appear.
  2. Drops the eager translations.js tag — i18n.js now fetches it on demand.
  3. Adds `defer` to every remaining external script.
  4. Wraps inline blocks that call jQuery immediately, because deferred
     scripts execute AFTER inline ones and `(function($){...})(jQuery)` would
     otherwise throw ReferenceError.
  5. Removes the hreflang alternates, which declared bg/en/x-default all
     pointing at one URL — an English URL that does not exist.

Idempotent: running it twice changes nothing the second time.
Usage:  python3 scripts/prune-vendor-js.py [--dry-run]
"""
import re
import sys
import glob
import os

DRY = '--dry-run' in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# vendor path fragment -> (label, byte size, regex of trigger tokens)
# A vendor is KEPT when its trigger regex matches the page's own markup.
VENDORS = [
    ('bootstrap/js/bootstrap.bundle.min.js',        'bootstrap',  80421, r'data-bs-|data-toggle=|selectpicker'),
    ('bootstrap-select/bootstrap-select.min.js',    'bs-select',  57744, r'selectpicker'),
    ('jarallax/jarallax.min.js',                    'jarallax',   15498, r'jarallax'),
    ('jquery-ajaxchimp/jquery.ajaxchimp.min.js',    'ajaxchimp',   2381, r'mc-form'),
    ('jquery-appear/jquery.appear.min.js',          'appear',      1266, r'count-bar|count-box|odometer|circle-progress'),
    ('jquery-magnific-popup/jquery.magnific-popup.min.js', 'magnific', 20216, r'video-popup|img-popup|magnificPopup'),
    ('jquery-validate/jquery.validate.min.js',      'validate',   21090, r'contact-form-validated'),
    ('owl-carousel/js/owl.carousel.min.js',         'owl',        44342, r'mediox-owl__carousel|owlCarousel'),
]
TRANSLATIONS_BYTES = 145735

SCRIPT_SRC = re.compile(r'[ \t]*<script\b[^>]*\bsrc="([^"]+)"[^>]*>\s*</script>[ \t]*\n?', re.I)
INLINE = re.compile(r'<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>', re.S | re.I)
HREFLANG = re.compile(r'[ \t]*<link\b[^>]*\brel="alternate"[^>]*\bhreflang="[^"]*"[^>]*>[ \t]*\n?', re.I)
IMMEDIATE_JQUERY = re.compile(r'\)\s*\(\s*jQuery\s*\)\s*;?\s*$')

report = []

for path in sorted(glob.glob('*.html')):
    src = open(path, encoding='utf-8').read()
    if 'jquery-3.7.0' not in src:
        continue
    original = src

    # Markup the page actually renders: strip external scripts and <link>s so
    # a vendor's own filename cannot count as evidence that it is used.
    markup = SCRIPT_SRC.sub('', src)
    markup = re.sub(r'<link[^>]*>', '', markup)

    dropped, saved = [], 0

    # 1 + 2 — remove unused vendors and the eager translations tag
    def drop_tag(m):
        global saved
        s = m.group(1)
        if s.endswith('js/translations.js'):
            dropped.append('translations')
            saved += TRANSLATIONS_BYTES
            return ''
        for frag, label, size, trigger in VENDORS:
            if frag in s and not re.search(trigger, markup, re.I):
                dropped.append(label)
                saved += size
                return ''
        return m.group(0)

    src = SCRIPT_SRC.sub(drop_tag, src)

    # 3 — defer everything that remains
    def add_defer(m):
        tag = m.group(0)
        if re.search(r'\b(defer|async)\b', tag):
            return tag
        return tag.replace('<script ', '<script defer ', 1)

    src = SCRIPT_SRC.sub(add_defer, src)

    # 4 — inline blocks that touch jQuery at execution time must wait for the
    #     deferred bundle. DOMContentLoaded fires after all deferred scripts.
    wrapped = 0

    def wrap_inline(m):
        global wrapped
        attrs, body = m.group(1), m.group(2)
        if 'ld+json' in attrs.lower():
            return m.group(0)
        if 'DOMContentLoaded' in body and body.lstrip().startswith('document.addEventListener'):
            return m.group(0)  # already wrapped — idempotence
        if not IMMEDIATE_JQUERY.search(body.strip()):
            return m.group(0)
        wrapped += 1
        indented = '\n'.join(('    ' + ln if ln.strip() else ln) for ln in body.strip().split('\n'))
        return ('<script%s>\n/* deferred bundle: wait for jQuery before running */\n'
                'document.addEventListener(\'DOMContentLoaded\', function () {\n%s\n});\n</script>'
                % (attrs, indented))

    src = INLINE.sub(wrap_inline, src)

    # 5 — the hreflang set asserted an English URL that does not exist
    hreflang_removed = len(HREFLANG.findall(src))
    src = HREFLANG.sub('', src)

    if src != original:
        if not DRY:
            open(path, 'w', encoding='utf-8').write(src)
        report.append((path, saved, dropped, wrapped, hreflang_removed))

print(f"{'PAGE':<34}{'JS cut':>9}   wrapped  hreflang  vendors dropped")
print('-' * 116)
total = 0
for path, saved, dropped, wrapped, hl in sorted(report, key=lambda r: -r[1]):
    total += saved
    vend = ', '.join(d for d in dropped if d != 'translations')
    print(f"{path:<34}{saved // 1024:>7}KB{wrapped:>10}{hl:>10}  {vend or '—'}")
print('-' * 116)
print(f"{len(report)} pages, {total // 1024} KB of JavaScript removed"
      f"{'  (DRY RUN — nothing written)' if DRY else ''}")
