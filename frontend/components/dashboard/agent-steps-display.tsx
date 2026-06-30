'use client';

import React, { useState } from 'react';
import { AgentStep } from '@/hooks/use-chat';

interface AgentStepsDisplayProps {
  steps: AgentStep[];
}

export function AgentStepsDisplay({ steps }: AgentStepsDisplayProps) {
  const [expanded, setExpanded] = useState(false);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="flex justify-start mb-4">
      <div
        className="w-full max-w-md lg:max-w-2xl rounded-lg overflow-hidden"
        style={{
          background: '#0a0f1a',
          border: '1px solid rgba(59,130,246,0.15)',
        }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-4 py-2 text-xs transition-colors"
          style={{ color: '#5a7a9a' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(59,130,246,0.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
            </svg>
            <span>Agent reasoned using {steps.length} tool{steps.length !== 1 ? 's' : ''}</span>
          </div>
          <svg
            width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3a5a78" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {expanded && (
          <div className="p-2.5 space-y-1.5" style={{ borderTop: '1px solid rgba(59,130,246,0.1)' }}>
            {steps.map((step, idx) => {
              const inputDisplay = typeof step.input === 'string'
                ? step.input
                : JSON.stringify(step.input);

              return (
                <div
                  key={idx}
                  className="p-2.5 rounded-md"
                  style={{ background: '#060a10', border: '1px solid rgba(59,130,246,0.1)' }}
                >
                  <div
                    className="text-xs font-mono font-bold mb-1"
                    style={{ color: '#3b82f6' }}
                  >
                    [{step.tool}]
                  </div>
                  <div
                    className="text-xs font-mono break-all line-clamp-2"
                    style={{ color: '#5a7a9a', lineHeight: 1.4 }}
                    title={inputDisplay}
                  >
                    <span style={{ color: '#9fb3c8' }}>Query:</span> {inputDisplay}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
