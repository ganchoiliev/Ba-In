const fs = require('fs');
const path = require('path');

const dirPath = 'c:/xampp/htdocs/ba-in';

// Replace FAQ nav link with Gallery nav link
const navOldRegex = /(<a\s+href="faq\.html"\s+data-i18n="shared\.nav\.faq">)ЧЗВ(<\/a>)/g;
const navNew = '<a href="gallery.html" data-i18n="shared.nav.gallery">Галерия</a>';

// Add Gallery link to footer quick links (before FAQ entry)
const footerFaqRegex = /(<li><a href="faq\.html" data-i18n="shared\.footer\.link\.faq">)/g;
const footerGalleryLink = '<li><a href="gallery.html" data-i18n="shared.footer.link.gallery">Галерия</a></li>\n                                <li><a href="faq.html" data-i18n="shared.footer.link.faq">';

const files = fs.readdirSync(dirPath);

files.forEach(file => {
    if (file.endsWith('.html') && file !== 'gallery.html') {
        const filePath = path.join(dirPath, file);
        const originalContent = fs.readFileSync(filePath, 'utf-8');

        let newContent = originalContent.replace(navOldRegex, navNew);

        // Only add gallery footer link if it doesn't already exist
        if (newContent.indexOf('shared.footer.link.gallery') === -1) {
            newContent = newContent.replace(footerFaqRegex, footerGalleryLink);
        }

        if (newContent !== originalContent) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(`Updated: ${file}`);
        } else {
            console.log(`No changes: ${file}`);
        }
    }
});

console.log('\nDone!');
