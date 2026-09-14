# 🌐 World Wiki

A personal, static wiki built for GitHub Pages. Every page is plain HTML — fully crawlable, zero dependencies, no build step required.

**Live site:** https://qzyi.github.io/WorldWikiy3/

---

## How to Add a New Entry

### 1. Create the HTML file

Copy `entries/_template.html` and rename it with a URL-friendly slug:

```
entries/_template.html → entries/my-new-topic.html
```

Edit the file and replace all the `✏️ EDIT` sections:
- Page title and meta description
- Entry title, category, and date
- The body content (write standard HTML)
- Related entries links (optional)
- Table of contents (optional)

### 2. Register it in `entry-index.json`

Add a new object to the `entries` array:

```json
{
    "title": "My New Topic",
    "url": "entries/my-new-topic.html",
    "summary": "A brief one-line description of this entry.",
    "category": "Science",
    "tags": ["physics", "example"],
    "date": "2025-06-15"
}
```

### 3. (Optional) Update static links

For full SEO without JS, also add a static link in `index.html` between the `STATIC_ENTRY_LINKS` comments:

```html
<a href="entries/my-new-topic.html" class="entry-card-static">
    <h3>My New Topic</h3>
    <p>A brief one-line description of this entry.</p>
</a>
```

**Or** just run the helper script to do steps 2-3 automatically:

```bash
python build-index.py
```

### 4. Commit and push

```bash
git add .
git commit -m "Add entry: My New Topic"
git push
```

GitHub Pages will deploy automatically.

---

## Project Structure

```
├── index.html              Home page (entry listing + search)
├── style.css               All styles
├── search.js               Client-side search & filtering
├── entry-index.json        Master list of all entries
├── entries/
│   ├── _template.html      Copy this for new entries
│   └── *.html              Individual entries
├── icon.png                Site icon
├── 404.html                Custom 404 page
├── robots.txt              SEO
├── sitemap.xml             SEO sitemap
└── build-index.py          Optional: auto-generates index
```

## Design Principles

- **100% Static** — No server, no database, no build step needed
- **SEO First** — Every entry is its own HTML page with proper meta tags, Open Graph, canonical URLs, and a sitemap. Crawlers see all content without JS.
- **Easy to Author** — Copy a template, fill in the blanks, add one JSON line, push
- **Fast** — No frameworks, no bloat, just HTML + CSS + vanilla JS
- **Dark Theme** — Clean, modern aesthetic with soft purple/pink accents