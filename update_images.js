const fs = require('fs');

try {
    let indexHtml = fs.readFileSync('c:/xampp/htdocs/ba-in/index.html', 'utf8');

    // Using Regex to safely replace the image block ignoring exact whitespace
    indexHtml = indexHtml.replace(
        /<a href="choosing-right-facial\.html" class="blog-card-two__image__item">[\s\S]*?<img src="assets\/images\/blog\/1\.jpg"[\s\S]*?alt="Как да избереш правилната процедура за лице">[\s\S]*?<img src="assets\/images\/blog\/1\.jpg"[\s\S]*?alt="Как да избереш правилната процедура за лице">[\s\S]*?<\/a>/,
        `<a href="choosing-right-facial.html" class="blog-card-two__image__item" aria-label="Прочетете статията: Как да избереш процедура за лице">
                                        <img src="assets/images/blog/1.jpg"
                                            alt="Снимка на жена с предпазна маска по време на козметична процедура за лице" style="object-position: top;">
                                        <img src="assets/images/blog/1.jpg"
                                            alt="Детайл от козметична процедура за лице" style="object-position: top;">
                                    </a>`
    );

    fs.writeFileSync('c:/xampp/htdocs/ba-in/index.html', indexHtml, 'utf8');
    console.log('index.html updated successfully.');

    let choosingHtml = fs.readFileSync('c:/xampp/htdocs/ba-in/choosing-right-facial.html', 'utf8');

    choosingHtml = choosingHtml.replace(
        /<img src="assets\/images\/blog\/1\.jpg" alt="Лоша или добра инвестиция е процедурата за лице">/,
        '<img src="assets/images/blog/1.jpg" alt="Снимка на жена с предпазна маска по време на козметична процедура за лице. Лицето ѝ е в близък план, виждат се очите и челото." style="object-position: top; object-fit: cover;">'
    );

    choosingHtml = choosingHtml.replace(
        /<a href="appointment\.html" class="mediox-btn">/,
        '<a href="appointment.html" class="mediox-btn" aria-label="Запазете своя час за процедура сега">'
    );

    fs.writeFileSync('c:/xampp/htdocs/ba-in/choosing-right-facial.html', choosingHtml, 'utf8');
    console.log('choosing-right-facial.html updated successfully.');

} catch (err) {
    console.error('Error updating files:', err);
}
