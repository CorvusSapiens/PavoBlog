'use client';

import { useState } from 'react';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { checkInLeetCodeAction } from '@/app/leetcode/actions';

interface CheckInButtonProps {
  noteId: string;
  className?: string;
}

/** 客户端防抖：loading 期间按钮禁用，避免重复提交；服务端另有同 postId 短时限流 */
export default function CheckInButton({ noteId, className = '' }: CheckInButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await checkInLeetCodeAction(noteId);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <span className="flex w-full flex-col gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
      className={
        className ||
        'rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50'
      }
    >
      {isPending ? '打卡中…' : '打卡'}
    </button>
    {error && <span className="text-xs text-red-600 dark:text-red-400">{error}</span>}
    </span>
  );
}
