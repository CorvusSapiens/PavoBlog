# PavoBlog

A small blog for notes and posts: Next.js, TypeScript, Tailwind. Post list + search, a simple dashboard with stats, and article pages. LeetCode notes and content via TipTap (JSON).

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

Use the admin UI at `/admin/leetcode` to create and edit LeetCode notes. Content is stored as JSON (TipTap). Posts list and search are at `/posts`.

## Project layout

- `app/` — pages (home, posts, leetcode, dashboard, admin)
- `lib/` — services, parsing, search index, stats
- `scripts/` — generate search index and stats (also run on build)

That’s it. For more detail, see `SETUP.md`.
