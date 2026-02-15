'use client';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import type { StatsJson } from './DashboardClient';

const DIFFICULTY_COLORS = { easy: '#22c55e', medium: '#eab308', hard: '#ef4444' };

interface ChartsProps {
  stats: StatsJson;
}

/** 仅客户端渲染的 Recharts 图表，由 /dashboard 通过 dynamic(..., { ssr: false }) 加载，不参与静态输出 */
export default function Charts({ stats }: ChartsProps) {
  const difficultyData = [
    { name: 'Easy', value: stats.difficultyDistribution.easy, color: DIFFICULTY_COLORS.easy },
    { name: 'Medium', value: stats.difficultyDistribution.medium, color: DIFFICULTY_COLORS.medium },
    { name: 'Hard', value: stats.difficultyDistribution.hard, color: DIFFICULTY_COLORS.hard },
  ].filter((d) => d.value > 0);

  return (
    <>
      {difficultyData.length > 0 && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <h2 className="text-lg font-semibold mb-4">难度分布</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={difficultyData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name} ${value}`}
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {stats.topTags.length > 0 && (
        <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
          <h2 className="text-lg font-semibold mb-4">Top 标签</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topTags} layout="vertical" margin={{ left: 60, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
                <XAxis type="number" className="text-xs" />
                <YAxis type="category" dataKey="tag" width={56} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="篇数" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4">
        <h2 className="text-lg font-semibold mb-4">近 6 个月趋势</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.trendLast6Months} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-neutral-200 dark:stroke-neutral-700" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                name="篇数"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}
