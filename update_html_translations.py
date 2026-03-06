import os, glob, re

dir_path = r'c:\xampp\htdocs\ba-in'
html_files = glob.glob(os.path.join(dir_path, '*.html'))

for fpath in html_files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Sidebar categories (regex allows space variations)
    content = re.sub(r'<a[^>]*href=\"javascript:void\(0\)\"[^>]*class=\"[^\"]*mediox-btn[^\"]*\"[^>]*>\s*Микроблейдинг\s*<span>\(\d+\)</span>\s*</a>', 
                     r'<a href="javascript:void(0)" class="mediox-btn" data-i18n="sidebar.cat.microblading">Микроблейдинг <span>(4)</span></a>', content)
    
    content = re.sub(r'<a[^>]*href=\"javascript:void\(0\)\"[^>]*class=\"[^\"]*mediox-btn[^\"]*\"[^>]*>\s*Микронидлинг\s*<span>\(\d+\)</span>\s*</a>', 
                     r'<a href="javascript:void(0)" class="mediox-btn" data-i18n="sidebar.cat.microneedling">Микронидлинг <span>(2)</span></a>', content)
                     
    content = re.sub(r'<a[^>]*href=\"javascript:void\(0\)\"[^>]*class=\"[^\"]*mediox-btn[^\"]*\"[^>]*>\s*Миглопластика\s*<span>\(\d+\)</span>\s*</a>', 
                     r'<a href="javascript:void(0)" class="mediox-btn" data-i18n="sidebar.cat.lashes">Миглопластика <span>(6)</span></a>', content)
                     
    content = re.sub(r'<a[^>]*href=\"javascript:void\(0\)\"[^>]*class=\"[^\"]*mediox-btn[^\"]*\"[^>]*>\s*Грижа за Кожата\s*<span>\(\d+\)</span>\s*</a>', 
                     r'<a href="javascript:void(0)" class="mediox-btn" data-i18n="sidebar.cat.skincare">Грижа за Кожата <span>(9)</span></a>', content)
                     
    content = re.sub(r'<a[^>]*href=\"javascript:void\(0\)\"[^>]*class=\"[^\"]*mediox-btn[^\"]*\"[^>]*>\s*Естетични Процедури\s*<span>\(\d+\)</span>\s*</a>', 
                     r'<a href="javascript:void(0)" class="mediox-btn" data-i18n="sidebar.cat.aesthetic">Естетични Процедури <span>(10)</span></a>', content)

    # Search placeholder
    content = re.sub(r'<input\s+type=\"text\"\s+placeholder=\"Търсене\.\.\.\"\s*/>',
                     r'<input type="text" placeholder="Търсене..." data-i18n-ph="sidebar.search_placeholder" />', content)

    # Add data-i18n on the search input itself, because it's currently missing. Oh wait, it has placeholder attribute.

    # Blog Categories
    content = re.sub(r'<a[^>]*class=\"[^\"]*blog-details__categories__btn[^\"]*\"[^>]*>\s*<span>микроблейдинг</span>\s*</a>',
                    r'<a href="javascript:void(0)" class="blog-details__categories__btn mediox-btn" data-i18n="blog.category.microblading"><span>микроблейдинг</span></a>', content)
    content = re.sub(r'<a[^>]*class=\"[^\"]*blog-details__categories__btn[^\"]*\"[^>]*>\s*<span>възраст</span>\s*</a>',
                    r'<a href="javascript:void(0)" class="blog-details__categories__btn mediox-btn" data-i18n="blog.category.age"><span>възраст</span></a>', content)

    # Blog Tags
    content = re.sub(r'<a[^>]*href=\"javascript:void\(0\)\"[^>]*>\s*блог\s*</a>',
                    r'<a href="javascript:void(0)" data-i18n="blog.tag.blog">блог</a>', content)
    content = re.sub(r'<a[^>]*href=\"javascript:void\(0\)\"[^>]*>\s*лифтинг\s*</a>',
                    r'<a href="javascript:void(0)" data-i18n="blog.tag.lifting">лифтинг</a>', content)

    # Additional Procedures Titles
    content = re.sub(r'<a[^>]*href=\"piercing\.html\"[^>]*>\s*Пробиване на уши\s*</a>', r'<a href="piercing.html" data-i18n="shared.proc.probiwane">Пробиване на уши</a>', content)
    content = re.sub(r'<a[^>]*href=\"plasma\.html\"[^>]*>\s*Плазма Пен\s*</a>', r'<a href="plasma.html" data-i18n="shared.proc.plasma">Плазма Пен</a>', content)
    content = re.sub(r'<a[^>]*href=\"laminirane\.html\"[^>]*>\s*Ламиниране\s*</a>', r'<a href="laminirane.html" data-i18n="shared.proc.lamination">Ламиниране</a>', content)
    
    # And their descriptions
    content = re.sub(r'<p[^>]*class=\"[^\"]*service-card-three__text[^\"]*\"[^>]*>\s*Безопасно и едновременно пробиване на уши\.\s*</p>', 
                     r'<p class="service-card-three__text" data-i18n="shared.proc.probiwane_desc">Безопасно и едновременно пробиване на уши.</p>', content)
    content = re.sub(r'<p[^>]*class=\"[^\"]*service-card-three__text[^\"]*\"[^>]*>\s*Неинвазивно стягане и подмладяване на кожата\.\s*</p>', 
                     r'<p class="service-card-three__text" data-i18n="shared.proc.plasma_desc">Неинвазивно стягане и подмладяване на кожата.</p>', content)
    content = re.sub(r'<p[^>]*class=\"[^\"]*service-card-three__text[^\"]*\"[^>]*>\s*Ламиниране за естествен обем и красиво подчертан поглед\.\s*</p>', 
                     r'<p class="service-card-three__text" data-i18n="shared.proc.lamination_desc">Ламиниране за естествен обем и красиво подчертан поглед.</p>', content)


    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Updated HTML files.")
