import glob
import os

old_c = """<li class="footer-widget__posts__item">
                                    <div class="footer-widget__posts__image">
                                        <img src="assets/images/blog/footer-rp-1-2.jpg?v=2" alt="Последни новини">
                                    </div><!-- /.footer-widget__posts__image -->
                                    <div class="footer-widget__posts__content">
                                        <div class="footer-widget__posts__meta">
                                            <a href="about.html">
                                                <span class="footer-widget__posts__meta__icon">
                                                    <i class="icon-user"></i>
                                                </span><!-- /.footer-widget__posts__meta__icon -->
                                                <span data-i18n="blog.author_short">от И. Николаева</span>
                                            </a>
                                        </div><!-- /.footer-widget__posts__meta -->
                                        <h4 class="footer-widget__posts__title">
                                            <a href="beauty-inspiring.html" data-i18n="shared.footer.blog2_title">Красотата & Вдъхновението</a>
                                        </h4><!-- /.footer-widget__posts__title -->
                                    </div><!-- /.footer-widget__posts__content -->
                                </li>"""

new_c = """<li class="footer-widget__posts__item">
                                    <div class="footer-widget__posts__image">
                                        <img src="assets/images/blog/microneedling-preview.png" style="width: 70px; height: 70px; object-fit: cover;" alt="Микронидлинг – Пълен Наръчник">
                                    </div><!-- /.footer-widget__posts__image -->
                                    <div class="footer-widget__posts__content">
                                        <div class="footer-widget__posts__meta">
                                            <a href="about.html">
                                                <span class="footer-widget__posts__meta__icon">
                                                    <i class="icon-user"></i>
                                                </span><!-- /.footer-widget__posts__meta__icon -->
                                                <span data-i18n="shared.footer.by_author">от И. Николаева</span>
                                            </a>
                                        </div><!-- /.footer-widget__posts__meta -->
                                        <h4 class="footer-widget__posts__title">
                                            <a href="microneedling-deep-dive.html">Микронидлинг: Пълен Наръчник</a>
                                        </h4><!-- /.footer-widget__posts__title -->
                                    </div><!-- /.footer-widget__posts__content -->
                                </li>"""

changed = []
for file in glob.glob('*.html'):
    if file == 'microneedling-deep-dive.html':
        continue # we already did this or it might have different structure

    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Sometimes whitespace differs slightly, lets try a regex replace if exact match fails
    if old_c in content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content.replace(old_c, new_c))
        changed.append(file)
    else:
        # Fallback regex for robust replacement
        import re
        # Find the footer-widget__posts__image to the </li> for the beauty-inspiring link
        pattern = r'<li class="footer-widget__posts__item">\s*<div class="footer-widget__posts__image">\s*<img src="assets/images/blog/footer-rp-1-2.jpg\?v=2" alt="Последни новини">\s*</div><!-- /.footer-widget__posts__image -->\s*<div class="footer-widget__posts__content">\s*<div class="footer-widget__posts__meta">\s*<a href="about.html">\s*<span class="footer-widget__posts__meta__icon">\s*<i class="icon-user"></i>\s*</span><!-- /.footer-widget__posts__meta__icon -->\s*<span data-i18n="blog.author_short">от И. Николаева</span>\s*</a>\s*</div><!-- /.footer-widget__posts__meta -->\s*<h4 class="footer-widget__posts__title">\s*<a href="beauty-inspiring.html" data-i18n="shared.footer.blog2_title">Красотата &amp; Вдъхновението</a>\s*</h4><!-- /.footer-widget__posts__title -->\s*</div><!-- /.footer-widget__posts__content -->\s*</li>'
        
        # Another pattern if &amp; is just &
        pattern2 = pattern.replace('Красотата &amp; Вдъхновението', 'Красотата & Вдъхновението')
        
        if re.search(pattern2, content):
            new_content = re.sub(pattern2, new_c, content)
            if new_content != content:
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                changed.append(file)

print("Changed files:", changed)
