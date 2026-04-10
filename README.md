# Josephine's Blog

A minimalist, static personal blog inspired by [lilianweng.github.io](https://lilianweng.github.io/).

**Site URL:** [https://bestjosephine.github.io](https://bestjosephine.github.io)

## Features

- Clean, typography-focused design
- Markdown-based posts with YAML frontmatter
- Full-text search
- Archive and tags pages
- Auto-build via GitHub Actions on push

## Writing a New Post

Create a folder under `posts/` with an `index.md` file:

```
posts/my-new-post/
└── index.md
```

The markdown file should start with frontmatter:

```markdown
---
title: "Your Post Title"
date: 2026-04-10
tag: "Category"
---

Your post content here...
```

## Building Locally

```bash
npm install       # install dependencies (once)
npm run build     # generate HTML from markdown
```

The build script (`build.js`) reads all `.md` posts and generates:

- Individual post pages (`posts/*/index.html`)
- Homepage with recent posts (`index.html`)
- Archive page (`archive.html`)
- Search index (`js/search-index.js`)

## Deploying

Push to the `main` branch. GitHub Actions will auto-build and deploy to GitHub Pages.

```bash
git add -A
git commit -m "Add new post: Your Title"
git push
```
