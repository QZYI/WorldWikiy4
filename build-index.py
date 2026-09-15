#!/usr/bin/env python3
"""
Helper script: Scans entries/ folder, extracts metadata from HTML <meta> tags,
and regenerates entry-index.json + updates static links in index.html + sitemap.xml.

Run: python build-index.py

This is optional — you can always edit entry-index.json by hand.
"""

import os
import re
import json

ENTRIES_DIR = 'entries'
INDEX_JSON = 'entry-index.json'
INDEX_HTML = 'index.html'
SITEMAP = 'sitemap.xml'
BASE_URL = 'https://github.com/QZYI/WorldWikiy4'


def extract_meta(filepath, tags):
    """Extract metadata from an entry HTML file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()

    title_match = re.search(r'<h1 class="entry-title">(.*?)</h1>', html)
    desc_match = re.search(r'<meta name="description" content="(.*?)"', html)
    cat_match = re.search(r'<span class="category-tag">(.*?)</span>', html)

    if not title_match:
        return None

    title = title_match.group(1).strip()
    summary = desc_match.group(1).strip() if desc_match else ''
    category = cat_match.group(1).strip() if cat_match else 'Uncategorized'
    filename = os.path.basename(filepath)

    return {
        'title': title,
        'url': f'entries/{filename}',
        'summary': summary,
        'category': category,
        'tags': tags,
    }


def load_existing_tags():
    """Keep manually assigned entry tags when rebuilding generated files."""
    if not os.path.exists(INDEX_JSON):
        return {}

    try:
        with open(INDEX_JSON, 'r', encoding='utf-8') as f:
            entries = json.load(f).get('entries', [])
    except (json.JSONDecodeError, OSError):
        return {}

    return {
        entry.get('url'): entry.get('tags', [])
        for entry in entries
        if entry.get('url')
    }


def build():
    entries = []
    existing_tags = load_existing_tags()

    for fname in sorted(os.listdir(ENTRIES_DIR)):
        if fname.startswith('_') or not fname.endswith('.html'):
            continue
        url = f'entries/{fname}'
        meta = extract_meta(os.path.join(ENTRIES_DIR, fname), existing_tags.get(url, []))
        if meta:
            entries.append(meta)
            print(f'  Found: {meta["title"]}')

    # Write entry-index.json
    with open(INDEX_JSON, 'w', encoding='utf-8') as f:
        json.dump({'entries': entries}, f, indent=4, ensure_ascii=False)
    print(f'\nWrote {INDEX_JSON} with {len(entries)} entries.')

    # Update static links in index.html
    if os.path.exists(INDEX_HTML):
        with open(INDEX_HTML, 'r', encoding='utf-8') as f:
            html = f.read()

        static_links = '\n'.join(
            f'                <a href="{e["url"]}" class="entry-card-static">\n'
            f'                    <h3>{e["title"]}</h3>\n'
            f'                    <p>{e["summary"]}</p>\n'
            f'                </a>'
            for e in entries
        )

        pattern = r'(<!-- STATIC_ENTRY_LINKS_START -->).*?(<!-- STATIC_ENTRY_LINKS_END -->)'
        replacement = f'\\1\n{static_links}\n                \\2'
        html = re.sub(pattern, replacement, html, flags=re.DOTALL)

        with open(INDEX_HTML, 'w', encoding='utf-8') as f:
            f.write(html)
        print(f'Updated static links in {INDEX_HTML}.')

    # Update sitemap.xml
    urls = [f'''    <url>
        <loc>{BASE_URL}/</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>''']

    for e in entries:
        urls.append(f'''    <url>
        <loc>{BASE_URL}/{e["url"]}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>''')

    sitemap_xml = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>
'''
    with open(SITEMAP, 'w', encoding='utf-8') as f:
        f.write(sitemap_xml)
    print(f'Updated {SITEMAP}.')


if __name__ == '__main__':
    print('Building wiki index...\n')
    build()
    print('\nDone!')
