/**
 * 从正文中提取 #Tag（井号+连续非空白字符），不依赖 frontmatter tags
 */
const TAG_REGEX = /#([^\s#]+)/g;

export function extractTagsFromContent(content: string): string[] {
  const set = new Set<string>();
  let m: RegExpExecArray | null;
  TAG_REGEX.lastIndex = 0;
  while ((m = TAG_REGEX.exec(content)) !== null) {
    set.add(m[1].trim());
  }
  return Array.from(set);
}

/**
 * 聚合多篇文章的标签 -> { tag, count, slugs }
 */
export function aggregateTags(
  items: { slug: string; tags: string[] }[]
): Map<string, { count: number; slugs: string[] }> {
  const map = new Map<string, { count: number; slugs: string[] }>();
  for (const { slug, tags } of items) {
    for (const tag of tags) {
      const existing = map.get(tag);
      if (existing) {
        existing.count += 1;
        existing.slugs.push(slug);
      } else {
        map.set(tag, { count: 1, slugs: [slug] });
      }
    }
  }
  return map;
}
