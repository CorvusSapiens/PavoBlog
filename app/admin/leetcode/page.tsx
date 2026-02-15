import Link from 'next/link';
import { listLeetCodeNotesPaginated, DEFAULT_LIST_PAGE_SIZE_LARGE } from '@/lib/leetcode.service';
import { deleteLeetCodeFormAction } from '@/app/leetcode/actions';
import Pagination from '@/components/ui/Pagination';

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type Props = { searchParams: Promise<{ page?: string }> };

function parsePage(s: string | undefined): number {
  const n = parseInt(s ?? '1', 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export default async function AdminLeetCodeListPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const page = parsePage(resolved.page);
  const pageSize = DEFAULT_LIST_PAGE_SIZE_LARGE;

  const { items: notes, total, totalPages } = await listLeetCodeNotesPaginated({
    page,
    pageSize,
  });

  const basePath = '/admin/leetcode';
  const queryParams: Record<string, string> = {};

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">LeetCode 笔记列表</h2>
      {notes.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400 text-sm">暂无笔记，<Link href="/admin/leetcode/new" className="text-blue-600 dark:text-blue-400 hover:underline">新建</Link>。</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                  <th className="text-left p-3 font-medium">标题</th>
                  <th className="text-left p-3 font-medium">难度</th>
                  <th className="text-left p-3 font-medium">题单</th>
                  <th className="text-left p-3 font-medium">标签</th>
                  <th className="text-left p-3 font-medium">更新</th>
                  <th className="text-right p-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {notes.map((n) => (
                <tr key={n.id} className="border-t border-neutral-200 dark:border-neutral-700">
                  <td className="p-3">
                    <Link href={`/leetcode/${n.slug}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {n.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 capitalize">
                      {n.meta?.difficulty ?? '—'}
                    </span>
                  </td>
                  <td className="p-3 text-neutral-600 dark:text-neutral-400">{n.sources?.join(', ') ?? '—'}</td>
                  <td className="p-3 text-neutral-600 dark:text-neutral-400">
                    {n.tags.length > 0 ? n.tags.join(', ') : '—'}
                  </td>
                  <td className="p-3 text-neutral-500 dark:text-neutral-400">{formatDate(n.updatedAt)}</td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/leetcode/${n.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline mr-2"
                    >
                      Edit
                    </Link>
                    <form action={deleteLeetCodeFormAction} className="inline">
                      <input type="hidden" name="id" value={n.id} />
                      <button
                        type="submit"
                        className="text-red-600 dark:text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            basePath={basePath}
            queryParams={queryParams}
          />
        </>
      )}
    </div>
  );
}
