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

3. Save the hero image to the path shown in the output (`assets/images/blog/<slug>-hero.webp`, about 1200x800).

4. Write the article in `blog-topics.json`, not in the generated HTML. Each section takes a `body` array: strings are paragraphs, `{ "list": [...] }` is a bullet list and `{ "table": { "head": [...], "rows": [[...]] } }` is a table. Optional fields: `seoTitle` (shorter search title), `summary` (the "Накратко" box), `faq`, `internalLinks`, `closing`.

5. Regenerate the post from the topic, then refresh the sidebars and asset hashes:
```
node auto-blog.js --rebuild <slug-name>
python3 scripts/sidebar-recent.py && python3 scripts/bundle-css.py && python3 scripts/cache-bust.py
```
The builder prints a warning if any of the template's own text or its hero image is left in the post. Fix the cause before publishing.

6. Commit and push:
```
git add -A && git commit -m "blog: <slug-name>" && git push
```

7. Verify the post is live at `https://ba-in.com/<slug-name>.html`

## Notes
- Topics are defined in `blog-topics.json` — you can add more anytime
- The template is based on `pmu-removal-guide.html`
- Hero images should be ~1200x630px, WebP or PNG format
- The script updates `blog.html`, `sitemap.xml`, and the structured data automatically
