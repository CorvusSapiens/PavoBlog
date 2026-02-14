import matter from 'gray-matter';
import path from 'path';
import fs from 'fs';
import type { Article, ArticleMeta } from './types';
import { extractTags } from './extractTags';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export type ContentCategory = 'leetcode' | 'books';

/**
 * 读取并解析单个 MDX 文件：frontmatter + 正文，并提取 #Tag
 */
export function parseMdxFile(
  rawContent: string,
  slug: string,
  category: ContentCategory
): Article {
  const { data, content } = matter(rawContent);
  const tags = extractTags(content);
  const meta: ArticleMeta = {
    slug,
    title: (data.title as string) ?? slug,
    date: data.date,
    difficulty: data.difficulty,
    category,
    tags,
  };
  return {
    ...meta,
    excerpt: content.slice(0, 160).replace(/\n/g, ' ').trim(),
    content,
  };
}

/**
 * 递归收集目录下所有 .mdx / .md 相对路径
 */
export function collectMdxPaths(
  dir: string,
  base = ''
): { relativePath: string; category: ContentCategory }[] {
  const results: { relativePath: string; category: ContentCategory }[] = [];
  const fullDir = path.join(dir, base);
  if (!fs.existsSync(fullDir)) return results;

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      const cat = entry.name as ContentCategory;
      if (cat === 'leetcode' || cat === 'books') {
        results.push(...collectMdxPaths(dir, rel));
      }
    } else if (/\.mdx?$/.test(entry.name)) {
      const segment = base ? base.split(path.sep)[0] : '';
      const category: ContentCategory =
        segment === 'leetcode' || segment === 'books' ? segment : 'leetcode';
      results.push({
        relativePath: rel.replace(/\.mdx?$/, '').split(path.sep).join('/'),
        category,
      });
    }
  }
  return results;
}

/**
 * 将 relativePath 转为 URL slug（统一用 /）
 */
export function relativePathToSlug(relativePath: string): string {
  return relativePath.split(path.sep).join('/');
}

/**
 * 从 content 目录读取所有 MDX 路径（按 leetcode/books 分）
 */
export function getAllMdxPaths(): { slug: string; category: ContentCategory }[] {
  const pairs = collectMdxPaths(CONTENT_DIR);
  return pairs.map(({ relativePath, category }) => ({
    slug: relativePathToSlug(relativePath),
    category,
  }));
}
