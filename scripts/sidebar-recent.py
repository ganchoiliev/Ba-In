#!/usr/bin/env python3
"""
sidebar-recent.py — rebuild the "Последни публикации" sidebar on every article page.

The sidebar was hand-coded per page and drifted: new articles never appeared in it,
so the newest posts did not cross-link. This reads the card order in blog.html
(the single source of truth for dates/titles/images), takes the 3 newest posts
excluding the page itself, and rewrites the <ul class="sidebar__posts"> block.
Idempotent. Run after adding a card to blog.html, then scripts/cache-bust.py.
Usage:  python3 scripts/sidebar-recent.py
"""
import re, glob, html
blog = open('blog.html', encoding='utf-8').read()
cards = re.findall(r'<div class="col-md-12" data-category="[^"]*">(.*?)</div>\s*</div>\s*</div>', blog, re.S)
posts = []
for c in cards:
    href = re.search(r'<h3 class="blog-card-four__title"><a href="([^"]+)">([^<]+)</a>', c)
    img = re.search(r'<img src="(assets/images/blog/[^"]+)', c)
    date = re.search(r'datetime="([0-9-]+)"', c)
    if href and img and date:
        posts.append((date.group(1), href.group(1), html.unescape(href.group(2)), img.group(1)))
posts.sort(reverse=True)
SHORT = {
 'kola-maska-shokolad.html': 'Кола маска с шоколад: защо е по-нежна за лицето',
 'zola-laminirane-migli.html': 'Ламиниране с ZOLA: какво прави продуктът с миглите',
 'phibrows-vs-microblading.html': 'PhiBrows или обикновен микроблейдинг',
 'antiage-protseduri-30-40-50.html': 'Антиейдж грижа на 30, 40 и 50',
}
def short(h, t):
    if h in SHORT: return SHORT[h]
    return t if len(t) <= 48 else t[:48].rsplit(' ', 1)[0] + '…'
def item(d, h, t, i):
    return f'''                                        <li class="sidebar__posts__item">
                                            <div class="sidebar__posts__image">
                                                <img src="{i}" style="width:70px;height:70px;object-fit:cover;" alt="{html.escape(t)}" loading="lazy" decoding="async">
                                            </div>
                                            <div class="sidebar__posts__content">
                                                <div class="sidebar__posts__meta"><a href="about.html"><span class="sidebar__posts__meta__icon"><i class="icon-user"></i></span><span data-i18n="blog.meta.author">От И. Николаева</span></a></div>
                                                <h4 class="sidebar__posts__title"><a href="{h}">{html.escape(short(h, t))}</a></h4>
                                            </div>
                                        </li>
'''
pat = re.compile(r'(<ul class="sidebar__posts list-unstyled">\n)(.*?)(\s*</ul>)', re.S)
changed = 0
for f in sorted(glob.glob('*.html')):
    s = open(f, encoding='utf-8').read()
    if 'sidebar__posts-wrapper' not in s: continue
    pick = [p for p in posts if p[1] != f][:3]
    new = ''.join(item(*p) for p in pick)
    s2, n = pat.subn(lambda m: m.group(1) + new + '                                    </ul>', s, count=1)
    if n and s2 != s:
        open(f, 'w', encoding='utf-8').write(s2); changed += 1
print('posts found', len(posts), '| pages updated', changed)
print([p[1] for p in posts[:4]])
