'use client';

import React, { useState } from 'react';
import { PATTERNS } from '@/lib/constants';

interface AddRepositoryModalProps {
  onClose: () => void;
  onAdd: (url: string) => Promise<void>;
}

export function AddRepositoryModal({
  onClose,
  onAdd,
}: AddRepositoryModalProps) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!url.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    if (!PATTERNS.GITHUB_URL.test(url)) {
      setError('That doesn\'t look like a valid GitHub repository URL');
      return;
    }

    try {
      setIsLoading(true);
      await onAdd(url.trim());
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to add repository — please check the URL and try again';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-2xl max-w-md w-full p-7"
        style={{
          background: '#0a0f1a',
          border: '1px solid rgba(59,130,246,0.15)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: '#ffffff', letterSpacing: '-0.01em' }}>
            Add Repository
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: '#3a5a78' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#f59e0b'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#3a5a78'; }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#c8d8f0' }}>
              GitHub Repository URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); if (error) setError(null); }}
              placeholder="https://github.com/user/repo"
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                background: '#060a10',
                border: error ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(59,130,246,0.18)',
                color: '#ffffff',
                outline: 'none',
              }}
              onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = '#3b82f6'; }}
              onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = error ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.18)'; }}
              disabled={isLoading}
            />
            <p className="mt-2 text-xs" style={{ color: '#3a5a78' }}>
              We&apos;ll fetch and index the entire repository automatically
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(239,68,68,0.06)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: '1px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
              style={{
                border: '1px solid rgba(59,130,246,0.18)',
                color: '#9fb3c8',
                background: 'transparent',
              }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: '#2563eb',
                color: '#ffffff',
                boxShadow: '0 0 16px rgba(37,99,235,0.3)',
              }}
              onMouseEnter={e => { if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = '#3b82f6'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#2563eb'; }}
              disabled={isLoading}
            >
              {isLoading && (
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              )}
              {isLoading ? 'Adding...' : 'Add Repository'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
