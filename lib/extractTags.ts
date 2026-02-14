/**
 * 从正文中提取 #tag，规则：
 * - 仅匹配英文/数字/下划线/短横线，如 #HashMap #two_sum
 * - 跳过 fenced code blocks（```...```），避免代码里的 # 被误识别
 * - 去重：按小写去重，保留首次出现的大小写。
 *   选择「保留首次大小写」：同一概念不同写法（#HashMap / #hashmap）视为一标签，
 *   展示时用第一次出现的写法，便于保持作者习惯且 URL 稳定（encodeURIComponent(tag)）。
 */

/** 仅匹配 # 后紧跟 [A-Za-z0-9_-]+，且前面不是 #（避免 ## 标题） */
const TAG_REGEX = /(?<!#)#([A-Za-z0-9_-]+)/g;

/**
 * 判断当前行是否为 fenced code 边界（``` 或 ```lang）
 */
function isFenceLine(line: string): boolean {
  return /^```[\w]*\s*$/.test(line.trim());
}

/**
 * 从一段文本（非代码块内）中提取所有 #tag，去重并保留首次出现的大小写
 */
function extractFromLine(line: string, seenLower: Set<string>, result: string[]): void {
  let m: RegExpExecArray | null;
  TAG_REGEX.lastIndex = 0;
  while ((m = TAG_REGEX.exec(line)) !== null) {
    const raw = m[1];
    const lower = raw.toLowerCase();
    if (seenLower.has(lower)) continue;
    seenLower.add(lower);
    result.push(raw);
  }
}

/**
 * 从正文中提取 #tag 列表。
 * - 跳过 fenced code blocks（```...```）内的内容。
 * - 去重：同一标签只保留一次，大小写以首次出现为准。
 */
export function extractTags(content: string): string[] {
  const result: string[] = [];
  const seenLower = new Set<string>();
  let inCodeBlock = false;
  const lines = content.split(/\r?\n/);

  for (const line of lines) {
    if (isFenceLine(line)) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (!inCodeBlock) {
      extractFromLine(line, seenLower, result);
    }
  }

  return result;
}
