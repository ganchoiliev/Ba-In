import glob
import re

files_changed = []

for file in glob.glob('*.html'):
    if file == 'index.html':
        continue # index.html was skipped or already had its own structure... wait, I skipped index.html in the last script but did it have the same?
    
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    content = re.sub(
        r'<a href="microneedling-deep-dive\.html">Микронидлинг: Пълен Наръчник</a>',
        r'<a href="microneedling-deep-dive.html" data-i18n="shared.footer.blog2_title">Микронидлинг: Пълен Наръчник</a>',
        content
    )


    if content != original_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        files_changed.append(file)

print('Updated translations in:', files_changed)
