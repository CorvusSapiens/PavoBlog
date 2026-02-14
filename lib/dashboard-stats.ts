import { getPostsIndex } from './parsePost';
import { buildTagsIndex } from './parsePost';

/** 难度分布（frontmatter difficulty 或 #Easy/#Medium/#Hard 标签） */
export interface DifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

/** 近 N 个月趋势（按 date 聚合） */
export interface TrendMonth {
  month: string;
  count: number;
}

/** 热力图：按日聚合的发文数，key 为 YYYY-MM-DD */
export type ActivityByDay = Record<string, number>;

/** 构建期聚合的 Dashboard 数据，写入 public/stats.json */
export interface DashboardStatsJson {
  totalArticles: number;
  leetcodeCount: number;
  difficultyDistribution: DifficultyDistribution;
  topTags: { tag: string; count: number }[];
  trendLast6Months: TrendMonth[];
  /** 近 1 年每日发文数，供热力图使用 */
  activityByDay: ActivityByDay;
}

const TOP_TAGS_COUNT = 10;
const TREND_MONTHS = 6;
const HEATMAP_DAYS = 364; // 52 周

function inferDifficulty(
  difficulty: 'easy' | 'medium' | 'hard' | undefined,
  tags: string[]
): 'easy' | 'medium' | 'hard' | null {
  if (difficulty) return difficulty;
  const lower = tags.map((t) => t.toLowerCase());
  if (lower.includes('easy')) return 'easy';
  if (lower.includes('medium')) return 'medium';
  if (lower.includes('hard')) return 'hard';
  return null;
}

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * 构建期生成 Dashboard 统计：总文章数、LeetCode 数、难度分布、Top tags、近 6 个月趋势
 */
export function buildDashboardStatsJson(): DashboardStatsJson {
  const posts = getPostsIndex();
  const tagsIndex = buildTagsIndex();

  const totalArticles = posts.length;
  const leetcodeCount = posts.filter(
    (p) => p.category === 'leetcode' || p.tags.some((t) => t.toLowerCase() === 'leetcode')
  ).length;

  const difficultyDistribution: DifficultyDistribution = { easy: 0, medium: 0, hard: 0 };
  for (const p of posts) {
    const d = inferDifficulty(p.difficulty, p.tags);
    if (d) difficultyDistribution[d]++;
  }

  const topTags = Array.from(tagsIndex.entries())
    .map(([tag, list]) => ({ tag, count: list.length }))
    .sort((a, b) => b.count - a.count)
    .slice(0, TOP_TAGS_COUNT);

  const now = new Date();
  const monthKeys: string[] = [];
  for (let i = TREND_MONTHS - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(getMonthKey(d));
  }
  const trendMap = new Map<string, number>(monthKeys.map((m) => [m, 0]));
  for (const p of posts) {
    if (!p.date) continue;
    const d = p.date instanceof Date ? p.date : new Date(p.date);
    const key = getMonthKey(d);
    if (trendMap.has(key)) trendMap.set(key, (trendMap.get(key) ?? 0) + 1);
  }
  const trendLast6Months: TrendMonth[] = monthKeys.map((month) => ({
    month,
    count: trendMap.get(month) ?? 0,
  }));

  const activityByDay: ActivityByDay = {};
  const endDate = new Date(now);
  endDate.setHours(0, 0, 0, 0);
  for (let i = 0; i < HEATMAP_DAYS; i++) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    activityByDay[getDayKey(d)] = 0;
  }
  for (const p of posts) {
    if (!p.date) continue;
    const d = p.date instanceof Date ? p.date : new Date(p.date);
    const key = getDayKey(d);
    if (key in activityByDay) activityByDay[key] = (activityByDay[key] ?? 0) + 1;
  }

  return {
    totalArticles,
    leetcodeCount,
    difficultyDistribution,
    topTags,
    trendLast6Months,
    activityByDay,
  };
}
