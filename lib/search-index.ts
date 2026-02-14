import path from 'path';
import fs from 'fs';
import type { ArticleEntry, SearchIndexItem, SearchIndexRecord } from './types';
import { getAllMdxPaths } from './parser';
import { parsePost } from './parsePost';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const CONTENT_SNIPPET_LENGTH = 500;

/** 简单去除 Markdown 符号，得到可搜索的纯文本片段 */
function toContentSnippet(raw: string): string {
  return raw
    .slice(0, CONTENT_SNIPPET_LENGTH)
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*?|__?/g, '')
    .replace(/`+/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 构建期生成 search-index 数据：title / summary / tags / slug / contentSnippet
 * 供写入 public/search-index.json 并在 /search 用 Fuse.js 搜索
 */
export function getSearchIndexData(): SearchIndexRecord[] {
  const paths = getAllMdxPaths();
  const list: SearchIndexRecord[] = [];
  for (const { slug, category } of paths) {
    const filePath = path.join(CONTENT_DIR, slug + '.mdx');
    const altPath = path.join(CONTENT_DIR, slug + '.md');
    const resolved = fs.existsSync(filePath) ? filePath : fs.existsSync(altPath) ? altPath : null;
    if (!resolved) continue;
    const rawContent = fs.readFileSync(resolved, 'utf-8');
    const post = parsePost(rawContent, slug, category);
    list.push({
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      tags: post.tags,
      contentSnippet: toContentSnippet(post.content),
    });
  }
  return list;
}

/**
 * 将文章列表转为搜索索引（旧接口，保留兼容）
 */
export function buildSearchIndex(articles: ArticleEntry[]): SearchIndexItem[] {
  return articles.map((a) => ({
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    tags: a.tags,
    category: a.category,
  }));
}
