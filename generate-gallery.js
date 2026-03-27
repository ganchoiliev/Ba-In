const fs = require('fs');
const path = require('path');

const imgDir = 'c:/xampp/htdocs/ba-in/assets/images/gallery-page';
const vidDir = 'c:/xampp/htdocs/ba-in/assets/images/videos';

// ── Image categorization rules ──
function categorizeImage(filename) {
    const f = filename.toLowerCase();

    // Skip/exclude list
    if (f.includes('studio_newyear') || f.includes('vaucher')) return null;

    // Certificates & courses → studio
    if (f.includes('certificate') || f.includes('cource') || f.includes('course') || f.includes('given_cert') || f.includes('group_people'))
        return 'studio';

    // Personal/portrait → studio
    if (f.startsWith('iliyana') || f === 'mila_savova_my_teacher.jpg' || f.includes('iliyana_with') || f.includes('iliyana_working') || f.includes('iliyana_certificate'))
        return 'studio';

    // Clients → studio
    if (f.startsWith('client'))
        return 'studio';

    // Microblading
    if (f.startsWith('microblading'))
        return 'microblading';

    // Microneedling
    if (f.startsWith('microneedling') || f.startsWith('microneeedling'))
        return 'microneedling';

    // Plasma pen / beloflastika / skin tags
    if (f.startsWith('plasmapen') || f.startsWith('beloflastika') || f.includes('skin_tags'))
        return 'plasma';

    // Piercing
    if (f.includes('piercing'))
        return 'piercing';

    // PMU removal
    if (f.includes('perpement_makeup') || f.includes('perm_makeup'))
        return 'pmu-removal';

    // Lashes (eyelashesh, lashesh, cateye)
    if (f.includes('eyelashesh') || f.includes('lashesh') || f.includes('cateye') || f === 'eyelashes.png' || f === 'eyelashes_eyebrows.png')
        return 'lashes';

    // Lamination
    if (f.includes('lamination') || f.includes('laminirane'))
        return 'lamination';

    // Brows + lashes combo
    if (f === 'brows_lashesh.jpg' || f === 'old_image_lashesh_and_brows.jpg')
        return 'lashes';

    // Eyebrow cleaning (could be part of microblading prep)
    if (f.includes('cleaning') || f.includes('eyebrows') || f.includes('eyevrows') || f.includes('first_time_eyebrows'))
        return 'microblading';

    // Retush
    if (f === 'retush.jpg')
        return 'microblading';

    return 'studio'; // fallback
}

// ── Read and categorize images ──
const images = fs.readdirSync(imgDir)
    .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map(f => ({ file: f, category: categorizeImage(f) }))
    .filter(i => i.category !== null);

// ── Group by category ──
const groups = {};
images.forEach(img => {
    if (!groups[img.category]) groups[img.category] = [];
    groups[img.category].push(img.file);
});

console.log('\n=== IMAGE CATEGORIES ===');
Object.keys(groups).sort().forEach(cat => {
    console.log(`${cat}: ${groups[cat].length} images`);
});
console.log(`TOTAL: ${images.length} images\n`);

// ── Read videos (exclude duplicates with " (1)") ──
const videos = fs.readdirSync(vidDir)
    .filter(f => /\.mp4$/i.test(f) && !f.includes('(1)'))
    .sort();

console.log(`VIDEOS: ${videos.length} unique files\n`);

// ── Generate gallery HTML cards ──
function makeImageCard(file, category, index) {
    const src = `assets/images/gallery-page/${file}`;
    const alt = getCategoryLabel(category);
    return `                    <!-- ${category} -->
                    <div class="col-6 col-md-4 col-lg-3 gallery-item" data-category="${category}">
                        <div class="gallery-card">
                            <div class="gallery-card__img">
                                <img src="${src}" alt="${alt}" loading="lazy">
                            </div>
                            <div class="gallery-card__overlay">
                                <a href="${src}" class="img-popup" aria-label="Увеличи снимка">
                                    <span class="gallery-card__zoom"><i class="icon-search"></i></span>
                                </a>
                                <span class="gallery-card__cat">${alt}</span>
                            </div>
                        </div>
                    </div>`;
}

function makeVideoCard(file, index) {
    const src = `assets/images/videos/${file}`;
    const id = `video-${index}`;
    return `                    <!-- video -->
                    <div class="col-6 col-md-4 col-lg-3 gallery-item" data-category="videos">
                        <div class="gallery-card gallery-card--video">
                            <div class="gallery-card__img">
                                <video src="${src}" muted preload="metadata" loading="lazy"></video>
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
                            <div class="gallery-video-inline">
                                <video src="${src}" controls playsinline preload="none"></video>
                            </div>
                        </div>
                    </div>`;
}

function getCategoryLabel(cat) {
    const labels = {
        'microblading': 'Микроблейдинг',
        'lashes': 'Миглопластика',
        'lamination': 'Ламиниране',
        'microneedling': 'Микронидлинг',
        'plasma': 'Плазма Пен',
        'piercing': 'Пробиване',
        'pmu-removal': 'Премахване на ПМГ',
        'studio': 'Студио'
    };
    return labels[cat] || cat;
}

// ── Build ordered output ──
const categoryOrder = ['microblading', 'lashes', 'lamination', 'microneedling', 'plasma', 'piercing', 'pmu-removal', 'studio'];
let allCards = [];

categoryOrder.forEach(cat => {
    if (groups[cat]) {
        groups[cat].forEach((file, i) => {
            allCards.push(makeImageCard(file, cat, i));
        });
    }
});

// Add video cards
videos.forEach((file, i) => {
    allCards.push(makeVideoCard(file, i));
});

// Write output
const output = allCards.join('\n\n');
fs.writeFileSync('c:/xampp/htdocs/ba-in/gallery-cards-generated.html', output, 'utf-8');
console.log(`Generated ${allCards.length} total cards (${images.length} images + ${videos.length} videos)`);
console.log('Output: gallery-cards-generated.html');
