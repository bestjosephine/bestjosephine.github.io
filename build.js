#!/usr/bin/env node
/**
 * build.js — Static site generator for bestjosephine.github.io
 * 
 * Reads Markdown posts from posts/ directory with YAML frontmatter,
 * converts to HTML pages, and generates:
 *   - Individual post pages
 *   - Search index (js/search-index.js)
 *   - Archive page (archive.html)
 *   - Homepage (index.html) with latest posts
 */

const fs = require('fs');
const path = require('path');
const { Marked } = require('marked');

const marked = new Marked({
    gfm: true,
    breaks: false,
});

const ROOT = path.resolve(__dirname);
const POSTS_DIR = path.join(ROOT, 'posts');

// ── Post Template ──
function postTemplate({ title, date, dateDisplay, tag, bodyHtml }) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} — Josephine's Blog</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>">
</head>
<body>
    <div class="container">
        <header class="site-header">
            <nav class="nav">
                <a href="/" class="nav-brand">Josephine</a>
                <div class="nav-links">
                    <a href="/">Posts</a>
                    <a href="/archive.html">Archive</a>
                    <a href="/search.html">Search</a>
                    <a href="/tags.html">Tags</a>
                    <a href="/about.html">About</a>
                </div>
            </nav>
        </header>

        <main>
            <article class="post-content">
                <header class="post-header">
                    <div class="post-meta">
                        <time datetime="${date}">${dateDisplay}</time> · <span class="post-tag">${escapeHtml(tag)}</span>
                    </div>
                    <h1>${escapeHtml(title)}</h1>
                </header>

                <div class="post-body">
${bodyHtml}
                </div>
            </article>
        </main>

        <footer class="site-footer">
            <p>© 2026 Josephine. Powered by curiosity and coffee.</p>
        </footer>
    </div>
</body>
</html>
`;
}

// ── Homepage Template ──
function homepageTemplate(posts) {
    const postsHtml = posts.map(post => `
                <article class="post-item">
                    <div class="post-date">
                        <time datetime="${post.date}">${post.dateDisplay}</time>
                        <span class="post-tag">${escapeHtml(post.tag)}</span>
                    </div>
                    <a href="${post.url}" class="post-title">${escapeHtml(post.title)}</a>
                    <p class="post-summary">${escapeHtml(post.summary)}</p>
                </article>`).join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Josephine's Blog</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>">
</head>
<body>
    <div class="container">
        <header class="site-header">
            <nav class="nav">
                <a href="/" class="nav-brand">Josephine</a>
                <div class="nav-links">
                    <a href="/">Posts</a>
                    <a href="/archive.html">Archive</a>
                    <a href="/search.html">Search</a>
                    <a href="/tags.html">Tags</a>
                    <a href="/about.html">About</a>
                </div>
            </nav>
        </header>

        <main>
            <section class="profile">
                <div class="profile-avatar">
                    <img src="https://avatars.githubusercontent.com/u/153062689?v=4" alt="Josephine">
                </div>
                <h1 class="profile-name">Josephine</h1>
                <p class="profile-bio">
                    Welcome to my digital garden. I write about technology, AI, and things I find interesting.
                </p>
                <div class="social-links">
                    <a href="https://github.com/bestjosephine" target="_blank" rel="noopener">🐙 GitHub</a>
                    <a href="https://mail.google.com/mail/?view=cm&fs=1&to=luorongfamily@gmail.com" target="_blank" rel="noopener">📧 Email</a>
                </div>
            </section>

            <section class="posts">
                <h2 class="section-title">Recent Posts</h2>
${postsHtml}
            </section>
        </main>

        <footer class="site-footer">
            <p>© 2026 Josephine. Powered by curiosity and coffee.</p>
        </footer>
    </div>
</body>
</html>
`;
}

// ── Archive Template ──
function archiveTemplate(posts) {
    // Group by year
    const byYear = {};
    posts.forEach(post => {
        const year = post.date.slice(0, 4);
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(post);
    });

    let html = '';
    Object.keys(byYear).sort().reverse().forEach(year => {
        html += `\n                <h3 class="archive-year">${year}</h3>`;
        byYear[year].forEach(post => {
            const shortDate = post.dateDisplay.replace(/^[A-Za-z]+ /, '');
            html += `\n                <div class="archive-item">
                    <time datetime="${post.date}">${shortDate}</time>
                    <a href="${post.url}">${escapeHtml(post.title)}</a>
                </div>`;
        });
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archive — Josephine's Blog</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>">
</head>
<body>
    <div class="container">
        <header class="site-header">
            <nav class="nav">
                <a href="/" class="nav-brand">Josephine</a>
                <div class="nav-links">
                    <a href="/">Posts</a>
                    <a href="/archive.html">Archive</a>
                    <a href="/search.html">Search</a>
                    <a href="/tags.html">Tags</a>
                    <a href="/about.html">About</a>
                </div>
            </nav>
        </header>

        <main>
            <h1 class="section-title" style="margin-top: 1.5rem;">Archive</h1>
            <div class="archive-list">${html}
            </div>
        </main>

        <footer class="site-footer">
            <p>© 2026 Josephine. Powered by curiosity and coffee.</p>
        </footer>
    </div>
</body>
</html>
`;
}

// ── Tags Template ──
function tagsTemplate(posts) {
    // Group posts by tag
    const byTag = {};
    posts.forEach(post => {
        const tag = post.tag || 'Uncategorized';
        if (!byTag[tag]) byTag[tag] = [];
        byTag[tag].push(post);
    });

    const tagNames = Object.keys(byTag).sort();

    // Tag cloud
    const cloudHtml = tagNames.map(tag =>
        `\n                    <a href="#" class="tag-chip" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)} <span class="tag-count">${byTag[tag].length}</span></a>`
    ).join('');

    // Tag sections (hidden by default, shown on click)
    let sectionsHtml = '';
    tagNames.forEach(tag => {
        const postsHtml = byTag[tag].map(post =>
            `\n                        <div class="archive-item">
                            <time datetime="${post.date}">${post.dateDisplay}</time>
                            <a href="${post.url}">${escapeHtml(post.title)}</a>
                        </div>`
        ).join('');

        sectionsHtml += `
                <div class="tag-section" id="tag-${encodeURIComponent(tag)}" style="display:none;">
                    <h3 class="tag-section-title">${escapeHtml(tag)} <span class="tag-section-count">${byTag[tag].length} post${byTag[tag].length > 1 ? 's' : ''}</span></h3>${postsHtml}
                </div>`;
    });

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tags — Josephine's Blog</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>✨</text></svg>">
    <style>
        .tag-chip { position: relative; cursor: pointer; }
        .tag-chip.active {
            background: var(--accent-color);
            color: #fff;
        }
        .tag-chip.active:hover {
            background: var(--link-hover);
            color: #fff;
        }
        .tag-count {
            display: inline-block;
            background: rgba(0,0,0,0.08);
            color: inherit;
            font-size: 0.75rem;
            padding: 0 0.35rem;
            border-radius: 3px;
            margin-left: 0.2rem;
        }
        .tag-chip.active .tag-count {
            background: rgba(255,255,255,0.25);
        }
        .tag-section {
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border-color);
        }
        .tag-section-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 0.75rem;
            color: var(--text-color);
        }
        .tag-section-count {
            font-size: 0.82rem;
            font-weight: 400;
            color: var(--text-lighter);
        }
    </style>
</head>
<body>
    <div class="container">
        <header class="site-header">
            <nav class="nav">
                <a href="/" class="nav-brand">Josephine</a>
                <div class="nav-links">
                    <a href="/">Posts</a>
                    <a href="/archive.html">Archive</a>
                    <a href="/search.html">Search</a>
                    <a href="/tags.html">Tags</a>
                    <a href="/about.html">About</a>
                </div>
            </nav>
        </header>

        <main>
            <h1 class="section-title" style="margin-top: 1.5rem;">Tags</h1>
            <div class="tags-list">
                <div class="tag-cloud">${cloudHtml}
                </div>
                <div id="tagSections">${sectionsHtml}
                </div>
            </div>
        </main>

        <footer class="site-footer">
            <p>© 2026 Josephine. Powered by curiosity and coffee.</p>
        </footer>
    </div>

    <script>
    document.querySelectorAll('.tag-chip').forEach(chip => {
        chip.addEventListener('click', function(e) {
            e.preventDefault();
            const tag = this.dataset.tag;
            const sectionId = 'tag-' + encodeURIComponent(tag);
            const section = document.getElementById(sectionId);

            // Toggle active state
            const wasActive = this.classList.contains('active');
            document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tag-section').forEach(s => s.style.display = 'none');

            if (!wasActive) {
                this.classList.add('active');
                if (section) section.style.display = 'block';
            }
        });
    });

    // Handle hash-based tag selection
    if (window.location.hash) {
        const tag = decodeURIComponent(window.location.hash.slice(1));
        const chip = document.querySelector('.tag-chip[data-tag="' + tag + '"]');
        if (chip) chip.click();
    }
    </script>
</body>
</html>
`;
}

// ── Helpers ──
function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function parseFrontmatter(content) {
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
    if (!match) return { meta: {}, body: content };
    const meta = {};
    match[1].split('\n').forEach(line => {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) return;
        const key = line.slice(0, colonIdx).trim();
        let val = line.slice(colonIdx + 1).trim();
        // Strip quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
        }
        meta[key] = val;
    });
    return { meta, body: match[2] };
}

function formatDate(dateStr) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(dateStr + 'T00:00:00Z');
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

// ── Main ──
function build() {
    console.log('🔨 Building site...\n');

    // Discover all posts
    const posts = [];
    function scanPosts(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        entries.forEach(entry => {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                const mdFile = path.join(full, 'index.md');
                if (fs.existsSync(mdFile)) {
                    const raw = fs.readFileSync(mdFile, 'utf-8');
                    const { meta, body } = parseFrontmatter(raw);
                    const slug = path.relative(POSTS_DIR, full).replace(/\\/g, '/');
                    posts.push({
                        slug,
                        title: meta.title || 'Untitled',
                        date: meta.date || '1970-01-01',
                        dateDisplay: formatDate(meta.date || '1970-01-01'),
                        tag: meta.tag || 'Uncategorized',
                        body: body.trim(),
                        bodyHtml: marked.parse(body).trim(),
                        summary: extractSummary(body),
                        url: `/posts/${slug}/`,
                    });
                }
                scanPosts(full);
            }
        });
    }
    scanPosts(POSTS_DIR);

    // Sort by date descending
    posts.sort((a, b) => b.date.localeCompare(a.date));

    console.log(`📝 Found ${posts.length} post(s)`);

    // 1. Generate individual post pages
    posts.forEach(post => {
        const outDir = path.join(ROOT, 'posts', post.slug);
        fs.mkdirSync(outDir, { recursive: true });
        const html = postTemplate(post);
        fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf-8');
        console.log(`   ✅ posts/${post.slug}/index.html`);
    });

    // 2. Generate search index
    const searchIndex = posts.map(post => ({
        title: post.title,
        url: post.url,
        date: post.date,
        dateDisplay: post.dateDisplay,
        tag: post.tag,
        summary: post.summary,
        body: post.body.replace(/\n+/g, ' ').trim(),
    }));
    const searchJs = `// Auto-generated by build.js — DO NOT EDIT\nwindow.searchIndex = ${JSON.stringify(searchIndex, null, 2)};\n`;
    const jsDir = path.join(ROOT, 'js');
    fs.mkdirSync(jsDir, { recursive: true });
    fs.writeFileSync(path.join(jsDir, 'search-index.js'), searchJs, 'utf-8');
    console.log('   ✅ js/search-index.js');

    // 3. Generate archive page
    fs.writeFileSync(path.join(ROOT, 'archive.html'), archiveTemplate(posts), 'utf-8');
    console.log('   ✅ archive.html');

    // 4. Generate tags page
    fs.writeFileSync(path.join(ROOT, 'tags.html'), tagsTemplate(posts), 'utf-8');
    console.log('   ✅ tags.html');

    // 5. Generate homepage
    fs.writeFileSync(path.join(ROOT, 'index.html'), homepageTemplate(posts), 'utf-8');
    console.log('   ✅ index.html');

    console.log('\n✨ Build complete!');
}

function extractSummary(body) {
    const lines = body.trim().split('\n').filter(l => l.trim());
    if (!lines[0]) return '';
    // Strip markdown syntax from first line
    return lines[0].replace(/[*_~`#\[\]()]|!\[.*?\]\(.*?\)/g, '').slice(0, 180).trim();
}

build();
