const fs = require('fs');
const path = require('path');

// After adding media and editing captions, run node build-gallery-page.js,
// then the project's atelier, bundle and cache-stamp scripts. Use --thumbnails
// to optimize new photo previews with Python/Pillow before building the partial.
const root = __dirname;
const imgDir = path.join(root, 'assets/images/gallery-page');
const vidDir = path.join(root, 'assets/images/videos');
const partial = path.join(root, 'scripts/partials/gallery-main.html');

// ── Image categorization ──
function categorizeImage(filename) {
    const f = filename.toLowerCase();
    // Two non-published microblading originals also exist in the asset folder.
    if (f === 'microblading3.jpg' || f === 'microblading4.jpg') return null;
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
                      'old_image_lashesh_and_brows.jpg','lashesh.jpg',
                      'cateye_eyelashesh.jpg','lashesh_3d.jpg'];
    if (trueLashes.indexOf(f) !== -1) return 'lashes';

    // Lash lift / lamination — natural lashes lifted and curled
    if (f.includes('eyelashesh') || f.includes('lashesh')
        || f === 'brows_lashesh.jpg' || f === 'eyelashes_eyebrows.png') return 'lamination';

    if (f.includes('lamination') || f.includes('laminirane')) return 'lamination';
    // Eyebrow cleaning/shaping = brow lamination, not microblading
    if (f.includes('cleaning') || f.includes('eyevrows') || f.includes('first_time_eyebrows') || f === 'eyebrows14.jpg') return 'lamination';
    // eyebrows3.png is lamination, retush.jpg is microblading retouch
    if (f === 'eyebrows3.png') return 'lamination';
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

// ── Video categories and descriptions ──
const videoMeta = {
    0:  { cat: 'lamination', desc: 'Ламиниране на вежди и поставяне на мигли \u2014 подчертай естествената си красота с перфектно оформени вежди и изразителен поглед' },
    1:  { cat: 'microblading', desc: 'PhiBrows микроблейдинг \u2014 естествени косъмчета' },
    2:  { cat: 'lashes', desc: 'Обемни мигли \u2014 класика, обем или мега обем' },
    3:  { cat: 'lashes', desc: 'Мигли преди и след \u2014 впечатляващ резултат' },
    4:  { cat: 'studio', desc: 'Beauty Atelier IN \u2014 подготовка на новото студио' },
    5:  { cat: 'studio', desc: 'Beauty Atelier IN \u2014 красота и вдъхновение' },
    6:  { cat: 'studio', desc: 'Благодаря на приятели \u2014 празнично настроение' },
    7:  { cat: 'microneedling', desc: 'Микронидлинг PhiLings \u2014 стимулация на колагена' },
    8:  { cat: 'lashes', desc: 'Поставяне на мигли \u2014 подчертан и изразителен поглед' },
    9:  { cat: 'plasma', desc: 'Плазма пен \u2014 отзиви от различни процедури' },
    10: { cat: 'plasma', desc: 'Плазма пен PhiIon \u2014 процедура в действие' },
    11: { cat: 'studio', desc: 'С колеги \u2014 споделени моменти и приятелство' },
    12: { cat: 'lashes', desc: 'Мигли преди и след \u2014 видима трансформация' },
    13: { cat: 'microblading', desc: 'Микроблейдинг \u2014 готов резултат' },
    14: { cat: 'studio', desc: 'Beauty Atelier IN \u2014 студио за красота, Силистра' },
    15: { cat: 'lashes', desc: 'Обемни мигли \u2014 колаж от резултати' },
    16: { cat: 'lamination', desc: 'Да си част от нечия сбъдната мечта е привилегия \u2014 благодаря за доверието' },
    17: { cat: 'lamination', desc: 'Микроблейдинг след ретуш \u2014 перфектен резултат' },
    18: { cat: 'piercing', desc: 'Бебешки обици \u2014 нежно и безопасно поставяне' },
    19: { cat: 'lashes', desc: 'Да си булка е нещо специално, а миглите \u2014 онзи финален щрих, който прави погледа незабравим' },
    20: { cat: 'lashes', desc: 'Поставяне на мигли \u2014 елегантен резултат' },
    21: { cat: 'microblading', desc: 'Благодаря за доверието и невероятните емоции \u2014 микроблейдинг' },
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
    36: { cat: 'microblading', desc: 'Микроблейдинг \u2014 радостта да се докосна до красиви души и да творя с вдъхновение' },
    37: { cat: 'lashes', desc: 'Мигли \u2014 красота в детайлите' },
    38: { cat: 'microneedling', desc: 'Микронидлинг \u2014 регенерация и хидратация' },
    39: { cat: 'lamination', desc: 'Ламиниране на вежди \u2014 пълна трансформация' },
    40: { cat: 'piercing', desc: 'Бебешки обици \u2014 с грижа и любов' },
    41: { cat: 'microblading', desc: 'Микроблейдинг \u2014 финална визия' },
    42: { cat: 'plasma', desc: 'Плазма пен PhiIon \u2014 третиране на клепачи' },
    43: { cat: 'microneedling', desc: 'Отзиви от различни процедури \u2014 ревюта от Google' },
    44: { cat: 'lashes', desc: 'Обемни мигли \u2014 максимална плътност' },
    45: { cat: 'plasma', desc: 'Плазма пен \u2014 подмладяване на кожата около очите' },
    46: { cat: 'microblading', desc: 'Микроблейдинг \u2014 преди и след' },
    47: { cat: 'microblading', desc: 'Микроблейдинг \u2014 работа с клиент' },
    48: { cat: 'lamination', desc: 'Пакетна цена \u2014 ламиниране на мигли и вежди + боядисване + ботокс терапия' }
};

const descriptions = require('./assets/data/gallery-descriptions.json');
const english = require('./assets/data/gallery-descriptions-en.json');
const categories = Object.keys(catLabels).filter(category => category !== 'videos');
const featured = [
    'laminirane-migli-predi-sled-2026-09.jpg', 'iliyana_working.jpg', 'eyelashesh15.jpg',
    'studio-interior-07.jpg', 'microblading2.jpg', 'eyebrows_cleaning1.jpg',
];

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

const photos = fs.readdirSync(imgDir).sort()
    .filter(file => /\.(?:jpe?g|png|webp)$/i.test(file))
    .map(file => {
        const category = categorizeImage(file);
        const source = 'assets/images/gallery-page/' + file;
        const preview = 'assets/images/gallery-thumbs/' + file + '.webp';
        return {
            file, category, source, video: false,
            preview,
            caption: descriptions[file] || descriptions[file.toLowerCase()] || catLabels[category]
        };
    })
    .filter(item => item.category);

if (process.argv.includes('--thumbnails')) {
    const {execFileSync} = require('child_process');
    execFileSync('python3', [path.join(root, 'scripts/gallery-thumbnails.py'), ...photos.map(item => item.file)], {stdio: 'inherit'});
}
for (const photo of photos) {
    if (!fs.existsSync(path.join(root, photo.preview))) photo.preview = photo.source;
}

photos.sort((left, right) => {
    const rank = item => {
        const position = featured.indexOf(item.file);
        return position < 0 ? featured.length + categories.indexOf(item.category) : position;
    };
    return rank(left) - rank(right);
});

const videos = fs.readdirSync(vidDir).sort()
    .filter(file => /\.mp4$/i.test(file) && !file.includes('(1)'))
    .map(file => {
        // The filename fixes each poster and caption even if a clip is removed.
        const number = /^video-(\d+)\.mp4$/i.exec(file);
        if (!number) throw new Error('Use a numbered video filename: ' + file);
        const index = Number(number[1]) - 1;
        const meta = videoMeta[index] || {cat: 'studio', desc: 'Видео от ателието'};
        const preview = 'assets/images/video-thumbs/vid-thumb-' + String(index).padStart(2, '0') + '.jpg';
        if (!fs.existsSync(path.join(root, preview))) throw new Error('Missing video poster: ' + preview);
        return {file, category: meta.cat, source: 'assets/images/videos/' + file,
            preview, video: true, index, caption: meta.desc};
    });

const items = [...photos, ...videos];
const counts = Object.fromEntries(categories.map(category => [category, 0]));
for (const item of items) counts[item.category]++;
counts.all = items.length;
counts.videos = videos.length;
const labels = {all: 'Всички', ...catLabels};
const choices = ['all', ...categories, 'videos'].filter(category => counts[category] > 0)
    .map(category => `<option value="${category}" data-count="${counts[category]}" data-i18n="gallery.filter.${category}">${labels[category]}</option>`);
// The filter groups describe the collection. A particular photograph or clip
// can show a different service, two services, or simply a moment at the studio.
const treatmentOverrides = {
    'cleaning_eyebrows.jpg': 'brow-shaping',
    'cleaning_eyebrows_first_time.jpg': 'brow-shaping',
    'eyebrows_cleaning.jpg': 'brow-shaping',
    'eyebrows_cleaning1.jpg': 'brow-shaping',
    'eyebrows_cleaning11.jpg': 'brow-shaping',
    'eyebrows_cleaning3.jpg': 'brow-shaping',
    'eyebrows_cleaning_firstime.jpg': 'brow-shaping',
    'eyevrows_cleaning.jpg': 'brow-shaping',
    'first_time_eyebrows.jpg': 'brow-shaping',
    'lamination5.jpg': 'lamination brow-shaping',
    'lamination_eyebrows_cleaning.jpg': 'lamination brow-shaping',
    'lamination_first_cleaning_eyebrows.jpg': 'lamination brow-shaping',
    'eyelashes.png': 'lashes',
    'video-01.mp4': 'lamination lashes',
    'video-10.mp4': '',
    'video-17.mp4': '',
    'video-18.mp4': 'microblading',
    'video-44.mp4': ''
};

const cards = items.map((item, index) => {
    const category = item.category;
    const treatments = treatmentOverrides[item.file];
    const override = treatments === undefined ? '' : ` data-treatments="${treatments}"`;
    const translation = english[item.file];
    const caption = escapeHtml(item.caption);
    const englishText = translation ? `<span lang="en">${escapeHtml(translation)}</span>` : '';
    const languages = translation ? ' at-photo__caption--translated' : '';
    const id = item.video ? ` id="gallery-vid-${item.index}"` : '';
    const play = item.video ? '<span class="at-photo__play" aria-hidden="true">▶</span><span class="at-sr" data-i18n="atelier.gallery_video">Видео</span>' : '';
    const priority = index === 0 ? 'fetchpriority="high"' : 'loading="lazy"';
    return `<a class="at-photo"${id} href="${escapeHtml(item.source)}" data-category="${category}"${override} data-kind="${item.video ? 'video' : 'photo'}">
                    <span class="at-photo__image"><img src="${escapeHtml(item.preview)}" ${priority} decoding="async" alt="">${play}</span>
                    <span class="at-photo__category" data-i18n="gallery.filter.${category}">${catLabels[category]}</span>
                    <span class="at-photo__caption${languages}"><span lang="bg">${caption}</span>${englishText}</span>
                </a>`;
});

let out = fs.readFileSync(partial, 'utf8');
for (const [region, lines] of [['filters', choices], ['items', cards]]) {
    const start = '<!-- gallery:' + region + ' -->';
    const end = '<!-- /gallery:' + region + ' -->';
    const from = out.indexOf(start), to = out.indexOf(end);
    if (from < 0 || to <= from) throw new Error('Missing gallery partial region: ' + region);
    const indent = out.slice(out.lastIndexOf('\n', from) + 1, from);
    out = out.slice(0, from + start.length) + '\n' + indent + lines.join('\n' + indent) + '\n' + indent + out.slice(to);
}
fs.writeFileSync(partial, out);
console.log(`Gallery: ${photos.length} photographs, ${videos.length} videos.`);
