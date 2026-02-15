import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Admin</h1>
        <Link
          href="/"
          className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          ← 返回首页
        </Link>
      </div>
      <nav className="mb-6 flex gap-4 border-b border-neutral-200 dark:border-neutral-700 pb-2">
        <Link
          href="/admin/leetcode"
          className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          LeetCode 笔记
        </Link>
        <Link
          href="/admin/leetcode/new"
          className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          新建
        </Link>
      </nav>
      {children}
    </section>
  );
}
