# PavoBlog

A small blog for notes and posts: Next.js, TypeScript, Tailwind, MDX. Write in MDX with math (`$...$`), code highlighting, and tags right in the text (`#Tag`).

**What you get:** post list + search, a simple dashboard with stats, and article pages with TOC. Tags come from `#Tag` in the body—no need to list them in frontmatter.

## Run it

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### local Postgres + Prisma (optional)

```bash
# 1. Copy env and launch Postgres
cp .env.example .env
docker compose up -d

# 2. Run migrations and generate Prisma Client
npx prisma migrate dev

# 3. Open Prisma Studio view/edit data
npx prisma studio
```

For production, `npm run build` will generate the search index and stats, then build. After that, `npm start`.

## Adding posts

Drop `.mdx` files in `content/leetcode/` or `content/books/`. The folder path is the URL slug (e.g. `content/leetcode/example.mdx` → `/posts/leetcode/example`). Frontmatter is optional: `title`, `date`, etc. Use `#Something` in the body for tags.

## Project layout

- `app/` — pages (home, posts + search, post detail, dashboard)
- `content/` — your MDX (e.g. `leetcode/`, `books/`)
- `lib/` — parsing, tags, search index, stats, MDX config
- `scripts/` — generate search index and stats (also run on build)

That’s it. For more detail, see `SETUP.md`.
