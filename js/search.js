(function () {
    'use strict';

    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var shortcut = document.querySelector('.search-shortcut');
    var hint = results ? results.querySelector('.search-hint') : null;
    var debounceTimer = null;

    if (!input || !results) return;

    // Auto-focus
    input.focus();

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.activeElement === input) {
            input.value = '';
            input.blur();
            results.innerHTML = '<p class="search-hint">Enter a keyword to search across all posts.</p>';
        }
        // Press "/" to focus search
        if (e.key === '/' && document.activeElement !== input) {
            e.preventDefault();
            input.focus();
        }
    });

    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            performSearch(input.value.trim());
        }, 150);
    });

    function performSearch(query) {
        if (!query) {
            results.innerHTML = '<p class="search-hint">Enter a keyword to search across all posts.</p>';
            if (shortcut) shortcut.style.display = '';
            return;
        }
        if (shortcut) shortcut.style.display = 'none';

        var terms = query.toLowerCase().split(/\s+/);
        var matches = window.searchIndex.filter(function (post) {
            var haystack = (post.title + ' ' + post.summary + ' ' + post.body + ' ' + post.tag).toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        });

        if (matches.length === 0) {
            results.innerHTML = '<p class="search-empty">No posts found for "<strong>' + escapeHtml(query) + '</strong>"</p>';
            return;
        }

        var countText = matches.length === 1 ? '1 result' : matches.length + ' results';
        var html = '<p class="search-count">' + countText + '</p>';

        matches.forEach(function (post) {
            html += buildResultCard(post, terms);
        });

        results.innerHTML = html;
    }

    function buildResultCard(post, terms) {
        var highlightedTitle = highlightText(post.title, terms);
        var snippet = buildSnippet(post.body || post.summary, terms);

        return [
            '<article class="post-item">',
            '<div class="post-date">',
            '<time datetime="' + post.date + '">' + post.dateDisplay + '</time>',
            '<span class="post-tag">' + escapeHtml(post.tag) + '</span>',
            '</div>',
            '<a href="' + escapeHtml(post.url) + '" class="post-title">' + highlightedTitle + '</a>',
            '<p class="post-summary">' + snippet + '</p>',
            '</article>'
        ].join('');
    }

    function buildSnippet(text, terms) {
        var lower = text.toLowerCase();
        var bestIdx = 0;
        terms.forEach(function (term) {
            var idx = lower.indexOf(term);
            if (idx !== -1) bestIdx = idx;
        });

        var start = Math.max(0, bestIdx - 60);
        var end = Math.min(text.length, start + 180);
        var snippet = (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
        return highlightText(escapeHtml(snippet), terms);
    }

    function highlightText(text, terms) {
        var regex = new RegExp('(' + terms.map(function (t) {
            return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('|') + ')', 'gi');
        return text.replace(regex, '<mark class="search-mark">$1</mark>');
    }

    function escapeHtml(str) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
})();
