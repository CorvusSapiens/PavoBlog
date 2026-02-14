'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import type { PostListItem } from '@/lib/parsePost';

interface SearchIndexRecord {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  contentSnippet: string;
}

function formatDate(d: string | Date | undefined): string {
  if (!d) return '';
  if (typeof d === 'string') return d;
  return d.toISOString().slice(0, 10);
}

function HighlightSnippet({ text, indices }: { text: string; indices: [number, number][] }) {
  if (!indices?.length) return <>{text}</>;
  const parts: { start: number; end: number; match: boolean }[] = [];
  let lastEnd = 0;
  for (const [from, to] of indices) {
    const end = to + 1;
    if (from > lastEnd) parts.push({ start: lastEnd, end: from, match: false });
    parts.push({ start: from, end, match: true });
    lastEnd = end;
  }
  if (lastEnd < text.length) parts.push({ start: lastEnd, end: text.length, match: false });
  return (
    <>
      {parts.map((p, i) =>
        p.match ? (
          <mark key={i} className="bg-amber-200 dark:bg-amber-800 rounded px-0.5">
            {text.slice(p.start, p.end)}
          </mark>
        ) : (
          <span key={i}>{text.slice(p.start, p.end)}</span>
        )
      )}
    </>
  );
}

function getMatchForKey(
  matches: readonly { key?: string | string[]; indices?: readonly [number, number][] }[] | null,
  key: string
): [number, number][] | null {
  if (!matches) return null;
  const m = matches.find((x) => (Array.isArray(x.key) ? x.key.join('.') : x.key) === key);
  return m?.indices ? [...m.indices] : null;
}

interface Props {
  initialPosts: PostListItem[];
}

export default function PostsWithSearch({ initialPosts }: Props) {
  const [index, setIndex] = useState<SearchIndexRecord[]>([]);
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loadingIndex, setLoadingIndex] = useState(true);

  useEffect(() => {
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: SearchIndexRecord[]) => {
        setIndex(data);
        setLoadingIndex(false);
      })
      .catch(() => setLoadingIndex(false));
  }, []);

  const fuse = useMemo(
    () =>
      new Fuse(index, {
        keys: [
          { name: 'title', weight: 0.4 },
          { name: 'summary', weight: 0.3 },
          { name: 'contentSnippet', weight: 0.2 },
          { name: 'tags', weight: 0.1 },
        ],
        includeMatches: true,
        threshold: 0.4,
      }),
    [index]
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    index.forEach((item) => item.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [index]);

  const rawResults = useMemo(() => {
    if (!query.trim()) return index.map((item) => ({ item, matches: null }));
    return fuse.search(query).map((r) => ({ item: r.item, matches: r.matches ?? null }));
  }, [query, fuse, index]);

  const searchResults = useMemo(() => {
    if (selectedTags.length === 0) return rawResults;
    return rawResults.filter(({ item }) =>
      selectedTags.every((t) => item.tags.includes(t))
    );
  }, [rawResults, selectedTags]);

  const isSearchActive = query.trim() !== '' || selectedTags.length > 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Posts</h1>

      <div className="space-y-4 mb-6">
        <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Search
            </h2>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <input
            type="search"
            placeholder="搜索标题、摘要、标签、正文片段…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="搜索"
          />
        </div>
        {!loadingIndex && allTags.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
              Filter
            </h2>
            <ul className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <li key={tag}>
                  <button
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-600 text-white dark:bg-blue-500'
                        : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    #{tag}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {isSearchActive ? (
        <div>
          <h2 className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            结果 {searchResults.length} 篇
          </h2>
          {loadingIndex ? (
            <p className="text-neutral-500 dark:text-neutral-400">正在加载搜索索引…</p>
          ) : searchResults.length === 0 ? (
            <p className="text-neutral-500 dark:text-neutral-400">无匹配结果。</p>
          ) : (
            <ul className="space-y-4">
              {searchResults.map(({ item, matches }) => {
                const titleIndices = getMatchForKey(matches ?? [], 'title');
                const summaryIndices = getMatchForKey(matches ?? [], 'summary');
                const snippetIndices = getMatchForKey(matches ?? [], 'contentSnippet');
                return (
                  <li
                    key={item.slug}
                    className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition"
                  >
                    <Link href={`/posts/${item.slug}`} className="font-semibold text-lg hover:underline block mb-1">
                      {titleIndices?.length ? (
                        <HighlightSnippet text={item.title} indices={titleIndices} />
                      ) : (
                        item.title
                      )}
                    </Link>
                    {item.summary && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">
                        {summaryIndices?.length ? (
                          <HighlightSnippet text={item.summary} indices={summaryIndices} />
                        ) : snippetIndices?.length && item.contentSnippet ? (
                          <HighlightSnippet text={item.contentSnippet.slice(0, 160)} indices={snippetIndices} />
                        ) : (
                          item.summary
                        )}
                      </p>
                    )}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.tags.map((tag) => (
                          <span key={tag} className="text-xs rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <>
          {initialPosts.length === 0 ? (
            <p className="text-sm text-neutral-500">暂无文章。</p>
          ) : (
            <ul className="space-y-4">
              {initialPosts.map((p) => (
                <li key={p.slug} className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition">
                  <Link href={`/posts/${p.slug}`} className="font-semibold text-lg hover:underline block mb-1">
                    {p.title}
                  </Link>
                  {p.date && (
                    <time className="text-sm text-neutral-500 dark:text-neutral-400 mr-3" dateTime={formatDate(p.date)}>
                      {formatDate(p.date)}
                    </time>
                  )}
                  {p.summary && (
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">{p.summary}</p>
                  )}
                  {p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {p.tags.map((tag) => (
                        <span key={tag} className="text-xs rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
