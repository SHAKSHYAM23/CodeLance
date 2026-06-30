'use client';

import React, { KeyboardEvent } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  placeholder = 'Message...',
}: ChatInputProps) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      onSubmit(value);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 items-end">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={3}
        className="flex-1 px-4 py-3 rounded-lg transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
        style={{
          background: '#060a10',
          border: '1px solid rgba(59,130,246,0.18)',
          color: '#ffffff',
          outline: 'none',
        }}
        onFocus={e => {
          (e.currentTarget as HTMLTextAreaElement).style.borderColor = '#3b82f6';
          (e.currentTarget as HTMLTextAreaElement).style.boxShadow = '0 0 0 3px rgba(59,130,246,0.12)';
        }}
        onBlur={e => {
          (e.currentTarget as HTMLTextAreaElement).style.borderColor = 'rgba(59,130,246,0.18)';
          (e.currentTarget as HTMLTextAreaElement).style.boxShadow = 'none';
        }}
      />
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="px-4 py-3 rounded-lg font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
        style={{
          background: '#2563eb',
          color: '#ffffff',
          boxShadow: (isLoading || !value.trim()) ? 'none' : '0 0 16px rgba(37,99,235,0.3)',
        }}
        onMouseEnter={e => {
          if (!isLoading && value.trim()) (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = '#2563eb';
        }}
        title="Send message (Ctrl+Enter)"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16157624 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4429026 C0.994623095,2.07657855 0.837654326,3.16624348 1.15159189,3.95173045 L3.03521743,10.3927234 C3.03521743,10.5498208 3.19218622,10.7069182 3.50612381,10.7069182 L16.6915026,11.4924051 C16.6915026,11.4924051 17.1624089,11.4924051 17.1624089,12.0353097 C17.1624089,12.5782143 16.6915026,12.4744748 16.6915026,12.4744748 Z" />
        </svg>
      </button>
    </form>
  );
}
