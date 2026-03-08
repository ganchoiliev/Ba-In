import glob
import re

files_changed = []

for file in glob.glob('*.html'):
    if file == 'microneedling-deep-dive.html' or file == 'index.html':
        continue
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Replace the image src
    content = re.sub(
        r'<img src="assets/images/blog/footer-rp-1-2\.jpg\?v=2" alt="Последни новини">',
        r'<img src="assets/images/blog/microneedling-preview.png" style="width: 70px; height: 70px; object-fit: cover;" alt="Микронидлинг – Пълен Наръчник">',
        content
    )

    # Replace the link and title for the second blog post in the footer
    # Usually it's:
    # <a href="beauty-inspiring.html" data-i18n="shared.footer.blog2_title">Красотата & Вдъхновението</a>
    content = re.sub(
        r'<a href="beauty-inspiring\.html" data-i18n="shared\.footer\.blog2_title">Красотата & Вдъхновението</a>',
        r'<a href="microneedling-deep-dive.html">Микронидлинг: Пълен Наръчник</a>',
        content
    )

    # Note: What if the attribute data-i18n doesn't exist? (it does in our grep)

    if content != original_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        files_changed.append(file)

print('Updated footer blog in:', files_changed)
