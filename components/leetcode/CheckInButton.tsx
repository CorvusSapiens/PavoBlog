'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { checkInLeetCodeAction } from '@/app/leetcode/actions';

interface CheckInButtonProps {
  noteId: string;
  className?: string;
}

export default function CheckInButton({ noteId, className = '' }: CheckInButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await checkInLeetCodeAction(noteId);
      if (result.ok) {
        router.refresh();
      }
    });
  }

  return (
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
  );
}
