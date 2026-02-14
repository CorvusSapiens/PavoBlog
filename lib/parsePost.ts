import matter from 'gray-matter';
import path from 'path';
import fs from 'fs';
import type { ContentCategory } from './parser';
import { getAllMdxPaths } from './parser';
import { extractTags } from './extractTags';

const CONTENT_DIR = path.join(process.cwd(), 'content');

/** 单篇文章解析结果：title / date / slug / content / tags / summary / difficulty / category */
export interface ParsedPost {
  title: string;
  date?: string | Date;
  slug: string;
  content: string;
  tags: string[];
  summary: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  category: ContentCategory;
}

/** tags 索引中每篇文章的摘要信息 */
export interface PostSummary {
  slug: string;
  title: string;
  date?: string | Date;
}

/** tags 索引：tag -> posts[] */
export type TagsIndex = Map<string, PostSummary[]>;

/** 文章索引列表项（按 date 倒序用） */
export interface PostListItem {
  slug: string;
  title: string;
  date?: string | Date;
  summary: string;
  tags: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  category: ContentCategory;
}

const DEFAULT_SUMMARY_LENGTH = 160;

function toTime(d: string | Date | undefined): number {
  if (!d) return 0;
  if (typeof d === 'string') return new Date(d).getTime();
  return d.getTime();
}

/**
 * 解析单篇内容：frontmatter + 正文，并用 extractTags 从正文提取 #tag
 */
export function parsePost(
  rawContent: string,
  slug: string,
  category: ContentCategory
): ParsedPost {
  const { data, content } = matter(rawContent);
  const title = (data.title as string) ?? slug;
  const date = data.date;
  const tags = extractTags(content);
  const difficulty = data.difficulty as 'easy' | 'medium' | 'hard' | undefined;
  const summary = content
    .slice(0, DEFAULT_SUMMARY_LENGTH)
    .replace(/\n/g, ' ')
    .trim();
  return {
    title,
    date,
    slug,
    content,
    tags,
    summary,
    difficulty,
    category,
  };
}

/**
 * 构建期生成 tags 索引：tag -> posts[]
 * 遍历所有 MDX，parsePost 后按 tag 聚合。
 */
export function buildTagsIndex(): TagsIndex {
  const index: TagsIndex = new Map();
  const paths = getAllMdxPaths();

  for (const { slug, category } of paths) {
    const filePath = path.join(CONTENT_DIR, slug + '.mdx');
    const altPath = path.join(CONTENT_DIR, slug + '.md');
    const resolved = fs.existsSync(filePath) ? filePath : fs.existsSync(altPath) ? altPath : null;
    if (!resolved) continue;
    const rawContent = fs.readFileSync(resolved, 'utf-8');
    const post = parsePost(rawContent, slug, category);
    const summary: PostSummary = {
      slug: post.slug,
      title: post.title,
      date: post.date,
    };
    for (const tag of post.tags) {
      const list = index.get(tag) ?? [];
      list.push(summary);
      index.set(tag, list);
    }
  }

  return index;
}

/**
 * 获取所有 tag 列表（用于 generateStaticParams 等）
 */
export function getAllTags(index: TagsIndex): string[] {
  return Array.from(index.keys());
}

/**
 * 构建期文章索引：扫描 /content 下所有 MDX，按 date 倒序返回列表
 */
export function getPostsIndex(): PostListItem[] {
  const paths = getAllMdxPaths();
  const list: PostListItem[] = [];
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
      date: post.date,
      summary: post.summary,
      tags: post.tags,
      difficulty: post.difficulty,
      category: post.category,
    });
  }
  list.sort((a, b) => toTime(b.date) - toTime(a.date));
  return list;
}

