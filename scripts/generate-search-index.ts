/**
 * 构建期生成 public/search-index.json
 * 运行：npm run generate-search-index 或 prebuild 时自动执行
 */
import fs from 'fs';
import path from 'path';
import { getSearchIndexData } from '../lib/search-index';

const outDir = path.join(process.cwd(), 'public');
const outFile = path.join(outDir, 'search-index.json');

function main() {
  const data = getSearchIndexData();
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(data), 'utf-8');
  console.log(`Wrote ${data.length} items to ${outFile}`);
}

main();
