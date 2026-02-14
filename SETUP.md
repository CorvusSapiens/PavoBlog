# PavoBlog 项目骨架 · 初始化说明

Next.js (App Router) + TypeScript + Tailwind + MDX 知识管理博客。

## 推荐目录结构

```
PavoBlog/
├── app/                    # App Router 路由与页面
│   ├── layout.tsx          # 根布局 + 导航
│   ├── page.tsx            # 首页
│   ├── globals.css         # 全局样式 (Tailwind)
│   ├── articles/           # 文章列表 + 详情
│   │   ├── page.tsx        # 文章列表（按 leetcode/books）
│   │   └── [...path]/      # 文章详情（动态 slug）
│   ├── tags/               # 标签
│   │   ├── page.tsx        # 标签云 / 列表
│   │   └── [tag]/page.tsx  # 某标签下的文章
│   ├── search/
│   │   └── page.tsx        # 搜索页
│   └── dashboard/
│       └── page.tsx        # 统计 Dashboard
├── content/                # MDX 内容（按分类分文件夹）
│   ├── leetcode/           # 题解等
│   └── books/              # 读书笔记等
├── lib/                    # 构建期逻辑：解析、标签、索引、统计
│   ├── types.ts            # 类型定义
│   ├── parser.ts           # MDX 解析、frontmatter、路径收集
│   ├── tags.ts             # #Tag 提取、标签聚合
│   ├── search-index.ts     # 搜索索引生成
│   ├── stats.ts            # Dashboard 统计聚合
│   └── index.ts            # 统一导出
├── components/             # 可选：公共组件
├── public/
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
└── rules                   # 项目规则
```

## 需要安装的依赖列表

### 生产依赖 (dependencies)

| 包名 | 用途 |
|------|------|
| `next` | Next.js 框架 (App Router) |
| `react` / `react-dom` | React |
| `gray-matter` | 解析 frontmatter |
| `@next/mdx` | Next 与 MDX 集成 |
| `@mdx-js/loader` | MDX 编译 |
| `@mdx-js/react` | MDX React 运行时 |
| `remark-gfm` | GFM 支持（表格等） |
| `rehype-highlight` | 代码高亮（可后续换 shiki） |
| `rehype-slug` | 标题 id |
| `rehype-autolink-headings` | 标题锚点 |
| `rehype-pretty-code` | 代码块 Shiki 高亮（构建期） |
| `shiki` | 代码高亮引擎 |
| `remark-math` | 数学公式解析 |
| `rehype-katex` | KaTeX 数学公式渲染 |
| `katex` | KaTeX 样式与字体 |
| `next-mdx-remote` | 服务端 MDX 编译（RSC） |

### 开发依赖 (devDependencies)

| 包名 | 用途 |
|------|------|
| `typescript` | TS |
| `@types/node` / `@types/react` / `@types/react-dom` | 类型 |
| `tailwindcss` | Tailwind |
| `postcss` / `autoprefixer` | PostCSS |
| `eslint` / `eslint-config-next` | 规范 |
| `vitest` | 单测 |

## 初始化命令

```bash
# 1. 进入项目目录
cd /path/to/PavoBlog

# 2. 安装依赖（若已有 package.json）
npm install

# 或从零创建项目并安装（二选一）
# npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
# 然后再按上面 package.json 补装 gray-matter、@next/mdx、@mdx-js/*、remark-gfm、rehype-*、shiki、vitest 等

# 3. 开发
npm run dev

# 4. 构建
npm run build

# 5. 测试
npm run test
```

## 从零创建时的推荐一键命令

若当前目录为空、且希望用官方脚手架再补全本骨架，可：

```bash
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias="@/*"
npm install gray-matter @next/mdx @mdx-js/loader @mdx-js/react remark-gfm rehype-highlight rehype-slug rehype-autolink-headings shiki
npm install -D vitest
```

然后按本仓库的目录结构创建 `content/`、`lib/` 及 `app` 下各路由（或直接使用本骨架）。

## Step2: MDX 渲染配置（已实现）

- **数学公式**：`remark-math` + `rehype-katex`，行内 `$...$`、块级 `$$...$$`；根布局引入 `katex/dist/katex.min.css`。
- **代码高亮**：`rehype-pretty-code`（Shiki），构建期/服务端渲染，主题 `github-dark`；样式见 `app/globals.css` 中 `[data-rehype-pretty-code-figure]`。
- **TOC**：`lib/toc.ts` 从正文 headings 提取目录；文章详情页右侧展示，id 与 `rehype-slug` 一致便于锚点跳转。
- **文章详情**：`next-mdx-remote/rsc` 的 `MDXRemote` 接收 `source` + `mdxOptions`（remark/rehype 插件在 `lib/mdx-config.ts`）；`getArticleBySlug` 读文件并解析 meta。
- **示例 MDX**：`content/leetcode/example.mdx` 含 frontmatter、标题、数学公式、代码块，可直接访问 `/articles/leetcode/example` 查看。

## 约定摘要

- **content**：MDX 放在 `content/leetcode/`、`content/books/` 下，路径即 slug（如 `leetcode/example`）。
- **标签**：正文中写 `#Tag`，由 `lib/tags.ts` 提取，无需在 frontmatter 手写 `tags`。
- **构建期**：文章索引、tag 索引、search 索引、Dashboard 统计均在构建期由 `lib/` 生成，优先 SSG + Server Components。
