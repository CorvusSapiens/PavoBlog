import Link from 'next/link';
import type { LeetCodeNoteDto } from '@/lib/leetcode.service';
import CheckInButton from './CheckInButton';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type CardQuery = {
  tags: string[];
  sources: string[];
  mode: 'and' | 'or';
  difficulty?: Difficulty;
};

type BuildQueryFn = (params: {
  tags?: string[];
  sources?: string[];
  mode?: 'and' | 'or';
  difficulty?: Difficulty;
}) => string;

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  EASY: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  HARD: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
};

const MAX_TAGS_VISIBLE = 4;

interface LeetCodeCardProps {
  note: LeetCodeNoteDto;
  summary: string;
  baseUrl: string;
  currentQuery: CardQuery;
  buildQuery: BuildQueryFn;
}

export default function LeetCodeCard({
  note,
  summary,
  baseUrl,
  currentQuery,
  buildQuery,
}: LeetCodeCardProps) {
  const difficulty = note.meta?.difficulty;
  const difficultyClass = difficulty ? DIFFICULTY_CLASS[difficulty] : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400';
  const tagsVisible = note.tags.slice(0, MAX_TAGS_VISIBLE);
  const tagsOmitted = note.tags.length - MAX_TAGS_VISIBLE;
  const dp = note.displayProgress;

  const tagHref = (tag: string) => {
    const next = currentQuery.tags.includes(tag)
      ? currentQuery.tags
      : [...currentQuery.tags, tag];
    return baseUrl + buildQuery({ ...currentQuery, tags: next.length ? next : undefined });
  };
  const sourceHref = (source: string) => {
    const next = currentQuery.sources.includes(source)
      ? currentQuery.sources
      : [...currentQuery.sources, source];
    return baseUrl + buildQuery({ ...currentQuery, sources: next.length ? next : undefined });
  };

  return (
    <article className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 overflow-hidden flex flex-col">
      {/* 第一层：标题区 */}
      <div className="p-4 pb-2 flex items-start justify-between gap-3">
        <Link
          href={`/leetcode/${note.slug}`}
          className="font-bold text-lg text-neutral-900 dark:text-neutral-100 hover:underline leading-tight min-w-0"
        >
          {note.title}
        </Link>
        {difficulty && (
          <span
            className={`shrink-0 rounded border px-2 py-0.5 text-xs font-medium capitalize ${difficultyClass}`}
          >
            {difficulty.toLowerCase()}
          </span>
        )}
      </div>

      {/* 网址 */}
      {note.meta?.problemUrl && (
        <div className="px-4 pb-2">
          <a
            href={note.meta.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline truncate block max-w-full"
          >
            {note.meta.problemUrl}
          </a>
        </div>
      )}

      {/* 第二层：题单来源 + 标签 */}
      <div className="px-4 pb-2 flex flex-wrap items-center gap-1.5">
        {note.sources.length > 0 && (
          <>
            <span className="text-xs text-neutral-500 dark:text-neutral-400 shrink-0">From</span>
            {note.sources.map((s) => (
              <Link
                key={s}
                href={sourceHref(s)}
                className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                {s}
              </Link>
            ))}
          </>
        )}
        {tagsVisible.length > 0 && (
          <>
            {note.sources.length > 0 && (
              <span className="text-neutral-300 dark:text-neutral-600 mx-0.5">·</span>
            )}
            {tagsVisible.map((tag) => (
              <Link
                key={tag}
                href={tagHref(tag)}
                className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
              >
                #{tag}
              </Link>
            ))}
            {tagsOmitted > 0 && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">+{tagsOmitted}</span>
            )}
          </>
        )}
      </div>

      {/* 第三层：正文摘要 */}
      {summary && (
        <p className="px-4 pb-3 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
          {summary}
        </p>
      )}

      {/* 第四层：进度与操作 */}
      <div className="px-4 py-3 mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span>首次 {dp.firstDate}</span>
          <span>最近 {dp.latestDate}</span>
          <span>{dp.count} 次</span>
          <span>{note.meta?.independent ? '独立 ✓' : '—'}</span>
        </div>
        <CheckInButton
          noteId={note.id}
          className="rounded-md bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 px-3 py-1.5 text-xs font-medium hover:opacity-90 disabled:opacity-50"
        />
      </div>
    </article>
  );
}
