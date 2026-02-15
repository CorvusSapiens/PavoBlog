'use client';

import Link from 'next/link';

export interface PaginationProps {
  /** 当前页，1-based */
  page: number;
  totalPages: number;
  /** 总条数（可选，用于显示） */
  total?: number;
  pageSize?: number;
  /** 列表路径，如 /posts、/leetcode、/admin/leetcode */
  basePath: string;
  /** 当前查询参数（不含 page），用于拼分页链接 */
  queryParams: Record<string, string>;
  /** 链接的 className */
  linkClass?: string;
  /** 当前页的 className */
  currentClass?: string;
}

function buildHref(basePath: string, queryParams: Record<string, string>, pageNum: number): string {
  const params = new URLSearchParams(queryParams);
  if (pageNum > 1) params.set('page', String(pageNum));
  else params.delete('page');
  const s = params.toString();
  return basePath + (s ? '?' + s : '');
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  basePath,
  queryParams,
  linkClass = 'rounded px-3 py-1.5 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700',
  currentClass = 'rounded px-3 py-1.5 text-sm bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 font-medium',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const href = (p: number) => buildHref(basePath, queryParams, p);

  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = page < totalPages ? page + 1 : null;

  const showPages: (number | 'ellipsis')[] = [];
  const add = (p: number) => {
    if (p >= 1 && p <= totalPages && !showPages.includes(p)) showPages.push(p);
  };
  add(1);
  if (page > 3) showPages.push('ellipsis');
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPages, page + 1); i++) add(i);
  if (page < totalPages - 2) showPages.push('ellipsis');
  add(totalPages);
  const dedup: (number | 'ellipsis')[] = [];
  let last: number | 'ellipsis' | undefined;
  for (const p of showPages) {
    if (p === 'ellipsis' && last === 'ellipsis') continue;
    dedup.push(p);
    last = p;
  }

  return (
    <nav className="flex flex-wrap items-center gap-2 mt-6" aria-label="分页">
      {total != null && pageSize != null && (
        <span className="text-sm text-neutral-500 dark:text-neutral-400 mr-2">
          共 {total} 条
        </span>
      )}
      {prevPage != null ? (
        <Link href={href(prevPage)} className={linkClass} aria-label="上一页">
          ← 上一页
        </Link>
      ) : (
        <span className="rounded px-3 py-1.5 text-sm text-neutral-400 dark:text-neutral-500 cursor-not-allowed" aria-disabled>
          ← 上一页
        </span>
      )}
      <span className="flex items-center gap-1">
        {dedup.map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="px-1 text-neutral-400">…</span>
          ) : p === page ? (
            <span key={p} className={currentClass} aria-current="page">{p}</span>
          ) : (
            <Link key={p} href={href(p)} className={linkClass}>
              {p}
            </Link>
          )
        )}
      </span>
      {nextPage != null ? (
        <Link href={href(nextPage)} className={linkClass} aria-label="下一页">
          下一页 →
        </Link>
      ) : (
        <span className="rounded px-3 py-1.5 text-sm text-neutral-400 dark:text-neutral-500 cursor-not-allowed" aria-disabled>
          下一页 →
        </span>
      )}
    </nav>
  );
}
