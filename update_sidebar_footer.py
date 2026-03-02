import os
import re

dir_path = r"c:\xampp\htdocs\ba-in"
html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

sidebar_old = re.compile(
    r'<li class="sidebar__posts__item">\s+<div class="sidebar__posts__image">\s+<img src="assets/images/blog/lp-1-2.jpg" alt="5 грешки при микроблейдинга">\s+</div><div class="sidebar__posts__content">\s+<div class="sidebar__posts__meta"><a href="about.html">\s+<span class="sidebar__posts__meta__icon">\s+<i class="icon-user"></i>\s+</span>от И. Николаева</a></div><h4 class="sidebar__posts__title"><a href="microblading-5mistakes.html">5 грешки при микроблейдинга</a>\s+</h4></div></li>',
    re.MULTILINE
)

sidebar_new = """<li class="sidebar__posts__item">
                                            <div class="sidebar__posts__image">
                                                <img src="assets/images/blog/1.jpg" alt="Как да избереш правилната процедура за лице">
                                            </div><div class="sidebar__posts__content">
                                                <div class="sidebar__posts__meta"><a href="about.html">
                                                        <span class="sidebar__posts__meta__icon">
                                                            <i class="icon-user"></i>
                                                        </span>от И. Николаева</a></div><h4 class="sidebar__posts__title"><a href="choosing-right-facial.html">Правилната процедура..</a>
                                                </h4></div></li>"""

footer_old = re.compile(
    r'<li class="footer-widget__posts__item">\s+<div class="footer-widget__posts__image">\s+<img src="assets/images/blog/footer-rp-1-1.jpg" alt="Последни новини Beauty Atelier In Силистра">\s+</div><div class="footer-widget__posts__content">\s+<div class="footer-widget__posts__meta">\s+<a href="about.html">\s+<span class="footer-widget__posts__meta__icon">\s+<i class="icon-user"></i>\s+</span>от И. Николаева\s+</a>\s+</div><h4 class="footer-widget__posts__title">\s+<a href="microblading-for-all-ages.html">Хармонично Излъчване</a>\s+</h4></div></li>',
    re.MULTILINE
)

footer_new = """<li class="footer-widget__posts__item">
                                    <div class="footer-widget__posts__image">
                                        <img src="assets/images/blog/1.jpg" alt="Правилната процедура за лице">
                                    </div><div class="footer-widget__posts__content">
                                        <div class="footer-widget__posts__meta">
                                            <a href="about.html">
                                                <span class="footer-widget__posts__meta__icon">
                                                    <i class="icon-user"></i>
                                                </span>от И. Николаева
                                            </a>

                                        </div><h4 class="footer-widget__posts__title">
                                            <a href="choosing-right-facial.html">Правилна процедура</a>
                                        </h4></div></li>"""

for file in html_files:
    file_path = os.path.join(dir_path, file)
    with open(file_path, 'r', encoding='utf-8') as f:
        try:
            content = f.read()
        except UnicodeDecodeError:
            print(f"Error reading {file}")
            continue

    new_content = sidebar_old.sub(sidebar_new, content)
    new_content = footer_old.sub(footer_new, new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated sidebar & footer in {file}")
