'use client';

import React from 'react';
import { ChatMessage } from '@/hooks/use-chat';
import { SourceChip } from './source-chip';

interface MessageBubbleProps {
  message: ChatMessage;
}

// Lightweight markdown renderer — handles **bold**, `inline code`, and
// preserves line breaks. Avoids pulling in a full markdown library for
// what the agent actually outputs (bold + code spans, mostly).
function renderFormattedText(text: string): React.ReactNode[] {
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Split on **bold** and `code` simultaneously, keeping delimiters
    const tokens = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);

    const rendered = tokens.map((token, i) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return (
          <strong key={i} style={{ color: '#ffffff', fontWeight: 700 }}>
            {token.slice(2, -2)}
          </strong>
        );
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code
            key={i}
            style={{
              background: 'rgba(245,158,11,0.1)',
              color: '#f59e0b',
              padding: '1px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12.5px',
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      return <React.Fragment key={i}>{token}</React.Fragment>;
    });

    return (
      <React.Fragment key={lineIdx}>
        {rendered}
        {lineIdx < lines.length - 1 && line.trim() !== '' && <br />}
        {lineIdx < lines.length - 1 && line.trim() === '' && (
          <span style={{ display: 'block', height: '6px' }} />
        )}
      </React.Fragment>
    );
  });
}

export function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className="space-y-4">
      {/* User Question Bubble */}
      <div className="flex justify-end mb-4">
        <div
          className="max-w-md lg:max-w-xl px-4 py-3 rounded-lg"
          style={{
            background: '#2563eb',
            color: '#ffffff',
            boxShadow: '0 0 16px rgba(37,99,235,0.15)',
          }}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.question}
          </p>
        </div>
      </div>

      {/* AI Answer Bubble */}
      {(message.answer || message.pending) && (
        <div className="flex justify-start mb-3">
          <div
            className="max-w-md lg:max-w-2xl px-4 py-3 rounded-lg"
            style={{
              background: '#0a0f1a',
              color: '#c8d8f0',
              border: '1px solid rgba(59,130,246,0.15)',
            }}
          >
            {message.pending ? (
              <div className="flex items-center gap-2">
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6', animation: 'mbPulse1 1.2s infinite' }} />
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6', animation: 'mbPulse2 1.2s infinite' }} />
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#3b82f6', animation: 'mbPulse3 1.2s infinite' }} />
                <span className="text-sm" style={{ color: '#5a7a9a' }}>Analyzing codebase...</span>
              </div>
            ) : (
              <p className="text-sm" style={{ lineHeight: 1.55 }}>
                {renderFormattedText(message.answer)}
              </p>
            )}

            {/* Sources */}
            {!message.pending && message.sources && message.sources.length > 0 && (
              <div
                className="mt-2.5 pt-2.5 space-y-1.5"
                style={{ borderTop: '1px solid rgba(59,130,246,0.1)' }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: '#3a5a78', letterSpacing: '0.03em', textTransform: 'uppercase' }}
                >
                  Sources
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {message.sources.map((source, idx) => (
                    <SourceChip key={idx} source={source} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes mbPulse1 { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
        @keyframes mbPulse2 { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
        @keyframes mbPulse3 { 0%, 80%, 100% { opacity: 0.3; } 40% { opacity: 1; } }
        @keyframes mbPulse2 { animation-delay: 0.15s; }
        @keyframes mbPulse3 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
