import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getPostsIndex } from '@/lib/parsePost';
import { getArticleBySlug } from '@/lib/get-article';
import { extractToc } from '@/lib/toc';
import { remarkPlugins, rehypePlugins } from '@/lib/mdx-config';
import type { TocItem } from '@/lib/toc';

type Props = { params: Promise<{ slug: string[] }> };

export async function generateStaticParams() {
  const posts = getPostsIndex();
  return posts.map((p) => ({ slug: p.slug.split('/') }));
}

function TocSidebar({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <nav className="sticky top-6 shrink-0 w-52 hidden xl:block" aria-label="目录">
      <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400 mb-2">目录</h2>
      <ul className="space-y-1 text-sm border-l border-neutral-200 dark:border-neutral-700 pl-4">
        {items.map(({ id, text, depth }) => (
          <li
            key={id}
            style={{ paddingLeft: `${(depth - 1) * 8}px` }}
            className="border-l-2 border-transparent -ml-px hover:border-neutral-400 dark:hover:border-neutral-500"
          >
            <a
              href={`#${id}`}
              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 block py-0.5"
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default async function PostDetailPage({ params }: Props) {
  const { slug: slugParts } = await params;
  const slug = slugParts?.join('/') ?? '';
  if (!slug) notFound();

  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const { meta, rawContent } = article;
  const toc = extractToc(rawContent);

  return (
    <article className="flex gap-8">
      <div className="min-w-0 flex-1">
        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{meta.title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            {meta.date && (
              <time dateTime={meta.date instanceof Date ? meta.date.toISOString() : meta.date}>
                {meta.date instanceof Date ? meta.date.toISOString().slice(0, 10) : meta.date}
              </time>
            )}
            {meta.difficulty && (
              <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 capitalize">
                {meta.difficulty}
              </span>
            )}
            <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">
              {meta.category}
            </span>
            {meta.tags.length > 0 &&
              meta.tags.map((tag: string) => (
                <span key={tag} className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">
                  #{tag}
                </span>
              ))}
          </div>
        </header>
        <div className="prose dark:prose-invert max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-neutral-200 dark:prose-pre:border-neutral-700">
          <MDXRemote
            source={rawContent}
            options={{
              mdxOptions: {
                remarkPlugins,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                rehypePlugins: rehypePlugins as any,
              },
            }}
          />
        </div>
      </div>
      <TocSidebar items={toc} />
    </article>
  );
}
