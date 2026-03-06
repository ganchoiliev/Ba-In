import os
import re

base = r'C:\xampp\htdocs\ba-in'
pages = [
    'about.html', 'aftertreatment.html', 'appointment.html', 'audit.html',
    'beauty-inspiring.html', 'beauty-secrets.html', 'blog-carousel-2.html',
    'choosing-right-facial.html', 'contact.html', 'faq.html', 'laminirane.html',
    'lashes.html', 'microblading-5mistakes.html', 'microblading-5myths.html',
    'microblading-for-all-ages.html', 'microblading-guide.html', 'microblading.html',
    'microneedling.html', 'perm-makeup-removal.html', 'piercing.html', 'plasma.html',
    'pricing.html', 'Privacy-policy.html', 'Procedures.html', 'termsandconditions.html'
]

css_line = '    <!-- AI Chatbot styles -->\n    <link rel="stylesheet" href="assets/css/ai-chat.css" />'
css_replacement = '    <!-- AI Chatbot styles -->\n    <link rel="stylesheet" href="assets/css/ai-chat.css" />\n    <link rel="stylesheet" href="assets/css/i18n.css" />'

lang_toggle_html = (
    '\n                <button class="lang-toggle" id="lang-toggle" '
    'data-i18n-aria="shared.aria.lang_switch" aria-label="Смени езика">\n'
    '                    <span class="lang-toggle__option active" data-lang="bg">БГ</span>\n'
    '                    <span class="lang-toggle__divider">|</span>\n'
    '                    <span class="lang-toggle__option" data-lang="en">EN</span>\n'
    '                </button>'
)

mobile_lang_html = (
    '\n            <div class="mobile-nav__lang">\n'
    '                <button class="lang-toggle" aria-label="Switch language">\n'
    '                    <span class="lang-toggle__option active" data-lang="bg">БГ</span>\n'
    '                    <span class="lang-toggle__option" data-lang="en">EN</span>\n'
    '                </button>\n'
    '            </div>\n'
)

script_block = '    <script src="assets/js/translations.js"></script>\n    <script src="assets/js/i18n.js"></script>'

results = []
for page in pages:
    path = os.path.join(base, page)
    if not os.path.exists(path):
        results.append('SKIP (not found): ' + page)
        continue

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    changed = []

    # 1. Add i18n.css link
    if 'i18n.css' not in content:
        if css_line in content:
            content = content.replace(css_line, css_replacement)
            changed.append('css')
        else:
            changed.append('css-FAILED')

    # 2. Add lang toggle in topbar
    if 'lang-toggle' not in content:
        topbar_pattern = r'(<div class="topbar-one__right">)(\s*)(<div class="social-links">)'
        def topbar_repl(m):
            return m.group(1) + lang_toggle_html + '\n                ' + m.group(3)
        new_content = re.sub(topbar_pattern, topbar_repl, content)
        if new_content != content:
            content = new_content
            changed.append('topbar-toggle')
        else:
            changed.append('topbar-toggle-FAILED')

    # 3. Add mobile lang toggle
    if 'mobile-nav__lang' not in content:
        mobile_pattern = r'(<div class="mobile-nav__container"></div>)(\s*)(<ul class="mobile-nav__contact)'
        def mobile_repl(m):
            return m.group(1) + mobile_lang_html + '            ' + m.group(3)
        new_content = re.sub(mobile_pattern, mobile_repl, content)
        if new_content != content:
            content = new_content
            changed.append('mobile-toggle')
        else:
            changed.append('mobile-toggle-FAILED')

    # 4. Add script tags before </body>
    if 'translations.js' not in content:
        content = content.replace('</body>', script_block + '\n</body>', 1)
        changed.append('scripts')

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    results.append('OK [' + ', '.join(changed) + ']: ' + page)

for r in results:
    print(r)
