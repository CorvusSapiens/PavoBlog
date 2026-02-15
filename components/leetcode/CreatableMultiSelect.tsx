'use client';

import React, { useState } from 'react';

export interface CreatableMultiSelectProps {
  options: string[];
  defaultValue?: string[];
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

/** 多选 + 可输入新值（保存时 service 会 upsert），提交值为 JSON 字符串 string[] */
export default function CreatableMultiSelect({
  options,
  defaultValue = [],
  name,
  label,
  placeholder = '选择或输入后添加',
  required = false,
}: CreatableMultiSelectProps) {
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
      {label ? (
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      ) : null}
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(selected)}
        readOnly
        aria-hidden
      />
      <div className="flex flex-wrap gap-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 p-2 min-h-[42px]">
        {allOptions.length === 0 ? (
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
          ))
        )}
        <div className="flex gap-1 items-center">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
            placeholder="输入后回车添加"
            className="rounded px-2 py-1 text-sm border border-neutral-200 dark:border-neutral-600 bg-transparent w-32 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>
      {required && selected.length === 0 ? (
        <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">请至少选择一项</p>
      ) : null}
    </div>
  );
}
