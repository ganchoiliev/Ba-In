const fs = require('fs');
const path = require('path');

const imgDir = 'c:/xampp/htdocs/ba-in/assets/images/gallery-page';
const vidDir = 'c:/xampp/htdocs/ba-in/assets/images/videos';

// ── Image categorization ──
function categorizeImage(filename) {
    const f = filename.toLowerCase();
    if (f.includes('studio_newyear') || f.includes('vaucher')) return null;
    if (f.includes('certificate') || f.includes('cource') || f.includes('course') || f.includes('given_cert') || f.includes('group_people')) return 'studio';
    if (f.startsWith('iliyana') || f === 'iliyana2.jpg' || f === 'mila_savova_my_teacher.jpg' || f.includes('iliyana_with') || f.includes('iliyana_working') || f.includes('iliyana_certificate')) return 'studio';
    if (f.startsWith('client')) return 'studio';
    if (f.startsWith('microblading')) return 'microblading';
    if (f.startsWith('microneedling') || f.startsWith('microneeedling')) return 'microneedling';
    if (f.startsWith('plasmapen') || f.startsWith('beloflastika') || f.includes('skin_tags')) return 'plasma';
    if (f.includes('piercing')) return 'piercing';
    if (f.includes('perpement_makeup') || f.includes('perm_makeup')) return 'pmu-removal';

    // True lash extensions (миглопластика) — thick, voluminous individual extensions
    var trueLashes = ['eyelashesh15.jpg','eyelashesh16.jpg','lashesh2.jpg','lashesh3.jpg',
                      'eyelashes.png','old_image_lashesh_and_brows.jpg',
                      'cateye_eyelashesh.jpg','lashesh_3d.jpg'];
    if (trueLashes.indexOf(f) !== -1) return 'lashes';

    // Lash lift / lamination — natural lashes lifted and curled
    if (f.includes('eyelashesh') || f.includes('lashesh')
        || f === 'brows_lashesh.jpg' || f === 'eyelashes_eyebrows.png') return 'lamination';

    if (f.includes('lamination') || f.includes('laminirane')) return 'lamination';
    // Eyebrow cleaning/shaping = brow lamination, not microblading
    if (f.includes('cleaning') || f.includes('eyevrows') || f.includes('first_time_eyebrows') || f === 'eyebrows14.jpg') return 'lamination';
    // eyebrows3.png is actual microblading (before/after with pigment)
    if (f === 'eyebrows3.png' || f === 'retush.jpg') return 'microblading';
    return 'studio';
}

const catLabels = {
    'microblading': 'Микроблейдинг',
    'lashes': 'Миглопластика',
    'lamination': 'Ламиниране',
    'microneedling': 'Микронидлинг',
    'plasma': 'Плазма Пен',
    'piercing': 'Пробиване',
    'pmu-removal': 'Премахване на ПМГ',
    'studio': 'Студио',
    'videos': 'Видеа'
};

// ── Load descriptions ──
const descriptions = JSON.parse(fs.readFileSync('c:/xampp/htdocs/ba-in/assets/data/gallery-descriptions.json', 'utf-8'));
function getDesc(file) {
    return descriptions[file] || descriptions[file.toLowerCase()] || '';
}

// ── Read and categorize images ──
const images = fs.readdirSync(imgDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(f => ({ file: f, category: categorizeImage(f) }))
    .filter(i => i.category !== null);

const groups = {};
images.forEach(img => {
    if (!groups[img.category]) groups[img.category] = [];
    groups[img.category].push(img.file);
});

// ── Read videos ──
const videos = fs.readdirSync(vidDir)
    .filter(f => /\.mp4$/i.test(f) && !f.includes('(1)'))
    .sort();

// ── Video categories and descriptions ──
const videoMeta = {
    0:  { cat: 'microblading', desc: 'Микроблейдинг \u2014 прецизна техника косъм по косъм' },
    1:  { cat: 'microblading', desc: 'PhiBrows микроблейдинг \u2014 естествени косъмчета' },
    2:  { cat: 'lashes', desc: 'Обемни мигли \u2014 класика, обем или мега обем' },
    3:  { cat: 'lashes', desc: 'Мигли преди и след \u2014 впечатляващ резултат' },
    4:  { cat: 'studio', desc: 'Beauty Atelier IN \u2014 подготовка на новото студио' },
    5:  { cat: 'studio', desc: 'Beauty Atelier IN \u2014 красота и вдъхновение' },
    6:  { cat: 'studio', desc: 'Благодаря на приятели \u2014 празнично настроение' },
    7:  { cat: 'microneedling', desc: 'Микронидлинг PhiLings \u2014 стимулация на колагена' },
    8:  { cat: 'lashes', desc: 'Поставяне на мигли \u2014 подчертан и изразителен поглед' },
    9:  { cat: 'plasma', desc: 'Плазма пен \u2014 отзиви и реални резултати' },
    10: { cat: 'plasma', desc: 'Плазма пен PhiIon \u2014 процедура в действие' },
    11: { cat: 'studio', desc: 'С колеги \u2014 споделени моменти и приятелство' },
    12: { cat: 'lashes', desc: 'Мигли преди и след \u2014 видима трансформация' },
    13: { cat: 'microblading', desc: 'Микроблейдинг \u2014 готов резултат' },
    14: { cat: 'studio', desc: 'Beauty Atelier IN \u2014 студио за красота, Силистра' },
    15: { cat: 'lashes', desc: 'Обемни мигли \u2014 колаж от резултати' },
    16: { cat: 'lamination', desc: 'Ламиниране \u2014 подготовка за процедурата' },
    17: { cat: 'lamination', desc: 'Ламиниране на вежди \u2014 преди и след' },
    18: { cat: 'piercing', desc: 'Бебешки обици \u2014 нежно и безопасно поставяне' },
    19: { cat: 'microblading', desc: 'Микроблейдинг \u2014 процес на работа' },
    20: { cat: 'lashes', desc: 'Поставяне на мигли \u2014 елегантен резултат' },
    21: { cat: 'plasma', desc: 'Плазма пен \u2014 нехирургична блефаропластика' },
    22: { cat: 'lashes', desc: 'Мигли \u2014 преди и след поставянето' },
    23: { cat: 'lashes', desc: 'Обемни мигли \u2014 плътност и дълбочина' },
    24: { cat: 'piercing', desc: 'Пробиване на уши \u2014 безболезнен метод' },
    25: { cat: 'microneedling', desc: 'Микронидлинг \u2014 процедура за подмладяване' },
    26: { cat: 'lashes', desc: 'Мигли \u2014 артистичен поглед' },
    27: { cat: 'studio', desc: 'Beauty Atelier IN \u2014 зад кулисите' },
    28: { cat: 'lashes', desc: 'Поставяне на мигли \u2014 естествен обем' },
    29: { cat: 'studio', desc: 'Сертификат за ламиниране и ботокс терапия' },
    30: { cat: 'lashes', desc: 'Мигли \u2014 мек и женствен ефект' },
    31: { cat: 'microneedling', desc: 'Микронидлинг \u2014 сияйна и обновена кожа' },
    32: { cat: 'lashes', desc: 'Поставяне на мигли \u2014 финален резултат' },
    33: { cat: 'microblading', desc: 'Микроблейдинг \u2014 всяка жена заслужава красиви вежди' },
    34: { cat: 'studio', desc: 'Beauty Atelier IN \u2014 промоция и грижа' },
    35: { cat: 'lashes', desc: 'Обемни мигли \u2014 драматичен ефект' },
    36: { cat: 'lamination', desc: 'Ламиниране на мигли \u2014 процес и резултат' },
    37: { cat: 'lashes', desc: 'Мигли \u2014 красота в детайлите' },
    38: { cat: 'microneedling', desc: 'Микронидлинг \u2014 регенерация и хидратация' },
    39: { cat: 'lamination', desc: 'Ламиниране на вежди \u2014 пълна трансформация' },
    40: { cat: 'piercing', desc: 'Бебешки обици \u2014 с грижа и любов' },
    41: { cat: 'microblading', desc: 'Микроблейдинг \u2014 финална визия' },
    42: { cat: 'plasma', desc: 'Плазма пен PhiIon \u2014 третиране на клепачи' },
    43: { cat: 'microneedling', desc: 'Микронидлинг \u2014 реални отзиви и резултати' },
    44: { cat: 'lashes', desc: 'Обемни мигли \u2014 максимална плътност' },
    45: { cat: 'plasma', desc: 'Плазма пен \u2014 подмладяване на кожата около очите' },
    46: { cat: 'lamination', desc: 'Ламиниране на вежди \u2014 преди и след' },
    47: { cat: 'microblading', desc: 'Микроблейдинг \u2014 работа с клиент' },
    48: { cat: 'microblading', desc: 'Микроблейдинг \u2014 естествен резултат' }
};

// ── Count per category (images + videos that belong to each) ──
const categoryOrder = ['microblading', 'lashes', 'lamination', 'microneedling', 'plasma', 'piercing', 'pmu-removal', 'studio'];
const counts = { all: images.length + videos.length };
categoryOrder.forEach(c => {
    const imgCount = (groups[c] || []).length;
    const vidCount = videos.filter((f, i) => (videoMeta[i] || {}).cat === c).length;
    counts[c] = imgCount + vidCount;
});
counts['videos'] = videos.length;

// ── Generate filter buttons ──
function filterButtons() {
    let html = '';
    html += `                    <button class="gallery-filter__btn active" data-filter="all" data-i18n="gallery.filter.all">Всички <span class="gallery-filter__count">${counts.all}</span></button>\n`;
    categoryOrder.forEach(cat => {
        if (counts[cat] > 0) {
            html += `                    <button class="gallery-filter__btn" data-filter="${cat}" data-i18n="gallery.filter.${cat}">${catLabels[cat]} <span class="gallery-filter__count">${counts[cat]}</span></button>\n`;
        }
    });
    html += `                    <button class="gallery-filter__btn" data-filter="videos" data-i18n="gallery.filter.videos">Видеа <span class="gallery-filter__count">${counts.videos}</span></button>\n`;
    return html;
}

// ── Generate image cards ──
function imageCards() {
    let html = '';
    categoryOrder.forEach(cat => {
        if (!groups[cat]) return;
        groups[cat].forEach(file => {
            const src = `assets/images/gallery-page/${file}`;
            const label = catLabels[cat];
            const desc = getDesc(file);
            const altText = desc || (label + ' – Beauty Atelier IN');
            html += `
                    <div class="gallery-item" data-category="${cat}" data-desc="${desc.replace(/"/g, '&quot;')}">
                        <div class="gallery-card">
                            <div class="gallery-card__img">
                                <img src="${src}" alt="${altText}" loading="lazy">
                            </div>
                            <div class="gallery-card__overlay">
                                <a href="${src}" class="gallery-popup-trigger" aria-label="Увеличи снимка">
                                    <span class="gallery-card__zoom"><i class="icon-search"></i></span>
                                </a>
                            </div>
                            <div class="gallery-card__info">
                                <span class="gallery-card__cat">${label}</span>
                                ${desc ? '<div class="gallery-card__desc">' + desc + '</div>' : ''}
                            </div>
                        </div>
                    </div>
`;
        });
    });
    return html;
}

// ── Generate video cards ──
function videoCards() {
    let html = '';
    videos.forEach((file, i) => {
        const rawSrc = `assets/images/videos/${file}`;
        const thumbName = `vid-thumb-${String(i).padStart(2, '0')}.jpg`;
        const thumbSrc = `assets/images/video-thumbs/${thumbName}`;
        const id = `gallery-vid-${i}`;
        const meta = videoMeta[i] || { cat: 'studio', desc: '' };
        const cats = `videos ${meta.cat}`;
        const desc = meta.desc;
        html += `
                    <div class="gallery-item" data-category="${cats}" data-desc="${desc.replace(/"/g, '&quot;')}">
                        <div class="gallery-card gallery-card--video">
                            <div class="gallery-card__img">
                                <img src="${thumbSrc}" alt="${desc || 'Видео \u2014 Beauty Atelier IN'}" loading="lazy">
                            </div>
                            <div class="gallery-card__overlay gallery-card__overlay--video">
                                <a href="#${id}" class="gallery-video-popup" aria-label="Пусни видео">
                                    <span class="gallery-card__play">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                    </span>
                                </a>
                            </div>
                            <div class="gallery-card__info">
                                <span class="gallery-card__cat">${catLabels[meta.cat] || 'Видео'}</span>
                                ${desc ? '<div class="gallery-card__desc">' + desc + '</div>' : ''}
                            </div>
                        </div>
                        <div id="${id}" class="mfp-hide">
                            <div class="gallery-video-inline" data-video-src="${rawSrc}">
                                <div class="gallery-video-loader"></div>
                            </div>
                            ${desc ? '<div class="gallery-video-desc">' + desc + '</div>' : ''}
                        </div>
                    </div>
`;
    });
    return html;
}

// ── Read gallery.html template ──
const template = fs.readFileSync('c:/xampp/htdocs/ba-in/gallery.html', 'utf-8');

// ── Find the gallery section and replace it ──
const gallerySection = `        <!-- ========================= GALLERY SECTION ========================= -->
        <section class="gallery-page section-space">
            <div class="container">
                <!-- Section title -->
                <div class="sec-title text-center wow fadeInUp" data-wow-duration="1500ms">
                    <div class="sec-title__top">
                        <img src="assets/images/shapes/sec-title-s-1-1.webp" alt="" class="sec-title__img">
                        <h6 class="sec-title__tagline" data-i18n="gallery.section_tagline">Резултати от процедури</h6>
                    </div>
                    <h2 class="sec-title__title" data-i18n-html="gallery.section_title">Нашата <span>Галерия</span></h2>
                </div>

                <!-- Filter buttons -->
                <div class="gallery-filter" id="galleryFilter">
${filterButtons()}                </div>

                <!-- Stats -->
                <div class="gallery-stats">
                    <span data-i18n="gallery.filter.all">Показани</span>: <span class="gallery-stats__num" id="galleryShown">12</span> / <span class="gallery-stats__num" id="galleryTotal">${counts.all}</span>
                </div>

                <!-- Gallery grid -->
                <div class="gallery-grid" id="galleryGrid">
${imageCards()}${videoCards()}
                </div>

                <!-- Load more -->
                <div class="gallery-load-more">
                    <button class="gallery-load-more__btn" id="galleryLoadMore" data-i18n="gallery.load_more">
                        Зареди още
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                </div>
            </div>
        </section>
        <!-- ========================= /GALLERY SECTION ========================= -->`;

// Replace the old gallery section
const startMarker = '        <!-- ========================= GALLERY SECTION =========================';
const endMarker = '        <!-- ========================= /GALLERY SECTION ========================= -->';

const startIdx = template.indexOf(startMarker);
const endIdx = template.indexOf(endMarker) + endMarker.length;

let newContent;
if (startIdx !== -1 && endIdx > startIdx) {
    newContent = template.substring(0, startIdx) + gallerySection + template.substring(endIdx);
} else {
    console.error('Could not find gallery section markers!');
    process.exit(1);
}

// ── Update the inline script ──
const oldScript = `    <!-- Gallery filter + video lightbox -->
    <script>
    (function($){
        // Gallery filter
        var $filterBtns = $('#galleryFilter li');
        var $items = $('#galleryGrid .gallery-item');

        $filterBtns.on('click', function(){
            $filterBtns.removeClass('active');
            $(this).addClass('active');

            var filter = $(this).attr('data-filter');

            $items.each(function(){
                var cats = $(this).attr('data-category') || '';
                if (filter === 'all' || cats.indexOf(filter) !== -1) {
                    $(this).fadeIn(300);
                } else {
                    $(this).fadeOut(300);
                }
            });
        });

        // Video lightbox (for self-hosted MP4 videos)
        $('.gallery-video-popup').magnificPopup({
            type: 'inline',
            midClick: true,
            callbacks: {
                open: function() {
                    var $video = this.content.find('video');
                    if ($video.length) $video[0].play();
                },
                close: function() {
                    var $video = this.content.find('video');
                    if ($video.length) { $video[0].pause(); $video[0].currentTime = 0; }
                }
            }
        });
    })(jQuery);
    </script>`;

const newScript = `    <!-- Gallery: filter, load-more, video lightbox -->
    <script>
    (function($){
        var ITEMS_PER_PAGE = 12;
        var $allItems = $('#galleryGrid .gallery-item');
        var $filterBtns = $('#galleryFilter .gallery-filter__btn');
        var $loadMoreBtn = $('#galleryLoadMore');
        var $shownEl = $('#galleryShown');
        var $totalEl = $('#galleryTotal');
        var currentFilter = 'all';
        var currentShown = 0;

        function getFiltered() {
            if (currentFilter === 'all') return $allItems;
            return $allItems.filter('[data-category="' + currentFilter + '"]');
        }

        function showPage(reset) {
            var $filtered = getFiltered();
            var total = $filtered.length;

            if (reset) {
                currentShown = 0;
                $allItems.addClass('is-hidden');
            }

            var end = Math.min(currentShown + ITEMS_PER_PAGE, total);
            $filtered.slice(currentShown, end).removeClass('is-hidden');
            currentShown = end;

            $shownEl.text(currentShown);
            $totalEl.text(total);

            if (currentShown >= total) {
                $loadMoreBtn.prop('disabled', true).text($loadMoreBtn.attr('data-i18n-done') || 'Няма повече');
            } else {
                $loadMoreBtn.prop('disabled', false).text($loadMoreBtn.attr('data-i18n-text') || 'Зареди още');
            }

            // Re-init Magnific Popup for newly visible items
            initPopups();
        }

        // Filter click
        $filterBtns.on('click', function(){
            $filterBtns.removeClass('active');
            $(this).addClass('active');
            currentFilter = $(this).attr('data-filter');
            showPage(true);
        });

        // Load More click
        $loadMoreBtn.attr('data-i18n-text', $loadMoreBtn.text());
        $loadMoreBtn.attr('data-i18n-done', 'Няма повече');
        $loadMoreBtn.on('click', function(){ showPage(false); });

        // Magnific Popup
        function initPopups() {
            $('.gallery-item:not(.is-hidden) .img-popup').magnificPopup({
                type: 'image',
                gallery: { enabled: true, navigateByImgClick: true, preload: [1, 1] },
                mainClass: 'mfp-fade',
                removalDelay: 300
            });

            $('.gallery-item:not(.is-hidden) .gallery-video-popup').magnificPopup({
                type: 'inline',
                midClick: true,
                mainClass: 'mfp-fade',
                removalDelay: 300,
                callbacks: {
                    open: function() {
                        var v = this.content.find('video')[0];
                        if (v) v.play();
                    },
                    close: function() {
                        var v = this.content.find('video')[0];
                        if (v) { v.pause(); v.currentTime = 0; }
                    }
                }
            });
        }

        // Initial load
        showPage(true);

        // Preload video poster frames: seek to 0.5s
        $allItems.find('.gallery-card--video video').each(function(){
            this.currentTime = 0.5;
        });
    })(jQuery);
    </script>`;

newContent = newContent.replace(oldScript, newScript);

fs.writeFileSync('c:/xampp/htdocs/ba-in/gallery.html', newContent, 'utf-8');
console.log('gallery.html rebuilt successfully!');
console.log(`Total items: ${counts.all} (${images.length} images + ${videos.length} videos)`);
Object.keys(counts).forEach(k => console.log(`  ${k}: ${counts[k]}`));
