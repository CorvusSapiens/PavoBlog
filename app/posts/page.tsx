import Link from 'next/link';
import {
  getCachedListLeetCodeNotes,
  getCachedListLeetCodeNotesPaginated,
  buildLeetCodeListQuery,
  DEFAULT_LIST_PAGE_SIZE,
} from '@/lib/leetcode.service';
import { extractPlainTextSummary } from '@/lib/leetcode-content';
import LeetCodeCard from '@/components/leetcode/LeetCodeCard';
import Pagination from '@/components/ui/Pagination';

type SearchParams = { q?: string; tags?: string; page?: string };

type Props = { searchParams: Promise<SearchParams> };

function parsePage(s: string | undefined): number {
  const n = parseInt(s ?? '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export default async function PostsPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const q = (resolved.q ?? '').trim();
  const tags = resolved.tags ? resolved.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const page = parsePage(resolved.page);
  const pageSize = DEFAULT_LIST_PAGE_SIZE;

  const [allNotes, result] = await Promise.all([
    getCachedListLeetCodeNotes({}),
    getCachedListLeetCodeNotesPaginated({
      tags: tags.length ? tags : undefined,
      q: q || undefined,
      page,
      pageSize,
    }),
  ]);

  const allTags = Array.from(new Set(allNotes.flatMap((n) => n.tags))).sort();
  const { items, total, totalPages } = result;

  const baseUrl = '/posts';
  const currentQuery = { tags, sources: [] as string[], mode: 'and' as const };
  const buildQuery = (p: Parameters<typeof buildLeetCodeListQuery>[0]) =>
    buildLeetCodeListQuery({ ...p, tags: p?.tags ?? currentQuery.tags, sources: p?.sources ?? [], mode: p?.mode ?? 'and', page: p?.page });

  const queryParams: Record<string, string> = {};
  if (tags.length) queryParams.tags = tags.join(',');
  if (q) queryParams.q = q;

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Posts</h1>

      <form method="get" className="mb-4">
        <input type="hidden" name="tags" value={tags.join(',')} />
        {page > 1 && <input type="hidden" name="page" value={String(page)} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="搜索标题、标签…"
          className="w-full max-w-md rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
          aria-label="搜索"
        />
      </form>

      {allTags.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">标签筛选：</span>
          {allTags.map((tag) => {
            const isIn = tags.includes(tag);
            const newTags = isIn ? tags.filter((t) => t !== tag) : [...tags, tag];
            const params = new URLSearchParams();
            if (newTags.length) params.set('tags', newTags.join(','));
            if (q) params.set('q', q);
            const href = baseUrl + (params.toString() ? '?' + params.toString() : '');
            return (
              <Link
                key={tag}
                href={href}
                className={`rounded-full px-3 py-1 text-sm ${isIn ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
              >
                #{tag}
              </Link>
            );
          })}
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">暂无文章。</p>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
            {items.map((n) => (
              <LeetCodeCard
                key={n.id}
                note={n}
                summary={extractPlainTextSummary(n.content as Record<string, unknown>, 160)}
                baseUrl="/leetcode"
                currentQuery={currentQuery}
                buildQuery={(p) => buildLeetCodeListQuery({ tags: p?.tags ?? [], sources: p?.sources ?? [], mode: p?.mode ?? 'and', difficulty: p?.difficulty })}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            basePath={baseUrl}
            queryParams={queryParams}
          />
        </>
      )}
    </section>
  );
}
