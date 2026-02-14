import path from 'path';
import fs from 'fs';
import type { Article } from './types';
import type { ContentCategory } from './parser';
import { parseMdxFile } from './parser';

const CONTENT_DIR = path.join(process.cwd(), 'content');

export interface ArticleWithRaw {
  meta: Omit<Article, 'content'>;
  rawContent: string;
  category: ContentCategory;
}

/**
 * 根据 slug（如 leetcode/example）读取并解析文章，返回 meta + 原始正文
 */
export function getArticleBySlug(slug: string): ArticleWithRaw | null {
  const parts = slug.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  const category = parts[0] as ContentCategory;
  if (category !== 'leetcode' && category !== 'books') return null;
  const filePath = path.join(CONTENT_DIR, slug + '.mdx');
  const altPath = path.join(CONTENT_DIR, slug + '.md');
  const resolved = fs.existsSync(filePath) ? filePath : fs.existsSync(altPath) ? altPath : null;
  if (!resolved) return null;
  const rawContent = fs.readFileSync(resolved, 'utf-8');
  const parsed = parseMdxFile(rawContent, slug, category);
  const { content, ...meta } = parsed;
  return { meta, rawContent: content, category };
}
