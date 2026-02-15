import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLeetCodeNoteById, getAllTags, getAllSources } from '@/lib/leetcode.service';
import { updateLeetCodeAction } from '@/app/leetcode/actions';
import TipTapEditor from '@/components/editor/TipTapEditor';
import CreatableMultiSelect from '@/components/leetcode/CreatableMultiSelect';
import LeetCodeFormWrapper from '@/components/admin/LeetCodeFormWrapper';

const DIFFICULTIES = [
  { value: 'EASY', label: 'Easy' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HARD', label: 'Hard' },
] as const;

const LABEL_CLASS = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1';

type Props = { params: Promise<{ id: string }> };

export default async function EditLeetCodePage({ params }: Props) {
  const { id } = await params;
  const [note, tags, sources] = await Promise.all([
    getLeetCodeNoteById(id),
    getAllTags(),
    getAllSources(),
  ]);
  if (!note) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">编辑 LeetCode 笔记</h2>
      <LeetCodeFormWrapper action={updateLeetCodeAction} className="space-y-4 max-w-2xl">
        <input type="hidden" name="id" value={note.id} />
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            标题
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={note.title}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
            placeholder="题目标题"
          />
        </div>
        <div className="flex flex-col gap-3">
          <label className={LABEL_CLASS}>难度</label>
          <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit">
            {["EASY", "MEDIUM", "HARD"].map((level) => (
              <label key={level} className="relative">
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  defaultChecked={level === "EASY"}
                  className="peer sr-only"
                />
                <div className="px-4 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-all
                  text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200
                  border border-transparent
                  peer-checked:bg-white peer-checked:text-neutral-900 peer-checked:shadow-sm
                  peer-checked:border-neutral-100 dark:peer-checked:border-neutral-600
                  dark:peer-checked:bg-neutral-700 dark:peer-checked:text-white"
                >
                  {level.charAt(0) + level.slice(1).toLowerCase()}
                </div>
              </label>
            ))}
          </div>
        </div>
        <CreatableMultiSelect
          options={sources}
          defaultValue={note.sources}
          name="sources"
          label="题单来源"
          required
          placeholder="选择或输入后添加"
        />
        <CreatableMultiSelect
          options={tags}
          defaultValue={note.tags}
          name="tags"
          label="标签"
          placeholder="选择或输入后添加"
        />
        <div>
          <label htmlFor="problemUrl" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            网址
          </label>
          <input
            id="problemUrl"
            name="problemUrl"
            type="url"
            defaultValue={note.meta?.problemUrl ?? ''}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500"
            placeholder="https://leetcode.cn/problems/..."
          />
        </div>
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="independent"
              value="on"
              defaultChecked={note.meta?.independent ?? false}
            />
            <span className="text-sm text-neutral-700 dark:text-neutral-300">独立完成</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            内容
          </label>
          <TipTapEditor initialJson={note.content} placeholder="写题解、思路…" />
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            保存
          </button>
          <Link
            href="/admin/leetcode"
            className="rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            取消
          </Link>
          <Link
            href={`/leetcode/${note.slug}`}
            className="rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            查看
          </Link>
        </div>
      </LeetCodeFormWrapper>
    </div>
  );
}
