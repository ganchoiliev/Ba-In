---
description: How to publish a new blog post on ba-in.com
---

# Publish Blog Post Workflow

// turbo-all

## Steps

1. List available topics to choose from:
```
node auto-blog.js --list
```

2. Either pick a specific topic or let the system choose the next one:
```
node auto-blog.js --next
```
Or for a specific topic:
```
node auto-blog.js <slug-name>
```

3. Generate a hero image for the post using the `generate_image` tool, then save it to the path shown in the output (e.g. `assets/images/blog/<slug>-hero.png`).

4. Open the generated HTML file and review/enrich the article content. The script generates a skeleton from the topic hints — flesh out the sections with full paragraphs, add lists, add practical tips, etc.

5. Commit and push:
```
git add -A && git commit -m "blog: <slug-name>" && git push
```

6. Verify the post is live at `https://ba-in.com/<slug-name>.html`

## Notes
- Topics are defined in `blog-topics.json` — you can add more anytime
- The template is based on `pmu-removal-guide.html`
- Hero images should be ~1200x630px, WebP or PNG format
- The script updates `blog.html`, `sitemap.xml`, and the structured data automatically
