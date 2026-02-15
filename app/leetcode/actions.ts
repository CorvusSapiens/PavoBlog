'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  createLeetCodeNote,
  updateLeetCodeNote,
  deleteLeetCodeNote,
  getLeetCodeNoteBySlug,
  getLeetCodeNoteById,
  checkInLeetCode,
  type LeetCodeNoteDto,
} from '@/lib/leetcode.service';

// ---------- 返回结构 ----------

export type ActionResult<T = LeetCodeNoteDto | null> =
  | { ok: true; data: T; redirect?: string }
  | { ok: false; error: string };

// ---------- Slug ----------

function slugify(title: string): string {
  const s = title
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return s || 'post';
}

async function findAvailableSlug(baseSlug: string, excludePostId?: string): Promise<string> {
  let slug = baseSlug;
  let n = 2;
  for (;;) {
    const existing = await getLeetCodeNoteBySlug(slug);
    if (!existing || existing.id === excludePostId) return slug;
    slug = `${baseSlug}-${n}`;
    n += 1;
  }
}

// ---------- FormData → 普通对象（便于 zod 校验） ----------

function formDataToObject(formData: FormData): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  Array.from(formData.entries()).forEach(([k, v]) => {
    if (v instanceof File) return;
    o[k] = v;
  });
  return o;
}

// ---------- Zod 校验 ----------

const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD']);

const MAX_ARRAY_ITEMS = 20;
const MAX_ITEM_LENGTH = 50;

const itemString = z.string().max(MAX_ITEM_LENGTH, `每项最多 ${MAX_ITEM_LENGTH} 字`);

function parseJsonArray(s: string | null | undefined): string[] {
  try {
    const raw = JSON.parse(s ?? '[]');
    if (!Array.isArray(raw)) throw new Error('须为数组');
    const normalized = (raw as unknown[]).map((x) => String(x).trim()).filter(Boolean);
    return Array.from(new Set(normalized));
  } catch (e) {
    if (e instanceof z.ZodError) throw e;
    throw new Error('须为合法 JSON 数组');
  }
}

/** FormData 中 tags/sources 为 JSON 字符串 → string[]（trim、去重、长度限制） */
const jsonArrayPipe = z.array(itemString).max(MAX_ARRAY_ITEMS, `最多 ${MAX_ARRAY_ITEMS} 项`);

const createSchema = z.object({
  title: z.string().min(1, '标题必填'),
  contentJson: z
    .string()
    .optional()
    .transform((s) => {
      if (!s || (typeof s === 'string' && s.trim() === '')) return {};
      try {
        return JSON.parse(s as string) as Record<string, unknown>;
      } catch {
        throw new Error('contentJson 须为合法 JSON');
      }
    }),
  tags: z.string().optional().default('[]').transform(parseJsonArray).pipe(jsonArrayPipe),
  difficulty: difficultyEnum,
  sources: z
    .string()
    .optional()
    .default('[]')
    .transform(parseJsonArray)
    .pipe(jsonArrayPipe)
    .refine((a) => a.length >= 1, '题单来源至少选一项'),
  independent: z
    .union([z.literal('on'), z.literal('')])
    .optional()
    .transform((v) => v === 'on'),
  problemUrl: z.string().optional().transform((s) => (s?.trim() || null) ?? null),
});

const updateSchema = z.object({
  id: z.string().min(1, 'id 必填'),
  title: z.string().min(1).optional(),
  contentJson: z
    .string()
    .optional()
    .transform((s) => {
      if (s == null) return undefined;
      if (typeof s === 'string' && s.trim() === '') return undefined;
      try {
        return JSON.parse(s as string) as Record<string, unknown>;
      } catch {
        throw new Error('contentJson 须为合法 JSON');
      }
    }),
  tags: z.string().optional().default('[]').transform(parseJsonArray).pipe(jsonArrayPipe),
  difficulty: difficultyEnum.optional(),
  sources: z.string().optional().default('[]').transform(parseJsonArray).pipe(jsonArrayPipe),
  independent: z
    .union([z.literal('on'), z.literal('')])
    .optional()
    .transform((v) => (v === 'on' ? true : v === '' ? false : undefined)),
  problemUrl: z.string().optional().transform((s) => (s?.trim() || null) ?? undefined),
});

const idSchema = z.string().min(1, 'id 必填');

function revalidateLeetCodePaths(): void {
  revalidatePath('/leetcode', 'layout');
  revalidatePath('/admin/leetcode', 'layout');
}

// ---------- Server Actions ----------

export async function createLeetCodeAction(formData: FormData): Promise<ActionResult<LeetCodeNoteDto>> {
  try {
    const raw = formDataToObject(formData);
    const parsed = createSchema.parse(raw);
    const slug = await findAvailableSlug(slugify(parsed.title));

    const note = await createLeetCodeNote({
      title: parsed.title,
      slug,
      content: parsed.contentJson,
      tags: parsed.tags,
      difficulty: parsed.difficulty,
      sources: parsed.sources,
      independent: parsed.independent,
      problemUrl: parsed.problemUrl ?? null,
    });
    revalidateLeetCodePaths();
    return { ok: true, data: note, redirect: `/leetcode/${note.slug}` };
  } catch (e) {
    const message = e instanceof z.ZodError ? e.issues.map((x) => x.message).join('; ') : e instanceof Error ? e.message : '创建失败';
    return { ok: false, error: message };
  }
}

export async function updateLeetCodeAction(formData: FormData): Promise<ActionResult<LeetCodeNoteDto>> {
  try {
    const raw = formDataToObject(formData);
    const parsed = updateSchema.parse(raw);
    const idParsed = parsed.id;

    const existing = await getLeetCodeNoteById(idParsed);
    if (!existing) return { ok: false, error: '笔记不存在' };

    let slug: string | undefined;
    if (parsed.title !== undefined) {
      slug = await findAvailableSlug(slugify(parsed.title), idParsed);
    }

    const note = await updateLeetCodeNote(idParsed, {
      ...(parsed.title !== undefined && { title: parsed.title }),
      ...(slug !== undefined && { slug }),
      ...(parsed.contentJson !== undefined && { content: parsed.contentJson }),
      tags: parsed.tags,
      sources: parsed.sources,
      ...(parsed.difficulty !== undefined && { difficulty: parsed.difficulty }),
      ...(parsed.independent !== undefined && { independent: parsed.independent }),
      ...(parsed.problemUrl !== undefined && { problemUrl: parsed.problemUrl }),
    });

    if (!note) return { ok: false, error: '更新失败' };
    revalidateLeetCodePaths();
    return { ok: true, data: note };
  } catch (e) {
    const message = e instanceof z.ZodError ? e.issues.map((x) => x.message).join('; ') : e instanceof Error ? e.message : '更新失败';
    return { ok: false, error: message };
  }
}

export async function deleteLeetCodeAction(formData: FormData): Promise<ActionResult<boolean>> {
  try {
    const id = formData.get('id');
    const idParsed = idSchema.parse(id);
    const existing = await getLeetCodeNoteById(idParsed);
    if (!existing) return { ok: false, error: '笔记不存在' };

    const deleted = await deleteLeetCodeNote(idParsed);
    if (!deleted) return { ok: false, error: '删除失败' };
    revalidateLeetCodePaths();
    return { ok: true, data: true };
  } catch (e) {
    const message = e instanceof z.ZodError ? e.issues.map((x) => x.message).join('; ') : e instanceof Error ? e.message : '删除失败';
    return { ok: false, error: message };
  }
}

/** 供 form action 使用（返回 void，可安全传给 Client） */
export async function deleteLeetCodeFormAction(formData: FormData): Promise<void> {
  await deleteLeetCodeAction(formData);
}

// ---------- Check-in 限流：同一 postId 短时间重复请求直接拒绝 ----------

const CHECK_IN_COOLDOWN_MS = 15_000; // 15 秒内同一笔记只允许打卡一次
const lastCheckInByPostId = new Map<string, number>();

function isCheckInRateLimited(postId: string): boolean {
  const last = lastCheckInByPostId.get(postId);
  if (last == null) return false;
  return Date.now() - last < CHECK_IN_COOLDOWN_MS;
}

function setCheckInDone(postId: string): void {
  lastCheckInByPostId.set(postId, Date.now());
  // 避免 Map 无限增长：只保留最近 1 分钟内的记录
  const cutoff = Date.now() - 60_000;
  Array.from(lastCheckInByPostId.entries()).forEach(([pid, ts]) => {
    if (ts < cutoff) lastCheckInByPostId.delete(pid);
  });
}

export async function checkInLeetCodeAction(id: string): Promise<ActionResult<LeetCodeNoteDto>> {
  try {
    const idParsed = idSchema.parse(id);
    if (isCheckInRateLimited(idParsed)) {
      return { ok: false, error: '请勿频繁打卡，请稍后再试' };
    }

    const todayISO = new Date().toISOString().slice(0, 10);
    const note = await checkInLeetCode(idParsed, todayISO);
    if (!note) return { ok: false, error: '笔记不存在' };

    setCheckInDone(idParsed);
    revalidateLeetCodePaths();
    return { ok: true, data: note };
  } catch (e) {
    const message = e instanceof z.ZodError ? e.issues.map((x) => x.message).join('; ') : e instanceof Error ? e.message : '打卡失败';
    return { ok: false, error: message };
  }
}
