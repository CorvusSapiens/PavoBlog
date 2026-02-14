# PavoBlog

A minimal knowledge-base blog built with **Next.js** (App Router), **TypeScript**, **Tailwind CSS**, and **MDX**. Write posts in MDX with math (KaTeX), code highlighting (Shiki), and in-body tags (`#Tag`).

## Features

- **MDX content** — Posts in `content/leetcode/`, `content/books/` with frontmatter (title, date, etc.)
- **Tags** — Use `#Tag` in the body; tags are extracted at build time (no need to list them in frontmatter)
- **Search** — Client-side search on the posts page (Fuse.js), powered by a build-time index
- **Dashboard** — Stats and post overview at `/dashboard` (Recharts)
- **Math** — Inline `$...$` and block `$$...$$` via remark-math + rehype-katex
- **Code** — Syntax highlighting with Shiki (rehype-pretty-code)
- **TOC** — Table of contents from headings, with anchor links

## Tech stack

| Layer      | Choice                    |
|-----------|---------------------------|
| Framework | Next.js 14 (App Router)    |
| Language  | TypeScript                |
| Styling   | Tailwind CSS              |
| Content   | MDX, gray-matter          |
| Search    | Fuse.js + build-time index|
| Charts    | Recharts                  |

## Getting started

### Prerequisites

- Node.js 18+
- npm (or pnpm/yarn)

### Install and run

```bash
# Clone the repo (or use your existing project folder)
cd PavoBlog

# Install dependencies
npm install

# Generate search index and stats (optional; also run automatically on build)
npm run generate-search-index
npm run generate-stats

# Development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You’ll see the home page, latest posts, and links to **Posts** (with search) and **Dashboard**.

### Build for production

```bash
npm run build
npm start
```

The `build` script runs `generate-search-index` and `generate-stats` before `next build`, so the app is ready for static/server output.

## Project structure

```
PavoBlog/
├── app/
│   ├── layout.tsx          # Root layout + nav
│   ├── page.tsx            # Home (latest posts)
│   ├── globals.css         # Global styles (Tailwind, KaTeX, code)
│   ├── posts/
│   │   ├── page.tsx        # Post list + search
│   │   ├── PostsWithSearch.tsx
│   │   └── [...slug]/page.tsx   # Post detail (MDX)
│   └── dashboard/
│       ├── page.tsx
│       └── DashboardClient.tsx # Stats and post list
├── content/                # MDX by category
│   ├── leetcode/
│   └── books/
├── lib/                    # Build-time and runtime helpers
│   ├── parsePost.ts        # Scan content, frontmatter, slug
│   ├── extractTags.ts     # #Tag from body
│   ├── search-index.ts    # Search index data
│   ├── dashboard-stats.ts # Dashboard stats
│   ├── mdx-config.ts      # MDX remark/rehype plugins
│   └── ...
├── scripts/
│   ├── generate-search-index.ts
│   └── generate-stats.ts
├── public/                 # search-index.json, stats.json (generated)
├── package.json
├── tailwind.config.ts
└── next.config.mjs
```

## Writing posts

- Put `.mdx` files under `content/leetcode/` or `content/books/`. The path is the slug (e.g. `content/leetcode/example.mdx` → `/posts/leetcode/example`).
- Add optional frontmatter: `title`, `date`, `description`, etc.
- Use `#Tag` anywhere in the body for tags.
- Use `$...$` and `$$...$$` for math, and fenced code blocks for code (Shiki will highlight them).

Example frontmatter:

```yaml
---
title: My post
date: 2025-02-14
---
```

## Scripts

| Command                   | Description                          |
|---------------------------|--------------------------------------|
| `npm run dev`             | Start dev server                     |
| `npm run build`           | Generate index/stats + Next.js build |
| `npm run start`           | Start production server              |
| `npm run generate-search-index` | Write `public/search-index.json` |
| `npm run generate-stats`  | Write `public/stats.json`            |
| `npm run lint`            | Run ESLint                           |
| `npm run test`            | Run Vitest                           |

## License

Private / use as you like.
