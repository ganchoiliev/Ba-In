const fs = require('fs');

const files = [
    'choosing-right-facial.html',
    'microblading-for-all-ages.html',
    'microblading-5myths.html',
    'microblading-5mistakes.html',
    'aftertreatment.html',
    'microblading-guide.html',
    'beauty-inspiring.html',
    'beauty-secrets.html'
];

for (let file of files) {
    try {
        let content = fs.readFileSync(file, 'utf8');

        // Extract title
        let titleMatch = content.match(/<title>(.*?)<\/title>/);
        let title = titleMatch ? titleMatch[1] : 'Beauty Atelier IN Blog';

        // Extract description
        let descMatch = content.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
        if (!descMatch) {
            descMatch = content.match(/content="([^"]+)"[^>]+name="description"/i);
        }
        let desc = descMatch ? descMatch[1] : title;

        // Extract first blog image
        let imgMatch = content.match(/src="(assets\/images\/blog\/[^"]+)"/i);
        let img = imgMatch ? imgMatch[1] : 'assets/images/logo.png';

        // 1. Add Open Graph Meta tags if not present
        if (!content.includes('property="og:title"')) {
            let ogTags = `
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="https://ba-in.com/${img}" />
    <meta property="og:url" content="https://ba-in.com/${file}" />
    <meta property="og:type" content="article" />`;
            // Insert right after the keywords meta tag, or before </head>
            if (content.includes('name="keywords"')) {
                content = content.replace(/(<meta[^>]+name="keywords"[^>]*>)/i, "$1\n" + ogTags);
            } else {
                content = content.replace('</head>', ogTags + '\n</head>');
            }
        }

        // 2. Add Share Button if not present
        if (!content.includes('blog-details__share')) {
            const shareHTML = `
                                    <div class="blog-details__share" style="width: 100%; display: flex; align-items: center; justify-content: flex-end; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ebebeb;">
                                        <h4 class="blog-details__meta__title" style="margin-bottom: 0; margin-right: 15px;">Сподели статията:</h4>
                                        <a href="javascript:void(0);" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('https://ba-in.com/${file}'), 'facebook-share-dialog', 'width=626,height=436'); return false;" class="mediox-btn" style="background-color: #1877f2; border-color: #1877f2; color: #fff; padding: 12px 25px; font-size: 14px;">
                                            <span><i class="fab fa-facebook-f" style="margin-right: 8px;"></i> Сподели във Facebook</span>
                                        </a>
                                    </div>`;

            // Insert right after blog-details__tags
            let tagsMatch = /(<div class="blog-details__tags">[\s\S]*?<\/div><\/div>)/;
            if (content.match(tagsMatch)) {
                content = content.replace(tagsMatch, "$1\n" + shareHTML);
            } else {
                // fallback to end of blog-details
                content = content.replace(/(<\/div>\s*<\/div>\s*<div class="col-lg-4">)/, "\n" + shareHTML + "\n$1");
            }
        }

        fs.writeFileSync(file, content, 'utf8');
        console.log('Successfully processed', file);
    } catch (e) {
        console.error('Error processing', file, e.message);
    }
}
