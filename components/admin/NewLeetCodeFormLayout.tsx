'use client';

import { useState } from 'react';

interface NewLeetCodeFormLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
}

/** 桌面端 grid 两列，移动端 tab 切换（基本信息 | 内容） */
export default function NewLeetCodeFormLayout({ left, right }: NewLeetCodeFormLayoutProps) {
  const [tab, setTab] = useState(0);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 lg:hidden border-b border-neutral-200 dark:border-neutral-700 pb-2">
        <button
          type="button"
          onClick={() => setTab(0)}
          className={`px-3 py-1.5 text-sm rounded ${tab === 0 ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
        >
          基本信息
        </button>
        <button
          type="button"
          onClick={() => setTab(1)}
          className={`px-3 py-1.5 text-sm rounded ${tab === 1 ? 'bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'}`}
        >
          内容
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <div className={tab === 0 ? 'block' : 'hidden lg:block'}>{left}</div>
        <div className={tab === 1 ? 'block' : 'hidden lg:block'}>{right}</div>
      </div>
    </div>
  );
}
