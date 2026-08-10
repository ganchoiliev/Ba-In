#!/usr/bin/env python3
"""
bg-capitalise-labels.py — move casing from the stylesheet into the content.

Companion to bg-sentence-case.py. That script stops the template
title-casing Bulgarian; this one fixes what the template was papering over.

~90 distinct Bulgarian labels are authored lowercase in the markup and in the
BG dictionary — "новини", "свържи се с нас", "категории:", "от И. Николаева" —
and only render with a capital because `text-transform: capitalize` was doing
it. Remove the transform and they render lowercase. So the capital has to
live where it belongs: in the text.

Sentence case, not title case: the FIRST letter only. "новини и промоции"
becomes "Новини и промоции", never "Новини И Промоции".

Continuations are skipped. In `<h2>блог & <span>новини</span></h2>` the span
is mid-phrase, so it stays lowercase and the heading reads "Блог & новини".

Idempotent. Usage:  python3 scripts/bg-capitalise-labels.py
"""
import re, glob, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TAGS = r'(?:h1|h2|h3|h4|h5|h6|a|button|li|span|p|strong|em|td|th|label|figcaption)'
OPEN = re.compile(r'(<' + TAGS + r'(?:\s[^<>]*)?>)(\s*)([а-я])')
# a preceding character that means "this element continues a phrase"
CONT = re.compile(r'[A-Za-zА-Яа-я0-9&,–—:\-]\s*$')

def strip_tags(x):
    return re.sub(r'<[^<>]*>', '', x)

def fix_html(text):
    out, pos, n = [], 0, 0
    for m in OPEN.finditer(text):
        # what visible text precedes this element inside the document?
        before = strip_tags(text[max(0, m.start() - 400):m.start()])
        if CONT.search(before):
            continue                                   # mid-phrase, leave it
        out.append(text[pos:m.start()])
        out.append(m.group(1) + m.group(2) + m.group(3).upper())
        pos = m.end(); n += 1
    out.append(text[pos:])
    return ''.join(out), n

# ── HTML ─────────────────────────────────────────────────────────────
total_files = total_fixes = 0
for f in sorted(glob.glob(str(ROOT / '*.html'))):
    src = pathlib.Path(f).read_text(encoding='utf-8')
    # never touch commented-out markup
    holes, keep = [], []
    def stash(m):
        holes.append(m.group(0)); return f'\x00{len(holes)-1}\x00'
    body = re.sub(r'<!--.*?-->', stash, src, flags=re.S)
    body, n = fix_html(body)
    body = re.sub(r'\x00(\d+)\x00', lambda m: holes[int(m.group(1))], body)
    if n:
        pathlib.Path(f).write_text(body, encoding='utf-8')
        total_files += 1; total_fixes += n
print(f"✓ HTML: {total_fixes} labels capitalised across {total_files} files")

# ── BG dictionary (must agree, or an EN->BG toggle restores lowercase) ──
p = ROOT / 'assets/js/translations.js'
s = p.read_text(encoding='utf-8')
cut = s.find('\n  en:')
if cut < 0:
    cut = s.find("  en: {")
if cut < 0:
    sys.exit("! could not locate the EN block boundary — dictionary untouched")

def bump(m):
    return f"{m.group(1)}{m.group(2).upper()}"

bg, en = s[:cut], s[cut:]
bg, k = re.subn(r"(:\s*')([а-я])", bump, bg)
p.write_text(bg + en, encoding='utf-8')
print(f"✓ translations.js: {k} BG values capitalised (EN block untouched)")
