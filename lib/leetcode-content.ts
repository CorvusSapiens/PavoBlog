/**
 * 从 TipTap/ProseMirror 富文本 JSON 提取纯文本摘要（不含代码块）
 */

const DEFAULT_MAX_LENGTH = 160;

function walkCollectText(node: unknown, parts: string[]): void {
  if (!node || typeof node !== 'object') return;
  const n = node as Record<string, unknown>;
  if (n.type === 'text' && typeof n.text === 'string') {
    parts.push(n.text);
    return;
  }
  if (n.type === 'codeBlock') return;
  const content = n.content;
  if (Array.isArray(content)) {
    for (const c of content) walkCollectText(c, parts);
  }
}

/**
 * 从 doc 提取纯文本，跳过 codeBlock，截断到 maxLength 字符
 */
export function extractPlainTextSummary(
  doc: Record<string, unknown>,
  maxLength: number = DEFAULT_MAX_LENGTH
): string {
  const parts: string[] = [];
  walkCollectText(doc, parts);
  const raw = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (raw.length <= maxLength) return raw;
  return raw.slice(0, maxLength).trim() + '…';
}
