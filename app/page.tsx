import Link from 'next/link';
import { listLeetCodeNotes } from '@/lib/leetcode.service';

const LATEST_POSTS_COUNT = 5;

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default async function HomePage() {
  const allPosts = await listLeetCodeNotes();
  const latestPosts = allPosts.slice(0, LATEST_POSTS_COUNT);

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">PavoBlog</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-8">
        非常简单的知识存放地
      </p>

      <div>
        <h2 className="text-xl font-semibold mb-3">最新文章</h2>
        {latestPosts.length === 0 ? (
          <p className="text-sm text-neutral-500">暂无文章。</p>
        ) : (
          <ul className="space-y-2">
            {latestPosts.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/leetcode/${p.slug}`}
                  className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                >
                  {p.title}
                </Link>
                <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
                  {formatDate(p.updatedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link
          href="/posts"
          className="inline-block mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          查看全部 →
        </Link>
      </div>
    </section>
  );
}
