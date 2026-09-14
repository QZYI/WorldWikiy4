(function () {
    'use strict';

    let entries = [];
    let activeCategory = 'all';

    const searchInput = document.getElementById('search-input');
    const dynamicList = document.getElementById('dynamic-entry-list');
    const staticList = document.getElementById('static-entry-list');
    const noResults = document.getElementById('no-results');
    const entryCount = document.getElementById('entry-count');
    const entriesHeading = document.getElementById('entries-heading');
    const filtersContainer = document.querySelector('.search-filters');
    const alphaBar = document.getElementById('alpha-bar');

    // Only run on the index page
    if (!searchInput || !dynamicList) return;

    fetch('entry-index.json')
        .then(function (r) { return r.json(); })
        .then(function (data) {
            entries = data.entries || [];
            entries.sort(function (a, b) {
                return a.title.localeCompare(b.title);
            });
            init();
        })
        .catch(function () {
            // JSON failed — static list remains visible, that's fine
            if (entryCount) entryCount.textContent = '';
        });

    function init() {
        // Hide static list, show dynamic
        if (staticList) staticList.style.display = 'none';
        dynamicList.style.display = '';

        buildCategoryFilters();
        buildAlphaBar();
        render();

        searchInput.addEventListener('input', render);
    }

    function buildCategoryFilters() {
        var cats = {};
        entries.forEach(function (e) {
            if (e.category) cats[e.category] = true;
        });
        var catNames = Object.keys(cats).sort();

        catNames.forEach(function (cat) {
            var btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.category = cat;
            btn.textContent = cat;
            btn.addEventListener('click', function () {
                document.querySelectorAll('.filter-btn').forEach(function (b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                activeCategory = cat;
                render();
            });
            filtersContainer.appendChild(btn);
        });

        // "All" button handler
        filtersContainer.querySelector('[data-category="all"]').addEventListener('click', function () {
            document.querySelectorAll('.filter-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            activeCategory = 'all';
            render();
        });
    }

    function buildAlphaBar() {
        if (!alphaBar) return;
        var lettersWithEntries = {};
        entries.forEach(function (e) {
            var first = e.title.charAt(0).toUpperCase();
            if (/[A-Z]/.test(first)) {
                lettersWithEntries[first] = true;
            }
        });

        for (var i = 0; i < 26; i++) {
            var letter = String.fromCharCode(65 + i);
            var el = document.createElement('span');
            el.className = 'alpha-letter';
            el.textContent = letter;
            if (lettersWithEntries[letter]) {
                el.classList.add('has-entries');
                el.addEventListener('click', (function (l) {
                    return function () {
                        searchInput.value = l;
                        activeCategory = 'all';
                        document.querySelectorAll('.filter-btn').forEach(function (b) {
                            b.classList.remove('active');
                        });
                        document.querySelector('[data-category="all"]').classList.add('active');
                        render();
                        searchInput.focus();
                    };
                })(letter));
            }
            alphaBar.appendChild(el);
        }
    }

    function render() {
        var query = searchInput.value.toLowerCase().trim();
        var filtered = entries.filter(function (e) {
            var matchesCategory = activeCategory === 'all' || e.category === activeCategory;
            var matchesSearch = !query ||
                e.title.toLowerCase().indexOf(query) !== -1 ||
                (e.summary && e.summary.toLowerCase().indexOf(query) !== -1) ||
                (e.tags && e.tags.some(function (t) { return t.toLowerCase().indexOf(query) !== -1; }));
            return matchesCategory && matchesSearch;
        });

        entryCount.textContent = filtered.length;

        if (query || activeCategory !== 'all') {
            entriesHeading.textContent = 'Results';
        } else {
            entriesHeading.textContent = 'All Entries';
        }

        if (filtered.length === 0) {
            dynamicList.innerHTML = '';
            noResults.style.display = '';
            return;
        }

        noResults.style.display = 'none';

        dynamicList.innerHTML = filtered.map(function (e) {
            var meta = '';
            if (e.category) {
                meta += '<span class="card-category">' + escapeHtml(e.category) + '</span>';
            }
            if (e.date) {
                meta += '<span class="card-date">' + escapeHtml(e.date) + '</span>';
            }
            return '<a href="' + escapeHtml(e.url) + '" class="entry-card">' +
                '<h3>' + escapeHtml(e.title) + '</h3>' +
                '<p>' + escapeHtml(e.summary || '') + '</p>' +
                (meta ? '<div class="card-meta">' + meta + '</div>' : '') +
                '</a>';
        }).join('');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
})();