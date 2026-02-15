'use client';

import { useState } from 'react';

export interface MultiSelectProps {
  options: string[];
  defaultValue?: string[];
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  /** 允许输入新值并加入已选（保存时 service 会 upsert） */
  allowCreate?: boolean;
}

export default function MultiSelect({
  options,
  defaultValue = [],
  name,
  label,
  placeholder = '选择或留空',
  required = false,
  allowCreate = true,
}: MultiSelectProps) {
  const [selected, setSelected] = useState<string[]>(defaultValue);
  const [customInput, setCustomInput] = useState('');

  function toggle(value: string) {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  function addCustom() {
    const v = customInput.trim();
    if (v && !selected.includes(v)) {
      setSelected((prev) => [...prev, v]);
      setCustomInput('');
    }
  }

  const allOptions = Array.from(new Set([...options, ...selected])).sort();

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
      <input type="hidden" name={name} value={selected.join(',')} readOnly aria-hidden />
      <div className="flex flex-wrap gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 p-2 min-h-[42px]">
        {allOptions.length === 0 && !allowCreate ? (
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{placeholder}</span>
        ) : (
          allOptions.map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-1.5 cursor-pointer rounded px-2 py-1 text-sm border border-neutral-200 dark:border-neutral-600 hover:bg-neutral-50 dark:hover:bg-neutral-800"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="rounded"
              />
              <span>{opt}</span>
            </label>
          )))}
        {allowCreate && (
          <div className="flex gap-1 items-center">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
              placeholder="输入后回车添加"
              className="rounded px-2 py-1 text-sm border border-neutral-200 dark:border-neutral-600 bg-transparent w-32 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
            <button type="button" onClick={addCustom} className="text-sm text-neutral-600 dark:text-neutral-400 hover:underline">
              添加
            </button>
          </div>
        )}
      </div>
      {required && selected.length === 0 && (
        <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">请至少选择一项</p>
      )}
    </div>
  );
}
