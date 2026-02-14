import type { ArticleEntry, DashboardStats, TagEntry } from './types';
import { aggregateTags } from './tags';

/**
 * 根据文章列表在构建期聚合统计数据：总题量、分类、难度、标签云
 */
export function buildDashboardStats(articles: ArticleEntry[]): DashboardStats {
  const byCategory: Record<string, number> = {};
  const byDifficulty: Record<string, number> = {};

  for (const a of articles) {
    byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;
    if (a.difficulty) {
      byDifficulty[a.difficulty] = (byDifficulty[a.difficulty] ?? 0) + 1;
    }
  }

  const tagMap = aggregateTags(articles.map((a) => ({ slug: a.slug, tags: a.tags })));
  const tagCloud: TagEntry[] = Array.from(tagMap.entries()).map(([tag, { count, slugs }]) => ({
    tag,
    count,
    slugs,
  }));

  return {
    totalArticles: articles.length,
    byCategory,
    byDifficulty,
    tagCount: tagCloud.length,
    tagCloud,
  };
}
