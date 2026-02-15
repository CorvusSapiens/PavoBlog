'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import type { LeetCodeNoteDto } from '@/lib/leetcode.service';

/** 服务端传入后 Date 会序列化为字符串，客户端统一按 string 处理 */
type PostItem = Omit<LeetCodeNoteDto, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

function formatDate(d: string | Date): string {
  if (typeof d === 'string') return d.slice(0, 10);
  return d.toISOString().slice(0, 10);
}

interface Props {
  initialPosts: PostItem[];
}

export default function PostsWithSearch({ initialPosts }: Props) {
  const [query, setQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialPosts.forEach((p) => p.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [initialPosts]);

  const fuse = useMemo(
    () =>
      new Fuse(initialPosts, {
        keys: [
          { name: 'title', weight: 2 },
          { name: 'slug', weight: 1 },
          { name: 'tags', weight: 1 },
        ],
        threshold: 0.3,
      }),
    [initialPosts]
  );

  const filtered = useMemo(() => {
    let list = query.trim()
      ? fuse.search(query).map((r) => r.item)
      : [...initialPosts];
    if (selectedTags.length > 0) {
      list = list.filter((p) =>
        selectedTags.every((t) => p.tags.includes(t))
      );
    }
    return list;
  }, [query, selectedTags, fuse, initialPosts]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Posts</h1>
      <p className="text-neutral-600 dark:text-neutral-400 mb-4">
        所有发文（含 LeetCode 笔记等）
      </p>

      <div className="mb-6 space-y-3">
        <input
          type="search"
          placeholder="搜索标题、标签…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600"
          aria-label="搜索文章"
        />
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-neutral-500 dark:text-neutral-400 self-center">标签筛选：</span>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {initialPosts.length === 0 ? (
        <p className="text-sm text-neutral-500">暂无文章。</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">没有匹配的结果。</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((p) => (
            <li key={p.id} className="flex flex-wrap items-baseline gap-2">
              <Link
                href={`/leetcode/${p.slug}`}
                className="font-semibold text-lg hover:underline"
              >
                {p.title}
              </Link>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {formatDate(p.updatedAt)}
              </span>
              {p.meta?.difficulty && (
                <span className="rounded bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 text-sm capitalize">
                  {p.meta.difficulty.toLowerCase()}
                </span>
              )}
              {p.tags.length > 0 && (
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  {p.tags.join(', ')}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
