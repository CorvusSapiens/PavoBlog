'use client';

import { useCallback, useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';

export interface TipTapEditorProps {
  /** 初始内容（TipTap JSON），新建时传 null/undefined */
  initialJson?: Record<string, unknown> | null;
  /** 内容变化时回调（仅非 readOnly 时使用） */
  onChange?: (json: Record<string, unknown>) => void;
  /** 只读模式，用于前台展示 */
  readOnly?: boolean;
  /** 占位符文案 */
  placeholder?: string;
  className?: string;
}

const EMPTY_DOC = { type: 'doc', content: [] };

export default function TipTapEditor({
  initialJson = null,
  onChange,
  readOnly = false,
  placeholder = '写点什么…',
  className = '',
}: TipTapEditorProps) {
  const [contentJson, setContentJson] = useState<Record<string, unknown>>(
    () => initialJson ?? EMPTY_DOC
  );

  const onUpdate = useCallback(
    (json: Record<string, unknown>) => {
      setContentJson(json);
      onChange?.(json);
    },
    [onChange]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
    ],
    content: initialJson ?? EMPTY_DOC,
    editable: !readOnly,
    onUpdate: readOnly
      ? undefined
      : ({ editor: ed }) => {
          const next = ed.getJSON() as Record<string, unknown>;
          onUpdate(next);
        },
    editorProps: readOnly
      ? {}
      : {
          attributes: {
            class:
              'min-h-[160px] px-3 py-2 prose prose-sm dark:prose-invert max-w-none focus:outline-none',
          },
        },
  });

  // 当 initialJson 从外部变更时（如切换编辑的笔记）同步到编辑器
  useEffect(() => {
    if (!editor || readOnly) return;
    const next = initialJson ?? EMPTY_DOC;
    const current = editor.getJSON();
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      editor.commands.setContent(next);
      setContentJson(next as Record<string, unknown>);
    }
  }, [editor, readOnly, initialJson]);

  // 只读模式也需同步一次 initialJson 到 state，供可能的展示用
  useEffect(() => {
    if (initialJson != null) setContentJson(initialJson);
  }, [initialJson]);

  if (!editor) {
    return (
      <div className={className || 'min-h-[120px] rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50 animate-pulse'}>
        {!readOnly && (
          <input type="hidden" name="contentJson" value={JSON.stringify(contentJson)} readOnly aria-hidden />
        )}
      </div>
    );
  }

  return (
    <div
      className={
        readOnly
          ? className
          : [className, 'rounded-lg border border-neutral-200 dark:border-neutral-700'].filter(Boolean).join(' ')
      }
    >
      {!readOnly && (
        <input
          type="hidden"
          name="contentJson"
          value={JSON.stringify(contentJson)}
          readOnly
          aria-hidden
        />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
