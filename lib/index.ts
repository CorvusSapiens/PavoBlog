/**
 * 构建期：文章索引、tag 索引、search 索引、统计聚合
 * 入口汇总，供 getStaticPaths / getStaticProps 或 Server Components 使用
 */

export { parseMdxFile, getAllMdxPaths, relativePathToSlug, collectMdxPaths } from './parser';
export { buildDashboardStats } from './stats';
export { buildDashboardStatsJson } from './dashboard-stats';
export type { DashboardStatsJson, DifficultyDistribution, TrendMonth, ActivityByDay } from './dashboard-stats';
export { buildSearchIndex, getSearchIndexData } from './search-index';
export type { ContentCategory } from './parser';
export { extractTags } from './extractTags';
export { parsePost, buildTagsIndex, getAllTags, getPostsIndex } from './parsePost';
export type { ParsedPost, PostSummary, PostListItem, TagsIndex } from './parsePost';
export { extractTagsFromContent, aggregateTags } from './tags';
export type {
  ArticleMeta,
  ArticleEntry,
  Article,
  TagEntry,
  SearchIndexItem,
  DashboardStats,
} from './types';
export { extractToc } from './toc';
export type { TocItem } from './toc';
export { getArticleBySlug } from './get-article';
export type { ArticleWithRaw } from './get-article';
