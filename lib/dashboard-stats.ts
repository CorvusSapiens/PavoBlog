import { unstable_cache } from 'next/cache';
import { prisma } from './db';

/** 难度分布（来自 DB LeetCodeMeta） */
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

/** Dashboard 数据（Data 页数据来源：DB） */
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
const HEATMAP_DAYS = 364;

function getMonthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 从数据库聚合 Data 页统计（总文章数、LeetCode 数、难度、Top 标签、近 6 月趋势、热力图） */
export async function buildDashboardStatsFromDb(): Promise<DashboardStatsJson> {
  const posts = await prisma.post.findMany({
    where: { type: 'LEETCODE' },
    select: {
      createdAt: true,
      leetcodeMeta: { select: { difficulty: true } },
      postTags: { select: { tag: { select: { name: true } } } },
    },
  });

  const totalArticles = posts.length;
  const leetcodeCount = totalArticles;

  const difficultyDistribution: DifficultyDistribution = { easy: 0, medium: 0, hard: 0 };
  for (const p of posts) {
    const d = p.leetcodeMeta?.difficulty;
    if (d) {
      const key = d.toLowerCase() as keyof DifficultyDistribution;
      difficultyDistribution[key]++;
    }
  }

  const tagCount = new Map<string, number>();
  for (const p of posts) {
    for (const { tag } of p.postTags) {
      const name = tag.name;
      tagCount.set(name, (tagCount.get(name) ?? 0) + 1);
    }
  }
  const topTags = Array.from(tagCount.entries())
    .map(([tag, count]) => ({ tag, count }))
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
    const key = getMonthKey(p.createdAt);
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
    const key = getDayKey(p.createdAt);
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

/** 统计页数据带 5 分钟缓存，避免每次打开 Data 页都重查 */
export async function getCachedDashboardStats(): Promise<DashboardStatsJson> {
  return unstable_cache(
    () => buildDashboardStatsFromDb(),
    ['dashboard-stats'],
    { revalidate: 300 }
  )();
}
