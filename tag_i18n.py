"""
tag_i18n.py - Add data-i18n attributes to all HTML pages for Beauty Atelier IN.
Run from C:/xampp/htdocs/ba-in/
"""
import os
import re

BASE = r'C:\xampp\htdocs\ba-in'

# ─── Shared replacements applied to ALL pages ───────────────────────────────
# Each tuple: (old, new). If old not found in file it's skipped silently.

SHARED = [

    # ---- Topbar address ----
    (
        '>Силистра център, ул. "Отец Паисий" 27, 7500 Силистра, България</a>',
        ' data-i18n="shared.topbar.address">Силистра център, ул. "Отец Паисий" 27, 7500 Силистра, България</a>',
    ),

    # ---- Nav links ----
    ('<a href="index.html">Начало</a>',
     '<a href="index.html" data-i18n="shared.nav.home">Начало</a>'),
    ('<a href="Procedures.html">Процедури</a>',
     '<a href="Procedures.html" data-i18n="shared.nav.procedures">Процедури</a>'),
    ('<a href="pricing.html">Ценоразпис</a>',
     '<a href="pricing.html" data-i18n="shared.nav.pricing">Ценоразпис</a>'),
    ('<a href="about.html">За нас</a>',
     '<a href="about.html" data-i18n="shared.nav.about">За нас</a>'),
    ('<a href="faq.html">ЧЗВ</a>',
     '<a href="faq.html" data-i18n="shared.nav.faq">ЧЗВ</a>'),
    ('<a href="blog-carousel-2.html">Блог</a>',
     '<a href="blog-carousel-2.html" data-i18n="shared.nav.blog">Блог</a>'),
    ('<a href="contact.html">Контакти</a>',
     '<a href="contact.html" data-i18n="shared.nav.contact">Контакти</a>'),

    # ---- Header: call label ----
    ('<p class="main-header__call__title">Звънни ни</p>',
     '<p class="main-header__call__title" data-i18n="shared.header.call_label">Звънни ни</p>'),

    # ---- Header: book button (span inside mediox-btn main-header__btn) ----
    # Use regex below for whitespace tolerance

    # ---- Sidebar btn aria ----
    ('aria-label="Отвори странично меню"',
     'data-i18n-aria="shared.aria.open_sidebar" aria-label="Отвори странично меню"'),
    ('aria-label="Отвори мобилно меню"',
     'data-i18n-aria="shared.aria.open_mobile_nav" aria-label="Отвори мобилно меню"'),

    # ---- Sidebar about text ----
    (' С внимание към всеки детайл и индивидуален подход към всеки клиент, ние създаваме не просто визия, а самочувствие. Довери се на сертифициран професионалист с опит!</p>',
     ' data-i18n="shared.sidebar.about_text"> С внимание към всеки детайл и индивидуален подход към всеки клиент, ние създаваме не просто визия, а самочувствие. Довери се на сертифициран професионалист с опит!</p>'),

    # ---- Sidebar newsletter label ----
    ('<label class="sidebar-one__title" for="sidebar-email"> новини и промоции</label>',
     '<label class="sidebar-one__title" for="sidebar-email" data-i18n="shared.sidebar.newsletter_label"> новини и промоции</label>'),

    # ---- Scroll to top ----
    ('<span class="scroll-to-top__text">Начало</span>',
     '<span class="scroll-to-top__text" data-i18n="shared.scroll_top">Начало</span>'),

    # ---- Footer tagline ----
    ('>Мястото, където красотата среща прецизността!</p>',
     ' data-i18n="shared.footer.tagline">Мястото, където красотата среща прецизността!</p>'),

    # ---- Footer: contact us span ----
    ('><span>свържи се с нас</span>',
     '><span data-i18n="shared.footer.contact_us">свържи се с нас</span>'),

    # ---- Footer: section titles ----
    ('>Нашите <span>Процедури</span></h2>',
     ' data-i18n-html="shared.footer.procedures_title">Нашите <span>Процедури</span></h2>'),
    ('>Бързи <span>връзки</span></h2>',
     ' data-i18n-html="shared.footer.quick_links_title">Бързи <span>връзки</span></h2>'),
    ('>блог & <span>новини</span></h2>',
     ' data-i18n-html="shared.footer.blog_title">блог & <span>новини</span></h2>'),

    # ---- Footer: procedure links ----
    ('<li><a href="microblading.html">Микроблейдинг</a></li>',
     '<li><a href="microblading.html" data-i18n="shared.footer.proc.microblading">Микроблейдинг</a></li>'),
    ('<li><a href="microneedling.html">Микронидлинг</a></li>',
     '<li><a href="microneedling.html" data-i18n="shared.footer.proc.microneedling">Микронидлинг</a></li>'),
    ('<li><a href="lashes.html">Миглопластика</a></li>',
     '<li><a href="lashes.html" data-i18n="shared.footer.proc.lashes">Миглопластика</a></li>'),
    ('<li><a href="plasma.html">Плазма пен</a></li>',
     '<li><a href="plasma.html" data-i18n="shared.footer.proc.plasma">Плазма пен</a></li>'),
    ('<li><a href="laminirane.html">Ламиниране</a></li>',
     '<li><a href="laminirane.html" data-i18n="shared.footer.proc.lamination">Ламиниране</a></li>'),
    ('<li><a href="piercing.html">Пробиване на уши</a></li>',
     '<li><a href="piercing.html" data-i18n="shared.footer.proc.piercing">Пробиване на уши</a></li>'),
    ('<li><a href="perm-makeup-removal.html">Премахване на перманентен грим</a></li>',
     '<li><a href="perm-makeup-removal.html" data-i18n="shared.footer.proc.perm_removal">Премахване на перманентен грим</a></li>'),

    # ---- Footer: quick links ----
    ('<li><a href="about.html">За нас</a></li>',
     '<li><a href="about.html" data-i18n="shared.footer.link.about">За нас</a></li>'),
    ('<li><a href="Procedures.html">Процедури</a></li>',
     '<li><a href="Procedures.html" data-i18n="shared.nav.procedures">Процедури</a></li>'),
    ('<li><a href="pricing.html">Ценоразпис</a></li>',
     '<li><a href="pricing.html" data-i18n="shared.footer.link.pricing">Ценоразпис</a></li>'),
    ('<li><a href="blog-carousel-2.html">Блог</a></li>',
     '<li><a href="blog-carousel-2.html" data-i18n="shared.footer.link.blog">Блог</a></li>'),
    ('<li><a href="appointment.html">Запази час</a></li>',
     '<li><a href="appointment.html" data-i18n="shared.footer.link.appointment">Запази час</a></li>'),
    ('<li><a href="faq.html">Често Задавани Въпроси</a></li>',
     '<li><a href="faq.html" data-i18n="shared.footer.link.faq">Често Задавани Въпроси</a></li>'),
    ('<li><a href="contact.html">Контакти</a></li>',
     '<li><a href="contact.html" data-i18n="shared.footer.link.contact">Контакти</a></li>'),

    # ---- Footer: address/email/call labels ----
    ('>Адрес</p>',
     ' data-i18n="shared.footer.address_label">Адрес</p>'),
    ('>Изпрати ни имейл</p>',
     ' data-i18n="shared.footer.email_label">Изпрати ни имейл</p>'),
    ('<p class="main-footer__contact__title">Звънни ни</p>',
     '<p class="main-footer__contact__title" data-i18n="shared.footer.call_label">Звънни ни</p>'),

    # ---- Footer: blog items ----
    ('>от И. Николаева</span>',
     ' data-i18n="shared.footer.by_author">от И. Николаева</span>'),
    ('>Правилна процедура</a>',
     ' data-i18n="shared.footer.blog1_title">Правилна процедура</a>'),
    ('>Красотата & Вдъхновението</a>',
     ' data-i18n="shared.footer.blog2_title">Красотата & Вдъхновението</a>'),
]

# ─── Page-specific: title/meta + breadcrumb ──────────────────────────────────
# (page_file, old_title_text, new_title_attr, old_meta_content, new_meta_attr,
#  old_breadcrumb_h1, new_breadcrumb_h1)
PAGE_SPECIFIC = {
    'about.html': {
        'title_old': 'За нас | Beauty Atelier IN – Сертифициран PhiBrows специалист в Силистра',
        'title_key': 'about.title',
        'meta_key': 'about.meta_desc',
        'breadcrumb_old': '<h1 class="page-header__title">За Нас</h1>',
        'breadcrumb_new': '<h1 class="page-header__title" data-i18n="about.page_title">За Нас</h1>',
    },
    'contact.html': {
        'title_old': 'Контакти | Beauty Atelier IN – Свържете се с нас',
        'title_key': 'contact.title',
        'meta_key': 'contact.meta_desc',
        'breadcrumb_old': '<h1 class="page-header__title">Контакти</h1>',
        'breadcrumb_new': '<h1 class="page-header__title" data-i18n="contact.page_title">Контакти</h1>',
    },
    'faq.html': {
        'title_old': 'Въпроси | Beauty Atelier IN – Силистра',
        'title_key': 'faq.title',
        'meta_key': 'faq.meta_desc',
        'breadcrumb_old': '<h1 class="page-header__title">ЧЗВ</h1>',
        'breadcrumb_new': '<h1 class="page-header__title" data-i18n="faq.page_title">ЧЗВ</h1>',
    },
    'pricing.html': {
        'title_old': 'Ценоразпис | Beauty Atelier IN – Силистра',
        'title_key': 'pricing.title',
        'meta_key': 'pricing.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'Procedures.html': {
        'title_old': 'Процедури | Beauty Atelier IN – Силистра',
        'title_key': 'procedures.title',
        'meta_key': 'procedures.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'appointment.html': {
        'title_old': 'Запази Час | Beauty Atelier IN – Силистра',
        'title_key': 'appointment.title',
        'meta_key': 'appointment.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'aftertreatment.html': {
        'title_old': 'Следпроцедурна Грижа | Beauty Atelier IN',
        'title_key': 'aftertreatment.title',
        'meta_key': 'aftertreatment.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'microblading.html': {
        'title_old': 'Микроблейдинг | Beauty Atelier IN – Силистра',
        'title_key': 'microblading.title',
        'meta_key': 'microblading.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'microneedling.html': {
        'title_old': 'Микронидлинг | Beauty Atelier IN – Силистра',
        'title_key': 'microneedling.title',
        'meta_key': 'microneedling.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'lashes.html': {
        'title_old': 'Миглопластика | Beauty Atelier IN – Силистра',
        'title_key': 'lashes.title',
        'meta_key': 'lashes.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'plasma.html': {
        'title_old': 'Плазма Пен | Beauty Atelier IN – Силистра',
        'title_key': 'plasma.title',
        'meta_key': 'plasma.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'laminirane.html': {
        'title_old': 'Ламиниране | Beauty Atelier IN – Силистра',
        'title_key': 'laminirane.title',
        'meta_key': 'laminirane.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'piercing.html': {
        'title_old': 'Пробиване на уши | Beauty Atelier IN – Силистра',
        'title_key': 'piercing.title',
        'meta_key': 'piercing.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'perm-makeup-removal.html': {
        'title_old': 'Премахване на перманентен грим | Beauty Atelier IN',
        'title_key': 'perm_removal.title',
        'meta_key': 'perm_removal.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'blog-carousel-2.html': {
        'title_old': 'Блог | Beauty Atelier IN – Силистра',
        'title_key': 'blog.title',
        'meta_key': 'blog.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'beauty-inspiring.html': {
        'title_old': 'Красотата & Вдъхновението | Beauty Atelier IN',
        'title_key': 'blog_inspiring.title',
        'meta_key': 'blog_inspiring.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'beauty-secrets.html': {
        'title_old': 'Тайната на Естествената Красота | Beauty Atelier IN',
        'title_key': 'blog_secrets.title',
        'meta_key': 'blog_secrets.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'choosing-right-facial.html': {
        'title_old': 'Как да избереш процедура за лице | Beauty Atelier IN',
        'title_key': 'blog_choosing.title',
        'meta_key': 'blog_choosing.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'microblading-guide.html': {
        'title_old': 'Ръководство за микроблейдинг | Beauty Atelier IN',
        'title_key': 'blog_mb_guide.title',
        'meta_key': 'blog_mb_guide.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'microblading-5myths.html': {
        'title_old': '5 мита за микроблейдинг | Beauty Atelier IN',
        'title_key': 'blog_mb_myths.title',
        'meta_key': 'blog_mb_myths.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'microblading-5mistakes.html': {
        'title_old': '5 грешки при микроблейдинг | Beauty Atelier IN',
        'title_key': 'blog_mb_mistakes.title',
        'meta_key': 'blog_mb_mistakes.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'microblading-for-all-ages.html': {
        'title_old': 'Микроблейдинг за всяка възраст | Beauty Atelier IN',
        'title_key': 'blog_mb_ages.title',
        'meta_key': 'blog_mb_ages.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'Privacy-policy.html': {
        'title_old': 'Политика за поверителност | Beauty Atelier IN',
        'title_key': 'privacy.title',
        'meta_key': 'privacy.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
    'termsandconditions.html': {
        'title_old': 'Общи условия | Beauty Atelier IN',
        'title_key': 'terms.title',
        'meta_key': 'terms.meta_desc',
        'breadcrumb_old': None,
        'breadcrumb_new': None,
    },
}

def tag_page(page, content, spec):
    """Add data-i18n to <title> and <meta description>"""
    # Title: find actual title text in <title>
    title_pattern = r'<title>([^<]+)</title>'
    def title_repl(m):
        key = spec['title_key']
        text = m.group(1)
        return f'<title data-i18n="{key}">{text}</title>'
    new = re.sub(title_pattern, title_repl, content)

    # Meta description: add data-i18n-content attr
    meta_pattern = r'(<meta name="description" )(content="[^"]*")'
    def meta_repl(m):
        key = spec['meta_key']
        return m.group(1) + f'data-i18n-content="{key}" ' + m.group(2)
    new = re.sub(meta_pattern, meta_repl, new)

    # Breadcrumb h1 if specified
    if spec.get('breadcrumb_old') and spec['breadcrumb_old'] in new:
        new = new.replace(spec['breadcrumb_old'], spec['breadcrumb_new'])

    return new


def apply_regex_replacements(content):
    """Apply replacements that need regex for whitespace tolerance."""
    # Header book button: <span>Запази час</span> inside main-header__btn
    content = re.sub(
        r'(class="mediox-btn main-header__btn"[^>]*>)\s*<span>Запази час</span>',
        lambda m: m.group(1) + '\n                            <span data-i18n="shared.header.book_btn">Запази час</span>',
        content
    )
    return content


pages = [
    'about.html', 'aftertreatment.html', 'appointment.html',
    'beauty-inspiring.html', 'beauty-secrets.html', 'blog-carousel-2.html',
    'choosing-right-facial.html', 'contact.html', 'faq.html', 'laminirane.html',
    'lashes.html', 'microblading-5mistakes.html', 'microblading-5myths.html',
    'microblading-for-all-ages.html', 'microblading-guide.html', 'microblading.html',
    'microneedling.html', 'perm-makeup-removal.html', 'piercing.html', 'plasma.html',
    'pricing.html', 'Privacy-policy.html', 'Procedures.html', 'termsandconditions.html'
]

for page in pages:
    path = os.path.join(BASE, page)
    if not os.path.exists(path):
        print(f'SKIP: {page}')
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply shared replacements
    hits = 0
    for old, new in SHARED:
        if old in content and new not in content:
            content = content.replace(old, new)
            hits += 1

    # Apply regex-based replacements
    content = apply_regex_replacements(content)

    # Apply page-specific replacements
    if page in PAGE_SPECIFIC:
        content = tag_page(page, content, PAGE_SPECIFIC[page])

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'OK ({hits} shared hits): {page}')
