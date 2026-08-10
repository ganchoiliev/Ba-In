#!/usr/bin/env python3
"""
bg-sentence-case.py — stop the template title-casing Bulgarian.

The "mediox" template sets `text-transform: capitalize` on ~148 rules:
headings, buttons, menu items, category chips, widget titles. In English
that is a normal marketing convention. In Bulgarian it is an orthography
error — Bulgarian uses sentence case for titles, so the template turns

    Разликата, която се вижда   ->   Разликата, Която Се Вижда
    Прочети повече              ->   Прочети Повече
    Последни публикации         ->   Последни Публикации

which reads like machine translation on a page written by a native speaker.

Rather than editing 148 vendor declarations (lost on any template update)
or firing a blanket `* { text-transform: none !important }` (which would
also kill the intentional `uppercase` rules), this reads the template's OWN
capitalize selectors and re-emits exactly that set, prefixed with
html[lang="bg"], into custom.css.

  - Complete: every capitalized selector is covered, none are guessed.
  - Surgical: uppercase rules are untouched.
  - No !important: the html[lang="bg"] prefix adds (0,1,1) of specificity
    and custom.css loads last, so it wins on merit.
  - Language-correct: English keeps title case. i18n.js writes
    document.documentElement.lang on toggle, so this flips live.

Idempotent — re-run after any template change to regenerate the block.
Usage:  python3 scripts/bg-sentence-case.py
"""
import re, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSS = ROOT / 'assets/css'
TARGET = CSS / 'custom.css'
SOURCES = ['mediox.css', 'mediox-landing.css', 'critical.css']

START = '/* === BEGIN GENERATED: bg-sentence-case.py — do not edit by hand === */'
END   = '/* === END GENERATED: bg-sentence-case.py === */'

RULE = re.compile(r'([^{}]+)\{([^{}]*)\}')

selectors, seen = [], set()
for name in SOURCES:
    f = CSS / name
    if not f.exists():
        print(f"  ! {name} missing, skipped"); continue
    text = f.read_text(encoding='utf-8')
    n = 0
    for m in RULE.finditer(text):
        body = m.group(2)
        if not re.search(r'text-transform\s*:\s*capitalize', body):
            continue
        sel = m.group(1)
        # inside @media/@supports the capture picks up the at-rule prelude
        sel = sel.rsplit('{', 1)[-1]
        sel = re.sub(r'/\*.*?\*/', '', sel, flags=re.S).strip()
        if not sel or sel.startswith('@'):
            continue
        for part in sel.split(','):
            p = ' '.join(part.split())
            # a rule already scoped to another language must not be re-scoped
            if not p or 'lang=' in p:
                continue
            if p not in seen:
                seen.add(p); selectors.append(p); n += 1
    print(f"  {name}: {n} capitalized selectors")

if not selectors:
    sys.exit("no capitalize rules found — template changed?")

selectors.sort()
block = [
    START,
    '/* Bulgarian uses sentence case for titles; the template capitalizes every',
    '   word. Generated from the template\'s own capitalize rules — regenerate',
    '   with  python3 scripts/bg-sentence-case.py  after any template update.',
    f'   {len(selectors)} selectors, scoped so English keeps its title case. */',
]
block.append(',\n'.join(f'html[lang="bg"] {s}' for s in selectors) + ' {')
block.append('  text-transform: none;')
block.append('}')
block.append(END)
new = '\n'.join(block) + '\n'

css = TARGET.read_text(encoding='utf-8')
if START in css and END in css:
    css = re.sub(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', new, css, flags=re.S)
    action = 'regenerated'
else:
    css = css.rstrip() + '\n\n' + new
    action = 'appended'
TARGET.write_text(css, encoding='utf-8')
print(f"✓ custom.css {action}: {len(selectors)} selectors -> text-transform: none under html[lang=\"bg\"]")
