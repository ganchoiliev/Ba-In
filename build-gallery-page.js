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
    if (f.includes('eyelashesh') || f.includes('lashesh') || f.includes('cateye') || f === 'eyelashes.png' || f === 'eyelashes_eyebrows.png') return 'lashes';
    if (f.includes('lamination') || f.includes('laminirane')) return 'lamination';
    if (f === 'brows_lashesh.jpg' || f === 'old_image_lashesh_and_brows.jpg') return 'lashes';
    if (f.includes('cleaning') || f.includes('eyebrows') || f.includes('eyevrows') || f.includes('first_time_eyebrows')) return 'microblading';
    if (f === 'retush.jpg') return 'microblading';
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

// ── Count per category ──
const categoryOrder = ['microblading', 'lashes', 'lamination', 'microneedling', 'plasma', 'piercing', 'pmu-removal', 'studio'];
const counts = { all: images.length + videos.length };
categoryOrder.forEach(c => { counts[c] = (groups[c] || []).length; });
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
            html += `
                    <div class="gallery-item" data-category="${cat}">
                        <div class="gallery-card">
                            <div class="gallery-card__img">
                                <img src="${src}" alt="${label} – Beauty Atelier IN" loading="lazy">
                            </div>
                            <div class="gallery-card__overlay">
                                <a href="${src}" class="gallery-popup-trigger" aria-label="Увеличи снимка">
                                    <span class="gallery-card__zoom"><i class="icon-search"></i></span>
                                </a>
                                <span class="gallery-card__cat">${label}</span>
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
        html += `
                    <div class="gallery-item" data-category="videos">
                        <div class="gallery-card gallery-card--video">
                            <div class="gallery-card__img">
                                <img src="${thumbSrc}" alt="Видео – Beauty Atelier IN" loading="lazy">
                            </div>
                            <div class="gallery-card__overlay gallery-card__overlay--video">
                                <a href="#${id}" class="gallery-video-popup" aria-label="Пусни видео">
                                    <span class="gallery-card__play">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                    </span>
                                </a>
                            </div>
                        </div>
                        <div id="${id}" class="mfp-hide">
                            <div class="gallery-video-inline" data-video-src="${rawSrc}">
                                <div class="gallery-video-loader"></div>
                            </div>
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
