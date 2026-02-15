import Link from 'next/link';
import {
  getCachedListLeetCodeNotes,
  buildLeetCodeListQuery,
  type LeetCodeNoteDto,
} from '@/lib/leetcode.service';
import { extractPlainTextSummary } from '@/lib/leetcode-content';
import LeetCodeCard from '@/components/leetcode/LeetCodeCard';

type SearchParams = { q?: string; tags?: string };

function filterBySearch(notes: LeetCodeNoteDto[], q: string): LeetCodeNoteDto[] {
  if (!q.trim()) return notes;
  const lower = q.trim().toLowerCase();
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(lower) ||
      n.slug.toLowerCase().includes(lower) ||
      n.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

function filterByTags(notes: LeetCodeNoteDto[], tags: string[]): LeetCodeNoteDto[] {
  if (tags.length === 0) return notes;
  return notes.filter((n) => tags.every((t) => n.tags.includes(t)));
}

type Props = { searchParams: Promise<SearchParams> };

export default async function PostsPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const q = (resolved.q ?? '').trim();
  const tags = resolved.tags ? resolved.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const notes = await getCachedListLeetCodeNotes();
  const filtered = filterByTags(filterBySearch(notes, q), tags);
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort();

  const baseUrl = '/leetcode';
  const currentQuery = { tags, sources: [] as string[], mode: 'and' as const };
  const buildQuery = (p: Parameters<typeof buildLeetCodeListQuery>[0]) =>
    buildLeetCodeListQuery({ ...p, tags: p?.tags ?? currentQuery.tags, sources: p?.sources ?? [], mode: p?.mode ?? 'and' });

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Posts</h1>

      <form method="get" className="mb-4">
        <input type="hidden" name="tags" value={tags.join(',')} />
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
            const href = '/posts' + (params.toString() ? '?' + params.toString() : '');
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

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">暂无文章。</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          {filtered.map((n) => (
            <LeetCodeCard
              key={n.id}
              note={n}
              summary={extractPlainTextSummary(n.content as Record<string, unknown>, 160)}
              baseUrl={baseUrl}
              currentQuery={currentQuery}
              buildQuery={(p) => buildLeetCodeListQuery({ tags: p?.tags ?? [], sources: p?.sources ?? [], mode: p?.mode ?? 'and', difficulty: p?.difficulty })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
