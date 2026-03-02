const fs = require('fs');
let html = fs.readFileSync('c:/xampp/htdocs/ba-in/index.html', 'utf8');

// The replacement we did earlier:
html = html.replace(
    /<img src="assets\/images\/blog\/1\.jpg" alt="Снимка на жена с предпазна маска по време на козметична процедура за лице" style="padding: 25px; background-color: #fff; border-radius: 20px; width: 100%; aspect-ratio: 370\/209; object-fit: contain;">/g,
    '<img src="assets/images/blog/1-thumb.jpg" alt="Снимка на жена с предпазна маска по време на козметична процедура за лице">'
);

html = html.replace(
    /<img src="assets\/images\/blog\/1\.jpg" alt="Детайл от козметична процедура за лице" style="padding: 25px; background-color: #fff; border-radius: 20px; width: 100%; aspect-ratio: 370\/209; object-fit: contain;">/g,
    '<img src="assets/images/blog/1-thumb.jpg" alt="Детайл от козметична процедура за лице">'
);

fs.writeFileSync('c:/xampp/htdocs/ba-in/index.html', html, 'utf8');
console.log('index.html slider updated to use 1-thumb.jpg without inline styles.');
