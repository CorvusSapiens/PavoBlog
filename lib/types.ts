/**
 * 文章元数据（来自 frontmatter + 解析结果）
 */
export interface ArticleMeta {
  slug: string;
  title: string;
  /** 可能为 string 或 Date */
  date?: string | Date;
  difficulty?: 'easy' | 'medium' | 'hard';
  category: 'leetcode' | 'books';
  tags: string[];
}

/**
 * 文章条目（列表/索引用）
 */
export interface ArticleEntry extends ArticleMeta {
  excerpt?: string;
}

/**
 * 完整文章（含正文，用于详情页）
 */
export interface Article extends ArticleEntry {
  content: string;
}

/**
 * 标签聚合
 */
export interface TagEntry {
  tag: string;
  count: number;
  slugs: string[];
}

/**
 * 搜索索引项（构建期写入 search-index.json）
 */
export interface SearchIndexItem {
  slug: string;
  title: string;
  excerpt?: string;
  tags: string[];
  category: string;
}

/** 站内搜索索引记录：title / summary / tags / slug / contentSnippet */
export interface SearchIndexRecord {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  contentSnippet: string;
}

/**
 * Dashboard 统计数据
 */
export interface DashboardStats {
  totalArticles: number;
  byCategory: Record<string, number>;
  byDifficulty: Record<string, number>;
  tagCount: number;
  tagCloud: TagEntry[];
}
