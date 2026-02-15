import Link from 'next/link';
import { createLeetCodeAction } from '@/app/leetcode/actions';
import { getAllTags, getAllSources } from '@/lib/leetcode.service';
import TipTapEditor from '@/components/editor/TipTapEditor';
import CreatableMultiSelect from '@/components/leetcode/CreatableMultiSelect';
import LeetCodeFormWrapper from '@/components/admin/LeetCodeFormWrapper';
import NewLeetCodeFormLayout from '@/components/admin/NewLeetCodeFormLayout';

const INPUT_CLASS =
  'w-full rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-500';
const LABEL_CLASS = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1';

export default async function NewLeetCodePage() {
  const [tags, sources] = await Promise.all([getAllTags(), getAllSources()]);

  const left = (
    <div className="space-y-4">
      <div>
        <label htmlFor="title" className={LABEL_CLASS}>
          标题
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className={INPUT_CLASS}
          placeholder="题目标题"
        />
      </div>
      <div className="flex flex-col gap-3">
        <label className={LABEL_CLASS}>难度</label>
        <div className="inline-flex p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg w-fit border border-neutral-200 dark:border-neutral-700">
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
        name="sources"
        label="From"
        required
        placeholder="回车添加"
      />
      <CreatableMultiSelect
        options={tags}
        name="tags"
        label="Tags"
        placeholder="回车添加"
      />
      <div>
        <label htmlFor="problemUrl" className={LABEL_CLASS}>
          网址
        </label>
        <input
          id="problemUrl"
          name="problemUrl"
          type="url"
          className={INPUT_CLASS}
          placeholder="https://leetcode.cn/problems/..."
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="independent" value="on" />
        <span className="text-sm text-neutral-700 dark:text-neutral-300">独立完成</span>
      </label>
    </div>
  );

  const right = (
    <div>
      <label className={LABEL_CLASS}>内容</label>
      <TipTapEditor initialJson={null} placeholder="写题解、思路…" />
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-semibold mb-6">新建 LeetCode 笔记</h2>
      <LeetCodeFormWrapper action={createLeetCodeAction}>
        <NewLeetCodeFormLayout left={left} right={right} />
        <div className="flex gap-3 pt-6 mt-6 border-neutral-200 dark:border-neutral-700">
          <button
            type="submit"
            className="rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            保存并发布
          </button>
          <Link
            href="/admin/leetcode"
            className="rounded-lg border border-neutral-300 dark:border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            取消
          </Link>
        </div>
      </LeetCodeFormWrapper>
    </div>
  );
}
