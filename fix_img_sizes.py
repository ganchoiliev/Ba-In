import glob
import re

files_changed = []

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Fix footer images - add size styling to footer-widget__posts__image imgs that don't have it
    # Pattern: img inside footer-widget__posts__image that lacks style= attribute
    content = re.sub(
        r'(<div class="footer-widget__posts__image">\s*<img )(?!.*?style=)(src="[^"]+")( alt="[^"]*">)',
        r'\1\2 style="width: 70px; height: 70px; object-fit: cover;"\3',
        content
    )

    if content != original_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        files_changed.append(file)

print('Fixed footer image sizes in:', files_changed)
