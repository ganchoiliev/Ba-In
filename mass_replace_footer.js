const fs = require('fs');
const path = require('path');

const dirPath = 'c:/xampp/htdocs/ba-in';

const footerNew = `<li class="footer-widget__posts__item">
                                    <div class="footer-widget__posts__image">
                                        <img src="assets/images/blog/1.jpg" alt="Правилната процедура за лице">
                                    </div><!-- /.footer-widget__posts__image -->
                                    <div class="footer-widget__posts__content">
                                        <div class="footer-widget__posts__meta">
                                            <a href="about.html">
                                                <span class="footer-widget__posts__meta__icon">
                                                    <i class="icon-user"></i>
                                                </span><!-- /.footer-widget__posts__meta__icon -->
                                                от И. Николаева
                                            </a>
                                        </div><!-- /.footer-widget__posts__meta -->
                                        <h4 class="footer-widget__posts__title">
                                            <a href="choosing-right-facial.html">Правилна процедура</a>
                                        </h4><!-- /.footer-widget__posts__title -->
                                    </div><!-- /.footer-widget__posts__content -->
                                </li>
                                <li class="footer-widget__posts__item">
                                    <div class="footer-widget__posts__image">
                                        <img src="assets/images/blog/footer-rp-1-2.jpg?v=2" alt="Последни новини">
                                    </div><!-- /.footer-widget__posts__image -->
                                    <div class="footer-widget__posts__content">
                                        <div class="footer-widget__posts__meta">
                                            <a href="about.html">
                                                <span class="footer-widget__posts__meta__icon">
                                                    <i class="icon-user"></i>
                                                </span><!-- /.footer-widget__posts__meta__icon -->
                                                от И. Николаева
                                            </a>
                                        </div><!-- /.footer-widget__posts__meta -->
                                        <h4 class="footer-widget__posts__title">
                                            <a href="beauty-inspiring.html">Красотата & Вдъхновението</a>
                                        </h4><!-- /.footer-widget__posts__title -->
                                    </div><!-- /.footer-widget__posts__content -->
                                </li>`;

const startToken = '<ul class="footer-widget__posts list-unstyled">';

const files = fs.readdirSync(dirPath);

files.forEach(file => {
    if (file.endsWith('.html')) {
        const filePath = path.join(dirPath, file);
        const content = fs.readFileSync(filePath, 'utf-8');

        let startIndex = content.indexOf(startToken);
        if (startIndex !== -1) {
            let innerStartIndex = startIndex + startToken.length;
            let nextEndIndex = content.indexOf('</ul>', innerStartIndex);

            if (nextEndIndex !== -1) {
                let newContent = content.substring(0, innerStartIndex) + '\n' + footerNew + '\n' + content.substring(nextEndIndex);
                if (newContent !== content) {
                    fs.writeFileSync(filePath, newContent, 'utf-8');
                    console.log(`Updated footer in ${file}`);
                }
            } else {
                console.log(`Missing closing ul in ${file}`);
            }
        }
    }
});
