/**
 * MDX 编译用 remark/rehype 插件配置（KaTeX、Shiki、标题 id/锚点）
 * 供 next-mdx-remote compileMDX 使用
 */
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

export const remarkPlugins = [remarkGfm, remarkMath];

export const rehypePlugins = [
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: 'wrap',
      properties: { className: ['anchor'] },
    },
  ],
  [
    rehypePrettyCode,
    {
      theme: 'github-dark',
      onVisitLine(node: { children: unknown[] }) {
        if (node.children && node.children.length === 0) {
          (node as { children: unknown[] }).children = [{ type: 'text', value: ' ' }];
        }
      },
    },
  ],
  rehypeKatex,
];
