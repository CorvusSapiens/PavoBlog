import Link from 'next/link';
import {
  getCachedListLeetCodeNotes,
  buildLeetCodeListQuery,
  type LeetCodeListParams,
  type FilterMode,
} from '@/lib/leetcode.service';
import { extractPlainTextSummary } from '@/lib/leetcode-content';
import type { LeetCodeNoteDto } from '@/lib/leetcode.service';
import LeetCodeCard from '@/components/leetcode/LeetCodeCard';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type SearchParams = {
  tags?: string;
  sources?: string;
  mode?: string;
  difficulty?: string;
  q?: string;
  sort?: string;
  order?: string;
};

function parseListParams(resolved: SearchParams) {
  const tags: string[] = resolved.tags ? resolved.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];
  const sources: string[] = resolved.sources ? resolved.sources.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const mode: FilterMode = resolved.mode === 'or' ? 'or' : 'and';
  const difficulty = resolved.difficulty as Difficulty | undefined;
  const validDifficulty =
    difficulty && ['EASY', 'MEDIUM', 'HARD'].includes(difficulty) ? difficulty : undefined;
  const q = (resolved.q ?? '').trim();
  const sort: 'updatedAt' | 'createdAt' | 'title' = ['createdAt', 'title'].includes(resolved.sort ?? '') ? (resolved.sort as 'createdAt' | 'title') : 'updatedAt';
  const order: 'asc' | 'desc' = resolved.order === 'asc' ? 'asc' : 'desc';
  return { tags, sources, mode, difficulty: validDifficulty, q, sort, order };
}

function filterBySearch(notes: LeetCodeNoteDto[], q: string): LeetCodeNoteDto[] {
  if (!q) return notes;
  const lower = q.toLowerCase();
  return notes.filter(
    (n) =>
      n.title.toLowerCase().includes(lower) ||
      n.slug.toLowerCase().includes(lower) ||
      n.tags.some((t) => t.toLowerCase().includes(lower))
  );
}

function sortNotes(
  notes: LeetCodeNoteDto[],
  sort: 'updatedAt' | 'createdAt' | 'title',
  order: 'asc' | 'desc'
): LeetCodeNoteDto[] {
  const arr = [...notes];
  const mult = order === 'asc' ? 1 : -1;
  arr.sort((a, b) => {
    if (sort === 'title') {
      return mult * a.title.localeCompare(b.title);
    }
    const da = sort === 'createdAt' ? a.createdAt : a.updatedAt;
    const db = sort === 'createdAt' ? b.createdAt : b.updatedAt;
    return mult * (new Date(da).getTime() - new Date(db).getTime());
  });
  return arr;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
];

const SORT_OPTIONS: { value: 'updatedAt' | 'createdAt' | 'title'; label: string }[] = [
  { value: 'updatedAt', label: '最近更新' },
  { value: 'createdAt', label: '首次发布' },
  { value: 'title', label: '标题' },
];

type Props = { searchParams: Promise<SearchParams> };

export default async function LeetCodeListPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const parsed = parseListParams(resolved);
  const tagsArr = parsed.tags;
  const sourcesArr = parsed.sources;
  const { mode, difficulty, q, sort, order } = parsed;

  const [allNotes, notes] = await Promise.all([
    getCachedListLeetCodeNotes({}),
    getCachedListLeetCodeNotes({
      tags: tagsArr.length ? tagsArr : undefined,
      tagsMode: mode,
      sources: sourcesArr.length ? sourcesArr : undefined,
      sourcesMode: mode,
      difficulty,
    }),
  ]);

  const filtered = filterBySearch(notes, q);
  const sorted = sortNotes(filtered, sort, order);

  const allTags = Array.from(new Set(allNotes.flatMap((n) => n.tags))).sort();
  const allSources = Array.from(new Set(allNotes.flatMap((n) => n.sources))).sort();

  const baseUrl = '/leetcode';
  const listParams: LeetCodeListParams = { tags: tagsArr, sources: sourcesArr, mode, difficulty, q: q || undefined, sort, order };
  const buildQuery = (overrides: Partial<LeetCodeListParams>) =>
    buildLeetCodeListQuery({ ...listParams, ...overrides });
  const currentQuery = { tags: tagsArr, sources: sourcesArr, mode: mode ?? 'and', difficulty };

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">LeetCode 笔记</h1>

      {/* 搜索 */}
      <form method="get" className="mb-4">
        <input type="hidden" name="tags" value={tagsArr.join(',')} />
        <input type="hidden" name="sources" value={sourcesArr.join(',')} />
        <input type="hidden" name="mode" value={mode} />
        {difficulty && <input type="hidden" name="difficulty" value={difficulty} />}
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="order" value={order} />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="搜索标题、标签…"
          className="w-full max-w-md rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
          aria-label="搜索"
        />
      </form>

      {(tagsArr.length > 0 || sourcesArr.length > 0) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">已选：</span>
          {tagsArr.map((tag) => {
            const newTags = tagsArr.filter((t) => t !== tag);
            return (
              <Link
                key={`tag-${tag}`}
                href={`${baseUrl}${buildQuery({ tags: newTags.length ? newTags : undefined })}`}
                className="rounded-full px-3 py-1 text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                #{tag} ×
              </Link>
            );
          })}
          {sourcesArr.map((source) => {
            const newSources = sourcesArr.filter((s) => s !== source);
            return (
              <Link
                key={`src-${source}`}
                href={`${baseUrl}${buildQuery({ sources: newSources.length ? newSources : undefined })}`}
              className="rounded-full px-3 py-1 text-sm bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-300 dark:hover:bg-neutral-600"
              >
                {source} ×
              </Link>
            );
          })}
        </div>
      )}

      <div className="mb-6 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-2">筛选</div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-1">Difficulty</span>
          {DIFFICULTIES.map((d) => {
            const isActive = difficulty === d.value;
            const href = buildQuery({ difficulty: isActive ? undefined : d.value });
            return (
              <Link
                key={d.value}
                href={`${baseUrl}${href}`}
                className={`rounded px-2 py-1 text-sm ${isActive ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
              >
                {d.label}
              </Link>
            );
          })}
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mx-2">|</span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-1">From</span>
          {allSources.map((f) => {
            const isInFilter = sourcesArr.includes(f);
            const newSources = isInFilter ? sourcesArr.filter((s) => s !== f) : [...sourcesArr, f];
            const href = buildQuery({ sources: newSources.length ? newSources : undefined });
            return (
              <Link
                key={f}
                href={`${baseUrl}${href}`}
                className={`rounded px-2 py-1 text-sm ${isInFilter ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
              >
                {f}
              </Link>
            );
          })}
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mx-2">|</span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-1">Tag</span>
          {allTags.map((tag) => {
            const isInFilter = tagsArr.includes(tag);
            const newTags = isInFilter ? tagsArr.filter((t) => t !== tag) : [...tagsArr, tag];
            const href = buildQuery({ tags: newTags.length ? newTags : undefined });
            return (
              <Link
                key={tag}
                href={`${baseUrl}${href}`}
                className={`rounded px-2 py-1 text-sm ${isInFilter ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
              >
                #{tag}
              </Link>
            );
          })}
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mx-2">|</span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-1">Mode</span>
          <Link
            href={`${baseUrl}${buildQuery({ mode: 'and' })}`}
            className={`rounded px-2 py-1 text-sm ${mode === 'and' ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
          >
            AND
          </Link>
          <Link
            href={`${baseUrl}${buildQuery({ mode: 'or' })}`}
            className={`rounded px-2 py-1 text-sm ${mode === 'or' ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
          >
            OR
          </Link>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mx-2">|</span>
          <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-1">排序</span>
          {SORT_OPTIONS.map((opt) => {
            const isActive = sort === opt.value;
            const nextOrder = isActive && order === 'desc' ? 'asc' : 'desc';
            const href = buildQuery({ sort: opt.value, order: nextOrder });
            return (
              <Link
                key={opt.value}
                href={`${baseUrl}${href}`}
                className={`rounded px-2 py-1 text-sm ${isActive ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'}`}
              >
                {opt.label} {isActive ? (order === 'asc' ? '↑' : '↓') : ''}
              </Link>
            );
          })}
        </div>
      </div>

      {sorted.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">暂无匹配笔记。</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          {sorted.map((n) => (
            <LeetCodeCard
              key={n.id}
              note={n}
              summary={extractPlainTextSummary(n.content as Record<string, unknown>, 160)}
              baseUrl={baseUrl}
              currentQuery={currentQuery}
              buildQuery={(p) => buildLeetCodeListQuery({ ...listParams, ...p })}
            />
          ))}
        </div>
      )}
    </section>
  );
}
