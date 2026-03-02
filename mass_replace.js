const fs = require('fs');
const path = require('path');

const dirPath = 'c:/xampp/htdocs/ba-in';

const sidebarOldRegex = /<li class="sidebar__posts__item">\s+<div class="sidebar__posts__image">\s+<img src="assets\/images\/blog\/lp-1-2\.jpg" alt="5 грешки при микроблейдинга">\s+<\/div><div class="sidebar__posts__content">\s+<div class="sidebar__posts__meta"><a href="about\.html">\s+<span class="sidebar__posts__meta__icon">\s+<i class="icon-user"><\/i>\s+<\/span>от И\. Николаева<\/a><\/div><h4 class="sidebar__posts__title"><a href="microblading-5mistakes\.html">5 грешки при микроблейдинга<\/a>\s+<\/h4><\/div><\/li>/g;

const sidebarNew = `<li class="sidebar__posts__item">
                                            <div class="sidebar__posts__image">
                                                <img src="assets/images/blog/1.jpg" alt="Как да избереш правилната процедура за лице">
                                            </div><div class="sidebar__posts__content">
                                                <div class="sidebar__posts__meta"><a href="about.html">
                                                        <span class="sidebar__posts__meta__icon">
                                                            <i class="icon-user"></i>
                                                        </span>от И. Николаева</a></div><h4 class="sidebar__posts__title"><a href="choosing-right-facial.html">Правилната процедура..</a>
                                                </h4></div></li>`;

const footerOldRegex = /<li class="footer-widget__posts__item">\s+<div class="footer-widget__posts__image">\s+<img src="assets\/images\/blog\/footer-rp-1-1\.jpg(\?v=2)?" alt="[^"]+">\s+<\/div><div class="footer-widget__posts__content">\s+<div class="footer-widget__posts__meta">\s+<a href="about\.html">\s+<span class="footer-widget__posts__meta__icon">\s+<i class="icon-user"><\/i>\s+<\/span>от И\. Николаева\s*<\/a>\s+<\/div><h4 class="footer-widget__posts__title">\s+<a href="microblading-for-all-ages\.html">Хармонично Излъчване<\/a>\s+<\/h4><\/div><\/li>/g;

const footerNew = `<li class="footer-widget__posts__item">
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
                                        </h4></div></li>`;

const files = fs.readdirSync(dirPath);

files.forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(dirPath, file);
        const originalContent = fs.readFileSync(filePath, 'utf-8');

        let newContent = originalContent.replace(sidebarOldRegex, sidebarNew);
        newContent = newContent.replace(footerOldRegex, footerNew);

        if (newContent !== originalContent) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(`Updated sidebars/footers in ${file}`);
        }
    }
});
