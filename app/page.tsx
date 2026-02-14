import Link from 'next/link';
import { getPostsIndex } from '@/lib/parsePost';

const LATEST_POSTS_COUNT = 5;

function formatDate(d: string | Date | undefined): string {
  if (!d) return '';
  if (typeof d === 'string') return d;
  return d.toISOString().slice(0, 10);
}

export default function HomePage() {
  const posts = getPostsIndex();
  const latestPosts = posts.slice(0, LATEST_POSTS_COUNT);

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
              <li key={p.slug}>
                <Link
                  href={`/posts/${p.slug}`}
                  className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                >
                  {p.title}
                </Link>
                {p.date && (
                  <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-2">
                    {formatDate(p.date)}
                  </span>
                )}
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
