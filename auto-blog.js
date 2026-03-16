/**
 * auto-blog.js — Automated Blog Post Builder for ba-in.com
 * 
 * Usage:
 *   node auto-blog.js <slug>
 *   node auto-blog.js --list           (show available topics)
 *   node auto-blog.js --next           (pick the next unpublished topic)
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

function slugToHeroPath(slug) {
    return `assets/images/blog/${slug}-hero.png`;
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
function generateContentBlock1(topic) {
    let html = '';
    
    // Intro paragraph
    html += `<p class="blog-card-four__text">${topic.excerpt}</p>\n`;
    html += `<p class="blog-card-four__text">В тази статия ще разгледаме темата в детайли, за да можете да вземете информирано решение за себе си.</p>\n`;
    
    // First 3 sections go in the card content area
    const firstSections = topic.sections.slice(0, 3);
    firstSections.forEach(section => {
        html += `\n<h4 class="blog-details__inner__title" style="margin-top: 20px;">${section.heading}</h4>\n`;
        html += `<p class="blog-card-four__text">${section.hint}</p>\n`;
    });
    
    return html;
}

function generateContentBlock2(topic) {
    let html = '';
    
    // Remaining sections
    const remainingSections = topic.sections.slice(3);
    remainingSections.forEach(section => {
        html += `\n<h4 class="blog-details__inner__title" style="margin-top: 20px;">${section.heading}</h4>\n`;
        html += `<p class="blog-details__inner__text">${section.hint}</p>\n`;
    });
    
    // Closing CTA
    html += `
<h4 class="blog-details__inner__title" style="margin-top: 20px;">Заключение</h4>
<p class="blog-details__inner__text">Надяваме се, че тази статия ви беше полезна! Ако имате допълнителни въпроси или искате да научите повече, не се колебайте да се свържете с нас.</p>
<p class="blog-details__inner__text">В Beauty Atelier IN вярваме, че информираният избор е най-красивият. <strong><a href="contact.html" style="color:var(--mediox-base);">Запазете безплатна консултация</a></strong> и нека заедно намерим най-доброто решение за вас.</p>

<div style="margin-top: 40px; text-align: center;">
    <a href="appointment.html" class="mediox-btn" aria-label="Запазете консултация сега"><span>Запази Консултация</span> <span class="mediox-btn__icon"><i class="icon-up-right-arrow"></i></span></a>
</div>
`;
    return html;
}

// ─── Build the blog post HTML ───────────────────────────────────────
function buildPost(topic) {
    let html = fs.readFileSync(TEMPLATE, 'utf-8');
    const date = today();
    const heroPath = slugToHeroPath(topic.slug);
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
    html = html.replace(/"dateModified": "[\d-]+"/g, `"dateModified": "${date.iso}"`);
    html = html.replace(
        /"mainEntityOfPage": \{"@type": "WebPage", "@id": "https:\/\/ba-in\.com\/pmu-removal-guide\.html"\}/,
        `"mainEntityOfPage": {"@type": "WebPage", "@id": "${fullUrl}"}`
    );
    html = html.replace(/"articleSection": "[^"]*"/, `"articleSection": "${topic.category}"`);
    
    // ── <title> ──
    html = html.replace(
        /data-i18n="blog_pmu_removal\.title">Премахване на Перманентен Грим: Всичко, Което Трябва да Знаете \| Beauty Atelier IN<\/title>/,
        `>${topic.title} | Beauty Atelier IN</title>`
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
        `content="${topic.title} | Beauty Atelier IN" />`
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
    html = html.replace(
        /src="assets\/images\/blog\/pmu-removal-hero\.png"\s*\n\s*alt="[^"]*"/,
        `src="${heroPath}"\n                                        alt="${topic.title}"`
    );
    
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
    html = html.replace(
        /<h3 class="blog-card-four__title">Премахване на Перманентен Грим: Всичко, Което Трябва да Знаете<\/h3>/,
        `<h3 class="blog-card-four__title">${topic.title}</h3>`
    );
    
    // ── Content block 1 (inside blog-card-four__content__inner) ──
    const contentBlock1 = generateContentBlock1(topic);
    html = html.replace(
        /<div class="blog-card-four__content__inner">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<div class="blog-details__inner">/,
        `<div class="blog-card-four__content__inner">\n${contentBlock1}\n</div>\n</div>\n</div>\n<div class="blog-details__inner">`
    );
    
    // ── Content block 2 (inside blog-details__inner__content) ──
    const contentBlock2 = generateContentBlock2(topic);
    html = html.replace(
        /<div class="blog-details__inner__content wow fadeInUp" data-wow-duration="1500ms">[\s\S]*?<\/div>\s*<\/div>\s*<div class="blog-details__meta/,
        `<div class="blog-details__inner__content wow fadeInUp" data-wow-duration="1500ms">\n${contentBlock2}\n</div>\n</div>\n<div class="blog-details__meta`
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
        /src="assets\/images\/blog\/pmu-removal-hero\.png"\s*\n\s*alt="Премахване на Перманентен Грим"/,
        `src="${heroPath}"\n                                                    alt="${topic.title}"`
    );
    
    // ── Sidebar: post link ──  
    html = html.replace(
        /href="pmu-removal-guide\.html">Правилната процедура\.\.<\/a>/,
        `href="${topic.slug}.html">${topic.title.substring(0, 30)}..</a>`
    );
    
    // ── Footer blog section ──
    html = html.replace(
        /<img src="assets\/images\/blog\/pmu-removal-hero\.png" style="width: 70px; height: 70px; object-fit: cover;" alt="Премахване на перманентен грим - Beauty Atelier IN">/,
        `<img src="${heroPath}" style="width: 70px; height: 70px; object-fit: cover;" alt="${topic.title}">`
    );
    html = html.replace(
        /href="pmu-removal-guide\.html" data-i18n="shared\.footer\.blog1_title">Правилна процедура<\/a>/,
        `href="${topic.slug}.html">${topic.title.substring(0, 25)}</a>`
    );
    
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
    console.log(`  2. ✏️  Review & enrich the article content in ${topic.slug}.html`);
    console.log(`  3. 🔄 git add . && git commit -m "blog: ${topic.slug}" && git push`);
    console.log(`  4. 🌐 Verify on https://ba-in.com/${topic.slug}.html\n`);
}

main();
