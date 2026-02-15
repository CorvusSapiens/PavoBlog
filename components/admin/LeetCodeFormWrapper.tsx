'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { ActionResult } from '@/app/leetcode/actions';
import type { LeetCodeNoteDto } from '@/lib/leetcode.service';

type FormAction = (formData: FormData) => Promise<ActionResult<LeetCodeNoteDto>>;

interface LeetCodeFormWrapperProps {
  action: FormAction;
  children: React.ReactNode;
  className?: string;
}

export default function LeetCodeFormWrapper({ action, children, className = '' }: LeetCodeFormWrapperProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await action(formData);
      if (result?.ok) {
        const path = 'redirect' in result && result.redirect ? result.redirect : '/admin/leetcode';
        router.push(path);
      } else if (result && !result.ok) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400 mt-2">{error}</p>
      ) : null}
      {isPending ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">保存中…</p>
      ) : null}
    </form>
  );
}
