import type { Metadata } from 'next';
import './globals.css';
import 'katex/dist/katex.min.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'PavoBlog',
  description: '知识管理博客 · Next.js + MDX + Tailwind',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">
        <header className="border-b border-neutral-200 dark:border-neutral-800">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-semibold text-lg">
              PavoBlog
            </Link>
            <div className="flex gap-6">
              <Link href="/posts" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
                Posts
              </Link>
              <Link href="/dashboard" className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100">
                Data
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
