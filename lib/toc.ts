/**
 * 从正文中提取标题，生成 TOC；id 与 rehype-slug 行为一致（小写、空格变横线、去特殊字符）
 */
export interface TocItem {
  id: string;
  text: string;
  depth: number;
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'heading';
}

const HEADING_REGEX = /^(#{1,6})\s+(.+)$/gm;

export function extractToc(content: string): TocItem[] {
  const toc: TocItem[] = [];
  let m: RegExpExecArray | null;
  HEADING_REGEX.lastIndex = 0;
  while ((m = HEADING_REGEX.exec(content)) !== null) {
    const depth = m[1].length;
    const text = m[2].trim().replace(/#+\s*$/, '').trim();
    const id = slugify(text);
    toc.push({ id, text, depth });
  }
  return toc;
}
