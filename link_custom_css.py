import glob
import re

files_changed = []

# Find exactly where other CSS files are linked (before </head>)
css_link = '    <link rel="stylesheet" href="assets/css/custom.css">\n'

for file in glob.glob('*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already linked
    if 'custom.css' in content:
        continue

    # Insert just before </head>
    if '</head>' in content:
        new_content = content.replace('</head>', css_link + '</head>', 1)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        files_changed.append(file)

print(f'Linked custom.css in {len(files_changed)} files:', files_changed)
