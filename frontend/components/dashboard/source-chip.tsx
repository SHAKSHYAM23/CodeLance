'use client';

import { Source } from '@/hooks/use-chat';

interface SourceChipProps {
  source: Source;
}

export function SourceChip({ source }: SourceChipProps) {
  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs"
      style={{
        background: '#0a0f1a',
        border: '1px solid rgba(59,130,246,0.15)',
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3a5a78" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
      <span
        className="truncate max-w-50"
        style={{ color: '#c8d8f0' }}
        title={source.fileName}
      >
        {source.fileName}
      </span>
      {source.startLine && (
        <span className="font-mono text-[10px]" style={{ color: '#3b82f6' }}>
          L{source.startLine}{source.endLine && source.endLine !== source.startLine ? `-${source.endLine}` : ''}
        </span>
      )}
      {source.functionName && (
        <span className="font-mono text-[10px] ml-1 hidden md:inline" style={{ color: '#f59e0b' }}>
          ƒ({source.functionName})
        </span>
      )}
    </div>
  );
}
