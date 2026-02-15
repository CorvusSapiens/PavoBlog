'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

export interface StatsJson {
  totalArticles: number;
  leetcodeCount: number;
  difficultyDistribution: { easy: number; medium: number; hard: number };
  topTags: { tag: string; count: number }[];
  trendLast6Months: { month: string; count: number }[];
  /** 近 1 年每日发文数，key 为 YYYY-MM-DD（构建期生成，可能为空对象） */
  activityByDay?: Record<string, number>;
}

/** Recharts 仅在此组件内按需加载，ssr: false 保证 /dashboard 静态输出不包含图表执行逻辑 */
const Charts = dynamic(() => import('./Charts'), { ssr: false });

const HEATMAP_DAYS = 364; // 52 周
const HEATMAP_COLS = 52;
const HEATMAP_ROWS = 7;

function getDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getHeatmapLevel(count: number): string {
  if (count <= 0) return 'bg-neutral-100 dark:bg-neutral-800';
  if (count === 1) return 'bg-emerald-200 dark:bg-emerald-900';
  if (count === 2) return 'bg-emerald-400 dark:bg-emerald-700';
  return 'bg-emerald-600 dark:bg-emerald-500';
}

interface DashboardClientProps {
  /** 由 Data 页服务端从 DB 聚合后传入 */
  initialStats: StatsJson;
}

export default function DashboardClient({ initialStats }: DashboardClientProps) {
  const [stats] = useState<StatsJson | null>(initialStats);

  if (!stats) {
    return (
      <p className="text-neutral-500 dark:text-neutral-400">
        暂无统计。
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">总文章数</h2>
          <p className="text-2xl font-semibold">{stats.totalArticles}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">LeetCode 题数</h2>
          <p className="text-2xl font-semibold">{stats.leetcodeCount}</p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">难度（E / M / H）</h2>
          <p className="text-lg font-semibold">
            {stats.difficultyDistribution.easy} / {stats.difficultyDistribution.medium} / {stats.difficultyDistribution.hard}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mb-1">Top 标签数</h2>
          <p className="text-2xl font-semibold">{stats.topTags.length}</p>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-lg font-semibold mb-4">热力图</h2>
        <div className="overflow-x-auto">
          <div
            className="inline-grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${HEATMAP_COLS}, 12px)`,
              gridTemplateRows: `repeat(${HEATMAP_ROWS}, 12px)`,
              gridAutoFlow: 'column',
              width: 'max-content',
            }}
          >
            {(() => {
              const end = new Date();
              end.setHours(0, 0, 0, 0);
              const start = new Date(end);
              start.setDate(start.getDate() - HEATMAP_DAYS + 1);
              const cells: { dateKey: string; count: number }[] = [];
              for (let dayIndex = 0; dayIndex < HEATMAP_DAYS; dayIndex++) {
                const d = new Date(start);
                d.setDate(d.getDate() + dayIndex);
                const dateKey = getDayKey(d);
                cells.push({ dateKey, count: (stats.activityByDay ?? {})[dateKey] ?? 0 });
              }
              const byWeek: { dateKey: string; count: number }[] = [];
              for (let col = 0; col < HEATMAP_COLS; col++) {
                for (let row = 0; row < HEATMAP_ROWS; row++) {
                  const dayIndex = col * 7 + row;
                  byWeek.push(cells[dayIndex]!);
                }
              }
              return byWeek.map(({ dateKey, count }) => (
                <div
                  key={dateKey}
                  className={`rounded-[2px] ${getHeatmapLevel(count)}`}
                  title={`${dateKey}：${count} 篇`}
                />
              ));
            })()}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500 dark:text-neutral-400">
          <span>少</span>
          <span className="flex gap-1">
            <span className="w-3 h-3 rounded-sm bg-neutral-100 dark:bg-neutral-800" />
            <span className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
            <span className="w-3 h-3 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
            <span className="w-3 h-3 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
          </span>
          <span>多</span>
        </div>
      </div>

      <Charts stats={stats} />
    </div>
  );
}
