import type { Prisma } from '@prisma/client';
import { prisma } from './db';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// ---------- DTOs ----------

export interface CreateLeetCodeNoteInput {
  title: string;
  slug: string;
  content: Record<string, unknown>;
  tags: string[];
  difficulty: Difficulty;
  sources: string[];
  independent?: boolean;
  problemUrl?: string | null;
}

export interface UpdateLeetCodeNoteInput {
  title?: string;
  slug?: string;
  content?: Record<string, unknown>;
  tags?: string[];
  difficulty?: Difficulty;
  sources?: string[];
  independent?: boolean;
  problemUrl?: string | null;
}

export type FilterMode = 'and' | 'or';

export interface ListLeetCodeNotesFilters {
  difficulty?: Difficulty;
  tags?: string[];
  tagsMode?: FilterMode;
  sources?: string[];
  sourcesMode?: FilterMode;
}

export interface LeetCodeMetaDto {
  difficulty: Difficulty;
  sources: string[];
  independent: boolean;
  problemUrl: string | null;
}

export interface LeetCodeProgressDto {
  firstDate: string;
  latestDate: string;
  count: number;
}

/** 展示用：首次=发布时间，最新=发布时间或最近打卡日，次数=1+打卡次数 */
export interface LeetCodeDisplayProgress {
  firstDate: string;
  latestDate: string;
  count: number;
}

export interface LeetCodeNoteDto {
  id: string;
  title: string;
  slug: string;
  content: Record<string, unknown>;
  tags: string[];
  sources: string[];
  createdAt: Date;
  updatedAt: Date;
  meta: LeetCodeMetaDto | null;
  progress: LeetCodeProgressDto | null;
  /** 展示用进度（首次/最新/次数），由 createdAt + progress 推导 */
  displayProgress: LeetCodeDisplayProgress;
}

// ---------- Helpers ----------

function normalizeNames(names: string[]): string[] {
  return names.map((s) => s.trim()).filter(Boolean);
}

async function ensureTagIds(names: string[]): Promise<string[]> {
  const normalized = normalizeNames(names);
  if (normalized.length === 0) return [];
  const ids: string[] = [];
  for (const name of normalized) {
    const tag = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    ids.push(tag.id);
  }
  return ids;
}

async function ensureListSourceIds(names: string[]): Promise<string[]> {
  const normalized = normalizeNames(names);
  if (normalized.length === 0) return [];
  const ids: string[] = [];
  for (const name of normalized) {
    const source = await prisma.listSource.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    ids.push(source.id);
  }
  return ids;
}

function toProgressDto(p: { firstDate: Date; latestDate: Date; count: number } | null): LeetCodeProgressDto | null {
  if (!p) return null;
  return {
    firstDate: p.firstDate.toISOString().slice(0, 10),
    latestDate: p.latestDate.toISOString().slice(0, 10),
    count: p.count,
  };
}

type PostRow = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  createdAt: Date;
  updatedAt: Date;
  leetcodeMeta: { difficulty: Difficulty; independent: boolean; problemUrl: string | null } | null;
  leetcodeProgress: { firstDate: Date; latestDate: Date; count: number } | null;
  postTags: { tag: { name: string } }[];
  leetcodeSources: { source: { name: string } }[];
};

function toYMD(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toNoteDto(row: PostRow): LeetCodeNoteDto {
  const tags = row.postTags.map((pt) => pt.tag.name);
  const sources = row.leetcodeSources.map((ls) => ls.source.name);
  const progress = toProgressDto(row.leetcodeProgress);
  const firstDate = toYMD(row.createdAt);
  const displayProgress: LeetCodeDisplayProgress = {
    firstDate,
    latestDate: progress ? progress.latestDate : firstDate,
    count: progress ? 1 + progress.count : 1,
  };
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content as Record<string, unknown>,
    tags,
    sources,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    meta: row.leetcodeMeta
      ? { difficulty: row.leetcodeMeta.difficulty, sources, independent: row.leetcodeMeta.independent, problemUrl: row.leetcodeMeta.problemUrl }
      : null,
    progress,
    displayProgress,
  };
}

const includeLeetCode = {
  leetcodeMeta: true,
  leetcodeProgress: true,
  postTags: { include: { tag: true } },
  leetcodeSources: { include: { source: true } },
} as const;

// ---------- Build list where (tags/sources + mode) ----------

function buildListWhere(filters: ListLeetCodeNotesFilters) {
  const conditions: Array<Record<string, unknown>> = [{ type: 'LEETCODE' }];

  if (filters.difficulty !== undefined) {
    conditions.push({ leetcodeMeta: { difficulty: filters.difficulty } });
  }

  const tags = filters.tags?.length ? normalizeNames(filters.tags) : [];
  const tagsMode = filters.tagsMode ?? 'and';
  if (tags.length > 0) {
    if (tagsMode === 'and') {
      conditions.push(...tags.map((name) => ({ postTags: { some: { tag: { name } } } })));
    } else {
      conditions.push({ postTags: { some: { tag: { name: { in: tags } } } } });
    }
  }

  const sources = filters.sources?.length ? normalizeNames(filters.sources) : [];
  const sourcesMode = filters.sourcesMode ?? 'and';
  if (sources.length > 0) {
    if (sourcesMode === 'and') {
      conditions.push(...sources.map((name) => ({ leetcodeSources: { some: { source: { name } } } })));
    } else {
      conditions.push({ leetcodeSources: { some: { source: { name: { in: sources } } } } });
    }
  }

  return conditions.length === 1 ? conditions[0]! : { AND: conditions };
}

// ---------- Service ----------

export async function createLeetCodeNote(input: CreateLeetCodeNoteInput): Promise<LeetCodeNoteDto> {
  const tagIds = await ensureTagIds(input.tags);
  const sourceIds = await ensureListSourceIds(input.sources);

  const post = await prisma.post.create({
    data: {
      type: 'LEETCODE',
      title: input.title,
      slug: input.slug,
      content: input.content as object,
      postTags: { create: tagIds.map((tagId) => ({ tagId })) },
      leetcodeMeta: {
        create: {
          difficulty: input.difficulty,
          independent: input.independent ?? false,
          problemUrl: input.problemUrl?.trim() || null,
        },
      },
    },
    include: includeLeetCode,
  });

  if (sourceIds.length > 0) {
    await prisma.leetCodeSource.createMany({
      data: sourceIds.map((sourceId) => ({ postId: post.id, sourceId })),
    });
  }

  const full = await prisma.post.findUnique({
    where: { id: post.id },
    include: includeLeetCode,
  });
  return toNoteDto(full!);
}

export async function updateLeetCodeNote(id: string, input: UpdateLeetCodeNoteInput): Promise<LeetCodeNoteDto | null> {
  const existing = await prisma.post.findUnique({
    where: { id, type: 'LEETCODE' },
    include: { leetcodeMeta: true },
  });
  if (!existing) return null;

  const { difficulty, sources, independent, problemUrl, ...postData } = input;
  const metaUpdate =
    difficulty !== undefined || independent !== undefined || problemUrl !== undefined
      ? {
          leetcodeMeta: {
            update: {
              ...(difficulty !== undefined && { difficulty }),
              ...(independent !== undefined && { independent }),
              ...(problemUrl !== undefined && { problemUrl: problemUrl?.trim() || null }),
            },
          },
        }
      : undefined;

  if (postData.tags !== undefined) {
    await prisma.postTag.deleteMany({ where: { postId: id } });
  }
  if (sources !== undefined) {
    await prisma.leetCodeSource.deleteMany({ where: { postId: id } });
  }

  const tagIds = postData.tags !== undefined ? await ensureTagIds(postData.tags) : [];
  const sourceIds = sources !== undefined ? await ensureListSourceIds(sources) : [];

  await prisma.post.update({
    where: { id },
    data: {
      ...(postData.title !== undefined && { title: postData.title }),
      ...(postData.slug !== undefined && { slug: postData.slug }),
      ...(postData.content !== undefined && { content: postData.content as object }),
      ...(tagIds.length > 0 && { postTags: { create: tagIds.map((tagId) => ({ tagId })) } }),
      ...metaUpdate,
    },
  });

  if (sourceIds.length > 0) {
    await prisma.leetCodeSource.createMany({
      data: sourceIds.map((sourceId) => ({ postId: id, sourceId })),
    });
  }

  const full = await prisma.post.findUnique({
    where: { id },
    include: includeLeetCode,
  });
  return toNoteDto(full!);
}

export async function deleteLeetCodeNote(id: string): Promise<boolean> {
  const r = await prisma.post.deleteMany({ where: { id, type: 'LEETCODE' } });
  return r.count > 0;
}

export async function listLeetCodeNotes(filters: ListLeetCodeNotesFilters = {}): Promise<LeetCodeNoteDto[]> {
  const where = buildListWhere(filters);
  const list = await prisma.post.findMany({
    where,
    include: includeLeetCode,
    orderBy: { updatedAt: 'desc' },
  });
  return list.map(toNoteDto);
}

export async function getLeetCodeNoteById(id: string): Promise<LeetCodeNoteDto | null> {
  const post = await prisma.post.findUnique({
    where: { id, type: 'LEETCODE' },
    include: includeLeetCode,
  });
  return post ? toNoteDto(post) : null;
}

export async function getLeetCodeNoteBySlug(slug: string): Promise<LeetCodeNoteDto | null> {
  const post = await prisma.post.findFirst({
    where: { type: 'LEETCODE', slug },
    include: includeLeetCode,
  });
  return post ? toNoteDto(post) : null;
}

/** todayISO: YYYY-MM-DD */
export async function checkInLeetCode(id: string, todayISO: string): Promise<LeetCodeNoteDto | null> {
  const date = new Date(todayISO + 'T00:00:00.000Z');
  const post = await prisma.post.findUnique({
    where: { id, type: 'LEETCODE' },
    include: { leetcodeProgress: true },
  });
  if (!post) return null;

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const progress = await tx.leetCodeProgress.findUnique({ where: { postId: id } });
    if (!progress) {
      await tx.leetCodeProgress.create({
        data: { postId: id, firstDate: date, latestDate: date, count: 1 },
      });
    } else {
      await tx.leetCodeProgress.update({
        where: { postId: id },
        data: { latestDate: date, count: { increment: 1 } },
      });
    }
  });

  return getLeetCodeNoteById(id);
}

export async function listTags(): Promise<{ id: string; name: string }[]> {
  return prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
}

export async function listListSources(): Promise<{ id: string; name: string }[]> {
  return prisma.listSource.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
}

/** 候选项：仅名称，供 admin 多选用 */
export async function getAllTags(): Promise<string[]> {
  const rows = await prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { name: true } });
  return rows.map((row: { name: string }) => row.name);
}

export async function getAllSources(): Promise<string[]> {
  const rows = await prisma.listSource.findMany({ orderBy: { name: 'asc' }, select: { name: true } });
  return rows.map((row: { name: string }) => row.name);
}

// ---------- 列表页 URL 参数（/leetcode、Posts 共用） ----------

export type LeetCodeListParams = {
  tags?: string[];
  sources?: string[];
  mode?: FilterMode;
  difficulty?: Difficulty;
  q?: string;
  sort?: 'updatedAt' | 'createdAt' | 'title';
  order?: 'asc' | 'desc';
};

export function buildLeetCodeListQuery(params: LeetCodeListParams): string {
  const q = new URLSearchParams();
  if (params.tags?.length) q.set('tags', params.tags.join(','));
  if (params.sources?.length) q.set('sources', params.sources.join(','));
  if (params.mode) q.set('mode', params.mode);
  if (params.difficulty) q.set('difficulty', params.difficulty);
  if (params.q?.trim()) q.set('q', params.q.trim());
  if (params.sort) q.set('sort', params.sort);
  if (params.order) q.set('order', params.order);
  const s = q.toString();
  return s ? `?${s}` : '';
}
