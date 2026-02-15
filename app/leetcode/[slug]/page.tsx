import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCachedLeetCodeNoteBySlug, buildLeetCodeListQuery } from '@/lib/leetcode.service';
import TipTapEditor from '@/components/editor/TipTapEditor';
import CheckInButton from '@/components/leetcode/CheckInButton';
import type { LeetCodeNoteDto } from '@/lib/leetcode.service';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

const DIFFICULTY_CLASS: Record<Difficulty, string> = {
  EASY: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
  MEDIUM: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
  HARD: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
};

type Props = { params: Promise<{ slug: string }> };

export default async function LeetCodeDetailPage({ params }: Props) {
  const { slug } = await params;
  const note = await getCachedLeetCodeNoteBySlug(slug);
  if (!note) notFound();

  const n = note as LeetCodeNoteDto;
  const meta = n.meta;
  const dp = n.displayProgress;
  const difficulty = meta?.difficulty;
  const difficultyClass = difficulty ? DIFFICULTY_CLASS[difficulty] : '';

  return (
    <article className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
      {/* 主内容区：移动端在上方，桌面端在左，最大宽度 700–800px */}
      <div className="min-w-0 flex-1 max-w-[800px] order-2 lg:order-1">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">
          {n.title}
        </h1>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {difficulty && (
            <span
              className={`rounded border px-2 py-0.5 text-sm font-medium capitalize ${difficultyClass}`}
            >
              {difficulty.toLowerCase()}
            </span>
          )}
          {n.sources.map((s) => (
            <Link
              key={s}
              href={`/leetcode${buildLeetCodeListQuery({ sources: [s] })}`}
              className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              {s}
            </Link>
          ))}
          {n.tags.map((tag) => (
            <Link
              key={tag}
              href={`/leetcode${buildLeetCodeListQuery({ tags: [tag] })}`}
              className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {n.meta?.problemUrl && (
          <p className="mb-4 text-sm">
            <a
              href={n.meta.problemUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {n.meta.problemUrl}
            </a>
          </p>
        )}

        <div className="prose dark:prose-invert max-w-none min-w-0">
          <TipTapEditor initialJson={n.content} readOnly />
        </div>

        <div className="mt-6">
          <Link
            href="/leetcode"
            className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline"
          >
            ← 返回列表
          </Link>
        </div>
      </div>

      {/* 信息面板：移动端在上，桌面端在右且 sticky */}
      <aside className="w-full lg:w-56 shrink-0 order-1 lg:order-2 lg:sticky lg:top-4">
        <div className="rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/50 p-4">
          <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            <div className="flex justify-between gap-4">
              <span>首次</span>
              <span className="text-neutral-900 dark:text-neutral-100 tabular-nums">{dp.firstDate}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>最近</span>
              <span className="text-neutral-900 dark:text-neutral-100 tabular-nums">{dp.latestDate}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>次数</span>
              <span className="text-neutral-900 dark:text-neutral-100 tabular-nums">{dp.count} 次</span>
            </div>
            <div className="flex justify-between gap-4">
              <span>独立</span>
              <span className="text-neutral-900 dark:text-neutral-100">{meta?.independent ? '✓' : '—'}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <CheckInButton
              noteId={n.id}
              className="w-full rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 py-3 px-4 text-base font-medium hover:opacity-90 disabled:opacity-50"
            />
          </div>
        </div>
      </aside>
    </article>
  );
}
