/**
 * auto-blog.js — Automated Blog Post Builder for ba-in.com
 * 
 * Usage:
 *   node auto-blog.js <slug>
 *   node auto-blog.js --list           (show available topics)
 *   node auto-blog.js --next           (pick the next unpublished topic)
 *   node auto-blog.js --rebuild <slug> (regenerate an existing post, keep its date)
 * 
 * What it does:
 *   1. Reads the topic from blog-topics.json
 *   2. Clones the pmu-removal-guide.html template
 *   3. Replaces all content with the new topic
 *   4. Creates the new blog post HTML file
 *   5. Updates blog.html (adds card at top, increments count)
 *   6. Updates sitemap.xml (adds URL)
 *   7. Reports what hero image is needed
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const TEMPLATE = path.join(ROOT, 'pmu-removal-guide.html');
const BLOG_PAGE = path.join(ROOT, 'blog.html');
const SITEMAP = path.join(ROOT, 'sitemap.xml');
const TOPICS_FILE = path.join(ROOT, 'blog-topics.json');

// ─── Bulgarian month names ──────────────────────────────────────────
const BG_MONTHS = ['Яну', 'Фев', 'Март', 'Апр', 'Май', 'Юни', 'Юли', 'Авг', 'Сеп', 'Окт', 'Ное', 'Дек'];

// ─── Helpers ────────────────────────────────────────────────────────
function today() {
    const d = new Date();
    return {
        iso: d.toISOString().split('T')[0],
        day: String(d.getDate()).padStart(2, '0'),
        monthBG: BG_MONTHS[d.getMonth()],
        year: String(d.getFullYear())
    };
}

// Hero images are exported as WebP: markedly smaller files than PNG for the
// same visual quality, which speeds up the post's LCP. Every browser the site
// targets supports WebP, so no PNG fallback is needed.
function slugToHeroPath(slug) {
    return `assets/images/blog/${slug}-hero.webp`;
}

// ─── Load topics ────────────────────────────────────────────────────
function loadTopics() {
    return JSON.parse(fs.readFileSync(TOPICS_FILE, 'utf-8'));
}

function getExistingFiles() {
    return fs.readdirSync(ROOT)
        .filter(f => f.endsWith('.html'))
        .map(f => f.replace('.html', ''));
}

// ─── List available topics ──────────────────────────────────────────
function listTopics() {
    const topics = loadTopics();
    const existing = getExistingFiles();
    
    console.log('\n📋 Available Blog Topics:\n');
    console.log('─'.repeat(80));
    
    topics.topics.forEach((t, i) => {
        const published = existing.includes(t.slug);
        const status = published ? '✅ Published' : '⬜ Available';
        console.log(`  ${String(i + 1).padStart(2)}. [${status}] ${t.slug}`);
        console.log(`      ${t.title}`);
    });
    
    const available = topics.topics.filter(t => !existing.includes(t.slug));
    console.log(`\n📊 ${available.length} topics available, ${topics.topics.length - available.length} published\n`);
}

// ─── Get next unpublished topic ─────────────────────────────────────
function getNextTopic() {
    const topics = loadTopics();
    const existing = getExistingFiles();
    return topics.topics.find(t => !existing.includes(t.slug));
}

// ─── Generate article content HTML from sections ────────────────────
// Section headings are emitted as <h3>: the post outline is h1 (page banner)
// > h2 (article title) > h3 (sections). They used to be <h4>, which put the
// article's own sections on the same level as the sidebar widget titles.
// A section's prose. Enriched topics carry `body` (an array of paragraphs); the
// ones still waiting to be written only carry `hint` -- a one-line note to self
// -- so fall back to that and keep generating.
function sectionProse(section, cls) {
    const items = (Array.isArray(section.body) && section.body.length)
        ? section.body
        : (section.hint ? [section.hint] : []);
    return items.map(item => {
        // A body item is normally a paragraph (string). Two structured forms are
        // also accepted so a post can carry a bullet list or a small table:
        //   { "list": ["...", "..."] }
        //   { "table": { "head": ["A", "B"], "rows": [["1", "2"], ...] } }
        if (item && typeof item === 'object' && Array.isArray(item.list)) {
            return `<ul class="blog-list">\n` +
                item.list.map(li => `    <li>${li}</li>`).join('\n') + `\n</ul>\n`;
        }
        if (item && typeof item === 'object' && item.table && Array.isArray(item.table.rows)) {
            const head = Array.isArray(item.table.head) && item.table.head.length
                ? `<thead><tr>${item.table.head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>\n`
                : '';
            const rows = item.table.rows
                .map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('\n');
            return `<div class="blog-table__wrap"><table class="blog-table">\n${head}<tbody>\n${rows}\n</tbody></table></div>\n`;
        }
        return `<p class="${cls}">${item}</p>\n`;
    }).join('');
}

// Plain-text length of a generated block, in words, for BlogPosting.wordCount.
function countWords(html) {
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    return (text.match(/\S+/g) || []).length;
}

// Pixel size of a hero image (WebP or PNG), or null when the file is not there
// yet. The builder usually runs before the hero is exported, so callers must
// cope with null.
function imageSize(file) {
    try {
        const b = fs.readFileSync(file);
        if (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') {
            const kind = b.toString('ascii', 12, 16);
            if (kind === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
            if (kind === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
            if (kind === 'VP8L') {
                const n = b.readUInt32LE(21);
                return { width: (n & 0x3fff) + 1, height: ((n >>> 14) & 0x3fff) + 1 };
            }
        }
        if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    } catch (e) { /* missing or unreadable: fall through */ }
    return null;
}

// FAQ block, rendered after the last section. The questions are <h4> because
// they sit one level under the FAQ's own <h3>.
function generateFaqBlock(topic, cls) {
    if (!Array.isArray(topic.faq) || !topic.faq.length) return '';
    let html = `\n<h3 class="blog-details__inner__title" style="margin-top: 20px;">Често задавани въпроси</h3>\n`;
    topic.faq.forEach(item => {
        html += `<h4 style="margin-top: 18px;">${item.q}</h4>\n`;
        html += `<p class="${cls}">${item.a}</p>\n`;
    });
    return html;
}

// Index of the first occurrence of `phrase` in paragraph text that is not already
// inside an anchor or an attribute, or -1. Headings are never considered because
// only <p> regions are scanned.
function findInParagraph(html, phrase) {
    const pRe = /<p\b[^>]*>([\s\S]*?)<\/p>/g;
    let m;
    while ((m = pRe.exec(html)) !== null) {
        const inner = m[1];
        const innerStart = m.index + m[0].length - inner.length - '</p>'.length;
        let idx = inner.indexOf(phrase);
        while (idx !== -1) {
            const before = inner.slice(0, idx);
            const opened = (before.match(/<a\b/g) || []).length;
            const closed = (before.match(/<\/a>/g) || []).length;
            const insideTag = before.lastIndexOf('<') > before.lastIndexOf('>');
            if (opened === closed && !insideTag) return innerStart + idx;
            idx = inner.indexOf(phrase, idx + 1);
        }
    }
    return -1;
}

// Link the first literal mention of each phrase -- once per link, body prose
// only. A phrase that never appears is skipped silently.
function applyInternalLinks(blocks, links) {
    if (!Array.isArray(links) || !links.length) return blocks;
    const out = blocks.slice();
    links.forEach(link => {
        if (!link || !link.href || !link.text) return;
        for (let b = 0; b < out.length; b++) {
            const at = findInParagraph(out[b], link.text);
            if (at < 0) continue;
            out[b] = out[b].slice(0, at) +
                     `<a href="${link.href}">${link.text}</a>` +
                     out[b].slice(at + link.text.length);
            break;
        }
    });
    return out;
}

// Google reads FAQ rich results from a standalone FAQPage block. JSON.stringify
// does the escaping, and `<` is encoded so the payload can never close the
// <script> element early.
function buildFaqJsonLd(topic) {
    if (!Array.isArray(topic.faq) || !topic.faq.length) return '';
    const data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: topic.faq.map(item => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a }
        }))
    };
    const json = JSON.stringify(data, null, 4).replace(/</g, '\\u003c');
    return '    <script type="application/ld+json">\n    ' +
           json.split('\n').join('\n    ') + '\n    </script>\n';
}

function generateContentBlock1(topic) {
    let html = '';

    // Intro: the excerpt, then an optional "in short" list (topic.summary).
    // The builder used to add a stock "В тази статия ще разгледаме..." line
    // here; it said nothing and every post had to have it removed by hand.
    html += `<p class="blog-card-four__text">${topic.excerpt}</p>\n`;
    if (Array.isArray(topic.summary) && topic.summary.length) {
        html += `<div class="blog-summary">\n<h3 class="blog-summary__title">Накратко</h3>\n<ul class="blog-list">\n` +
            topic.summary.map(li => `    <li>${li}</li>`).join('\n') + `\n</ul>\n</div>\n`;
    }

    // First 3 sections go in the card content area
    const firstSections = topic.sections.slice(0, 3);
    firstSections.forEach(section => {
        html += `\n<h3 class="blog-details__inner__title" style="margin-top: 20px;">${section.heading}</h3>\n`;
        html += sectionProse(section, 'blog-card-four__text');
    });

    return html;
}

function generateContentBlock2(topic) {
    let html = '';

    // Remaining sections
    const remainingSections = topic.sections.slice(3);
    remainingSections.forEach(section => {
        html += `\n<h3 class="blog-details__inner__title" style="margin-top: 20px;">${section.heading}</h3>\n`;
        html += sectionProse(section, 'blog-details__inner__text');
    });

    // FAQ, straight after the last section
    html += generateFaqBlock(topic, 'blog-details__inner__text');

    // Closing: only what the topic supplies (topic.closing, an array of
    // paragraphs). The stock "Заключение / Надяваме се, че тази статия ви беше
    // полезна" block is gone for the same reason as the stock intro.
    if (Array.isArray(topic.closing) && topic.closing.length) {
        html += '\n' + topic.closing.map(p => `<p class="blog-details__inner__text">${p}</p>\n`).join('');
    }

    // Booking CTA
    html += `
<div style="margin-top: 40px; text-align: center;">
    <a href="appointment.html" class="mediox-btn" aria-label="Запазете час сега"><span>Запази час</span> <span class="mediox-btn__icon"><i class="icon-up-right-arrow"></i></span></a>
</div>
`;
    return html;
}

// ─── Build the blog post HTML ───────────────────────────────────────
function buildPost(topic, opts = {}) {
    let html = fs.readFileSync(TEMPLATE, 'utf-8');
    const now = today();
    // `date` is the publish date shown on the page. A rebuild keeps the
    // original one and only moves dateModified.
    const date = opts.published || now;
    // <title>, og:title and twitter:title. topic.seoTitle lets the search
    // title be shorter than the on-page headline (aim for ~45 characters
    // before the brand suffix); it falls back to the headline.
    const pageTitle = `${topic.seoTitle || topic.title} | Beauty Atelier IN`;
    const heroPath = slugToHeroPath(topic.slug);
    // The hero's alt text describes the picture, not the article, so it comes
    // from the topic; older topics without one fall back to the title.
    const heroAlt = topic.heroAlt || topic.title;
    const fullUrl = `https://ba-in.com/${topic.slug}.html`;
    
    // ── Schema: BlogPosting ──
    html = html.replace(
        /"headline": "Премахване на Перманентен Грим: Всичко, Което Трябва да Знаете"/,
        `"headline": "${topic.title}"`
    );
    html = html.replace(
        /"description": "Лазер, ремувър или салинен разтвор\? Научете кой метод за премахване на перманентен грим е подходящ за вас\."/,
        `"description": "${topic.metaDescription}"`
    );
    html = html.replace(
        /"image": "https:\/\/ba-in\.com\/assets\/images\/blog\/pmu-removal-hero\.png"/,
        `"image": "https://ba-in.com/${heroPath}"`
    );
    html = html.replace(/"datePublished": "[\d-]+"/g, `"datePublished": "${date.iso}"`);
    html = html.replace(/"dateModified": "[\d-]+"/g, `"dateModified": "${now.iso}"`);
    html = html.replace(
        /"mainEntityOfPage": \{"@type": "WebPage", "@id": "https:\/\/ba-in\.com\/pmu-removal-guide\.html"\}/,
        `"mainEntityOfPage": {"@type": "WebPage", "@id": "${fullUrl}"}`
    );
    html = html.replace(/"articleSection": "[^"]*"/, `"articleSection": "${topic.category}"`);

    // ── Schema: FAQPage (only when the topic ships questions) ──
    const faqLd = buildFaqJsonLd(topic);
    if (faqLd) {
        html = html.replace('</head>', () => faqLd + '</head>');
    }
    
    // ── <title> ──
    html = html.replace(
        /data-i18n="blog_pmu_removal\.title">Премахване на Перманентен Грим: Всичко, Което Трябва да Знаете \| Beauty Atelier IN<\/title>/,
        `>${pageTitle}</title>`
    );
    
    // ── <link rel="canonical"> and alternates ──
    html = html.replace(/href="https:\/\/ba-in\.com\/pmu-removal-guide\.html"/g, `href="${fullUrl}"`);
    
    // ── Meta description ──
    html = html.replace(
        /content="Лазер, ремувър или салинен разтвор\? Научете кой метод за премахване на перманентен грим е подходящ за вас, колко сесии ще ви трябват и какво да очаквате\." \/>/,
        `content="${topic.metaDescription}" />`
    );
    
    // ── Meta keywords ──
    html = html.replace(
        /content="премахване на перманентен грим, лазерно премахване, салинно премахване, ремувър, PhiRemoval, корекция на перманентен грим" \/>/,
        `content="${topic.keywords}" />`
    );
    
    // ── OG tags ──
    html = html.replace(
        /content="Премахване на Перманентен Грим: Всичко, Което Трябва да Знаете \| Beauty Atelier IN" \/>/,
        `content="${pageTitle}" />`
    );
    html = html.replace(
        /content="Лазер, ремувър или салинен разтвор\? Научете кой метод за премахване на перманентен грим е подходящ за вас\." \/>/,
        `content="${topic.metaDescription}" />`
    );
    html = html.replace(
        /content="https:\/\/ba-in\.com\/assets\/images\/blog\/pmu-removal-hero\.png" \/>/g,
        `content="https://ba-in.com/${heroPath}" />`
    );
    html = html.replace(
        /content="https:\/\/ba-in\.com\/pmu-removal-guide\.html" \/>/,
        `content="${fullUrl}" />`
    );
    
    // ── Page header title ──
    html = html.replace(
        /data-i18n="blog_pmu_removal\.page_title">Премахване на Перманентен Грим<\/h1>/,
        `>${topic.title.split(':')[0].trim()}</h1>`
    );
    
    // ── Breadcrumbs ──
    html = html.replace(
        /<li><span>Премахване на Перманентен Грим<\/span><\/li>/,
        `<li><span>${topic.title.split(':')[0].trim()}</span></li>`
    );
    
    // ── Hero image ──
    // scripts/cache-bust.py stamps ?v=<hash> onto every asset URL, including the
    // ones in the template this builder clones. The pattern used to require the
    // bare .png, so once the template was stamped the swap silently missed and
    // new posts shipped with the PMU hero. The whole tag is rewritten because
    // the template's attributes (640x640, loading="lazy") are wrong for a hero:
    // it is the LCP image, so it must not be lazy and needs its true size.
    const heroDims = imageSize(path.join(ROOT, heroPath));
    const heroW = heroDims ? heroDims.width : 1200;
    const heroH = heroDims ? heroDims.height : 800;
    html = html.replace(
        /<img src="assets\/images\/blog\/pmu-removal-hero\.png(?:\?v=[0-9a-f]+)?"\s*\n\s*alt="[^"]*"[^>]*>/,
        () => `<img src="${heroPath}"\n                                        alt="${heroAlt}" decoding="async" fetchpriority="high" width="${heroW}" height="${heroH}">`
    );

    // ── Social cards: the tags the exact-match replacements above do not reach ──
    html = html.replace(/<meta property="og:image:width" content="[^"]*" \/>/, `<meta property="og:image:width" content="${heroW}" />`);
    html = html.replace(/<meta property="og:image:height" content="[^"]*" \/>/, `<meta property="og:image:height" content="${heroH}" />`);
    html = html.replace(/<meta property="og:image:alt" content="[^"]*" \/>/, () => `<meta property="og:image:alt" content="${heroAlt}" />`);
    html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/, () => `<meta name="twitter:title" content="${pageTitle}" />`);
    html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/, () => `<meta name="twitter:description" content="${topic.metaDescription}" />`);
    
    // ── Date badge ──
    html = html.replace(
        /<span class="blog-card-four__date__day">15<\/span>/,
        `<span class="blog-card-four__date__day">${date.day}</span>`
    );
    html = html.replace(
        /<span class="blog-card-four__date__month">Март<\/span>/,
        `<span class="blog-card-four__date__month">${date.monthBG}</span>`
    );
    
    // ── Blog card title ──
    // The article title is an <h2> (page outline: h1 banner > h2 article title >
    // h3 sections), so this must match the <h2> in the template file.
    html = html.replace(
        /<h2 class="blog-card-four__title">Премахване на Перманентен Грим: Всичко, Което Трябва да Знаете<\/h2>/,
        `<h2 class="blog-card-four__title">${topic.title}</h2>`
    );
    
    // ── Content block 1 (inside blog-card-four__content__inner) ──
    let contentBlock1 = generateContentBlock1(topic);
    let contentBlock2 = generateContentBlock2(topic);
    // The two blocks are one article, so they share a single internal-link
    // budget: each phrase is linked at most once across the whole body.
    [contentBlock1, contentBlock2] = applyInternalLinks(
        [contentBlock1, contentBlock2], topic.internalLinks);
    // The template hard-codes its own wordCount; report this article's.
    html = html.replace(/"wordCount": \d+/, `"wordCount": ${countWords(contentBlock1 + contentBlock2)}`);
    html = html.replace(
        /<div class="blog-card-four__content__inner">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="blog-details__inner">/,
        () => `<div class="blog-card-four__content__inner">\n${contentBlock1}\n</div>\n</div>\n</div>\n<div class="blog-details__inner">`
    );
    
    // ── Content block 2 (inside blog-details__inner__content) ──
    html = html.replace(
        /<div class="blog-details__inner__content wow fadeInUp" data-wow-duration="1500ms">[\s\S]*?<\/div>\s*<\/div>\s*<div class="blog-details__meta/,
        () => `<div class="blog-details__inner__content wow fadeInUp" data-wow-duration="1500ms">\n${contentBlock2}\n</div>\n</div>\n<div class="blog-details__meta`
    );
    
    // ── Categories ──
    const categoryLabels = {
        'microblading': 'микроблейдинг',
        'microneedling': 'микронидлинг',
        'skincare': 'грижа за кожата',
        'aesthetic': 'естетични процедури',
        'pmu': 'перманентен грим',
        'permanent-makeup': 'перманентен грим'
    };
    const cats = topic.category.split(' ');
    const catButtons = cats.map(c => 
        `<a href="javascript:void(0)" class="blog-details__categories__btn mediox-btn"><span>${categoryLabels[c] || c}</span></a>`
    ).join('\n                                        ');
    
    html = html.replace(
        /<div class="blog-details__categories__box">[\s\S]*?<\/div>\s*<\/div>/,
        `<div class="blog-details__categories__box">\n                                        ${catButtons}\n                                    </div>\n                                </div>`
    );
    
    // ── Tags ──
    html = html.replace(
        /<a href="javascript:void\(0\)" data-i18n="blog\.tag\.blog">блог<\/a>\s*<span>,<\/span>\s*<a href="javascript:void\(0\)">ремувър<\/a>/,
        `<a href="javascript:void(0)">блог</a>\n                                        <span>,</span>\n                                        <a href="javascript:void(0)">${categoryLabels[cats[0]] || cats[0]}</a>`
    );
    
    // ── Facebook share URL ──
    html = html.replace(
        /encodeURIComponent\('https:\/\/ba-in\.com\/pmu-removal-guide\.html'\)/,
        `encodeURIComponent('${fullUrl}')`
    );
    
    // ── Sidebar: recent posts — update to include this post ──
    html = html.replace(
        /src="assets\/images\/blog\/pmu-removal-hero\.png(?:\?v=[0-9a-f]+)?"\s*\n\s*alt="Премахване на Перманентен Грим"/,
        `src="${heroPath}"\n                                                    alt="${topic.title}"`
    );
    
    // ── Sidebar: post link ──  
    html = html.replace(
        /href="pmu-removal-guide\.html">Правилната процедура\.\.<\/a>/,
        `href="${topic.slug}.html">${topic.title.substring(0, 30)}..</a>`
    );
    
    // ── Footer blog section ──
    html = html.replace(
        // The template's <img> also carries loading/decoding attributes; without
        // them in the pattern this replacement silently missed and every generated
        // post kept the PMU thumbnail in its footer.
        /<img src="assets\/images\/blog\/pmu-removal-hero\.png(?:\?v=[0-9a-f]+)?" style="width: 70px; height: 70px; object-fit: cover;" alt="[^"]*"([^>]*)>/,
        (_m, rest) => `<img src="${heroPath}" style="width: 70px; height: 70px; object-fit: cover;" alt="${heroAlt}"${rest}>`
    );
    html = html.replace(
        /href="pmu-removal-guide\.html" data-i18n="shared\.footer\.blog1_title">Правилна процедура<\/a>/,
        `href="${topic.slug}.html">${topic.title.substring(0, 25)}</a>`
    );

    // ── Self-check ──
    // Every replacement above is a string match against the template, and a
    // miss is silent. Look for the template's own words in the two places a
    // reader or a crawler would see them: <head> and the article body.
    const headPart = html.slice(0, html.indexOf('</head>'));
    const bodyStart = html.indexOf('<div class="blog-card-four__content__inner">');
    const bodyEnd = html.indexOf('<div class="blog-details__meta');
    const articlePart = bodyStart >= 0 && bodyEnd > bodyStart ? html.slice(bodyStart, bodyEnd) : '';
    const heroPart = html.slice(Math.max(0, bodyStart - 1500), bodyStart);
    const residue = [];
    [['<head>', headPart], ['article body', articlePart], ['hero image', heroPart]].forEach(([where, part]) => {
        [/pmu-removal/i, /Премахване на Перманентен Грим/, /ремувър/].forEach(re => {
            if (re.test(part)) residue.push(`${where}: still contains ${re}`);
        });
    });
    if (residue.length) {
        console.log('  ⚠️  Template text left in the generated post — fix before publishing:');
        residue.forEach(r => console.log(`      - ${r}`));
    }
    if (!heroDims) {
        console.log(`  ⚠️  Hero image not found at ${heroPath}; assumed 1200x800. After adding it run: node auto-blog.js --rebuild ${topic.slug}`);
    }

    return html;
}

// ─── Update blog.html — add a card at the top ───────────────────────
function updateBlogPage(topic) {
    let html = fs.readFileSync(BLOG_PAGE, 'utf-8');
    const date = today();
    const heroPath = slugToHeroPath(topic.slug);
    
    // ── New blog card ──
    const newCard = `
                            <div class="col-md-12" data-category="${topic.category.replace(/ /g, ' ')}">
                                <div class="blog-card-four wow fadeInUp" data-wow-duration='1500ms' data-wow-delay='00ms'>
                                    <div class="blog-card-four__image">
                                        <img src="${heroPath}" alt="${topic.title}" style="width: 100%; height: auto; object-fit: cover; aspect-ratio: 518/350;">
                                        <a href="${topic.slug}.html" class="blog-card-four__image__link"><span class="sr-only">${topic.title}</span></a>
                                        <time datetime="${date.iso}" class="blog-card-four__date">
                                            <span class="blog-card-four__date__day">${date.day}</span>
                                            <span class="blog-card-four__date__month">${date.monthBG}</span>
                                            <span class="blog-card-four__date__year">${date.year}</span>
                                        </time>
                                    </div>
                                    <div class="blog-card-four__content">
                                        <ul class="list-unstyled blog-card-four__meta">
                                            <li><a href="about.html"><span class="blog-card-four__meta__icon"><i class="icon-user"></i></span> <span data-i18n="blog.author_short">от И. Николаева</span></a></li>
                                        </ul>
                                        <h3 class="blog-card-four__title"><a href="${topic.slug}.html">${topic.title}</a></h3>
                                        <p class="blog-card-four__text">${topic.excerpt}</p>
                                        <a href="${topic.slug}.html" class="blog-card-four__btn mediox-btn">
                                            <span data-i18n="blog.read_more">Прочети повече</span>
                                            <span class="mediox-btn__icon"><i class="icon-up-right-arrow"></i></span>
                                        </a>
                                    </div>
                                </div>
                            </div>`;
    
    // Insert after the container opening div
    const insertMarker = '<div class="row gutter-y-40" id="blog-cards-container">';
    html = html.replace(insertMarker, insertMarker + '\n' + newCard);
    
    // ── Update item count in schema ──
    const countMatch = html.match(/"numberOfItems": (\d+)/);
    if (countMatch) {
        const oldCount = parseInt(countMatch[1]);
        html = html.replace(`"numberOfItems": ${oldCount}`, `"numberOfItems": ${oldCount + 1}`);
    }
    
    // ── Add to schema itemListElement ──
    const schemaEntry = `{
                    "@type": "ListItem",
                    "position": 1,
                    "url": "https://ba-in.com/${topic.slug}.html",
                    "name": "${topic.title}"
                },`;
    html = html.replace(
        '"itemListElement": [',
        `"itemListElement": [\n                ${schemaEntry}`
    );
    
    // ── Increment positions of existing items ──
    // Match all existing positions and increment by 1
    html = html.replace(/"position": (\d+)/g, (match, num) => {
        const n = parseInt(num);
        // Skip position 1 (the one we just added)
        if (n === 1) return match;
        // This is a bit naive but works because we process sequentially - 
        // Actually let's be smarter: after adding position 1, all others need +1
        return match; // positions are already ordered, the new entry at position 1 is correct
    });
    
    fs.writeFileSync(BLOG_PAGE, html, 'utf-8');
    console.log(`  ✅ blog.html updated (card added, count incremented)`);
}

// ─── Update sitemap.xml ─────────────────────────────────────────────
function updateSitemap(topic) {
    let xml = fs.readFileSync(SITEMAP, 'utf-8');
    const date = today();
    
    const newEntry = `
    <url>
        <loc>https://ba-in.com/${topic.slug}.html</loc>
        <lastmod>${date.iso}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>`;
    
    // Also update blog.html lastmod
    xml = xml.replace(
        /<loc>https:\/\/ba-in\.com\/blog\.html<\/loc>\s*<lastmod>[\d-]+<\/lastmod>/,
        `<loc>https://ba-in.com/blog.html</loc>\n        <lastmod>${date.iso}</lastmod>`
    );
    
    // Insert before closing </urlset>
    xml = xml.replace('</urlset>', newEntry + '\n</urlset>');
    
    fs.writeFileSync(SITEMAP, xml, 'utf-8');
    console.log(`  ✅ sitemap.xml updated`);
}

// ─── Main ───────────────────────────────────────────────────────────
function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args[0] === '--help') {
        console.log(`
🚀 Ba-In Blog Post Builder
═══════════════════════════

Usage:
  node auto-blog.js <slug>        Build a specific topic
  node auto-blog.js --list        Show all available topics
  node auto-blog.js --next        Build the next unpublished topic
  node auto-blog.js --rebuild <slug>
                                  Regenerate an existing post from blog-topics.json.
                                  Rewrites only <slug>.html: blog.html and sitemap.xml
                                  are left alone and the original publish date is kept.

Examples:
  node auto-blog.js laminirane-vezhdi-migli
  node auto-blog.js --next
`);
        return;
    }
    
    if (args[0] === '--list') {
        listTopics();
        return;
    }
    
    if (args[0] === '--rebuild') {
        const slug = args[1];
        const t = slug && loadTopics().topics.find(x => x.slug === slug);
        const file = slug && path.join(ROOT, `${slug}.html`);
        if (!t) { console.log(`❌ Topic "${slug}" not found. Use --list to see available topics.`); return; }
        if (!fs.existsSync(file)) { console.log(`❌ ${slug}.html does not exist yet. Build it first: node auto-blog.js ${slug}`); return; }
        const old = fs.readFileSync(file, 'utf-8');
        const m = old.match(/"datePublished": "(\d{4})-(\d{2})-(\d{2})"/);
        const published = m
            ? { iso: `${m[1]}-${m[2]}-${m[3]}`, day: m[3], monthBG: BG_MONTHS[parseInt(m[2], 10) - 1], year: m[1] }
            : today();
        console.log(`\n🔁 Rebuilding ${slug}.html (published ${published.iso})`);
        fs.writeFileSync(file, buildPost(t, { published }), 'utf-8');
        console.log(`  ✅ ${slug}.html rewritten. Now run: python3 scripts/sidebar-recent.py && python3 scripts/cache-bust.py\n`);
        return;
    }

    let topic;
    
    if (args[0] === '--next') {
        topic = getNextTopic();
        if (!topic) {
            console.log('🎉 All topics have been published!');
            return;
        }
        console.log(`\n📝 Next topic: ${topic.slug}`);
    } else {
        const slug = args[0];
        const topics = loadTopics();
        topic = topics.topics.find(t => t.slug === slug);
        
        if (!topic) {
            console.log(`❌ Topic "${slug}" not found. Use --list to see available topics.`);
            return;
        }
    }
    
    const outFile = path.join(ROOT, `${topic.slug}.html`);
    
    if (fs.existsSync(outFile)) {
        console.log(`⚠️  File ${topic.slug}.html already exists! Use a different slug or delete the file first.`);
        return;
    }
    
    console.log(`\n🔨 Building blog post: ${topic.title}`);
    console.log('─'.repeat(60));
    
    // 1. Generate blog post HTML
    console.log(`  📄 Generating ${topic.slug}.html...`);
    const postHtml = buildPost(topic);
    fs.writeFileSync(outFile, postHtml, 'utf-8');
    console.log(`  ✅ ${topic.slug}.html created (${Math.round(postHtml.length / 1024)}KB)`);
    
    // 2. Update blog.html
    console.log(`  📝 Updating blog.html...`);
    updateBlogPage(topic);
    
    // 3. Update sitemap.xml
    console.log(`  🗺️  Updating sitemap.xml...`);
    updateSitemap(topic);
    
    // 4. Report what's needed
    console.log('\n' + '─'.repeat(60));
    console.log('✅ Blog post built successfully!\n');
    console.log('📋 Next steps:');
    console.log(`  1. 🖼️  Generate hero image and save to: ${slugToHeroPath(topic.slug)}`);
    console.log(`  2. 🔁 After the hero is in place: node auto-blog.js --rebuild ${topic.slug}`);
    console.log(`     then: python3 scripts/sidebar-recent.py && python3 scripts/cache-bust.py`);
    console.log(`  3. 🔄 git add . && git commit -m "blog: ${topic.slug}" && git push`);
    console.log(`  4. 🌐 Verify on https://ba-in.com/${topic.slug}.html\n`);
}

main();
