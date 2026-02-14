/**
 * 构建期生成 public/stats.json
 * 运行：npm run generate-stats 或 build 时自动执行
 */
import fs from 'fs';
import path from 'path';
import { buildDashboardStatsJson } from '../lib/dashboard-stats';

const outDir = path.join(process.cwd(), 'public');
const outFile = path.join(outDir, 'stats.json');

function main() {
  const data = buildDashboardStatsJson();
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(data), 'utf-8');
  console.log(`Wrote stats to ${outFile}`);
}

main();
