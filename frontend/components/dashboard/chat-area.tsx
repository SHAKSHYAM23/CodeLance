'use client';

import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '@/hooks/use-chat';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { AgentStepsDisplay } from './agent-steps-display';

interface ChatAreaProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  isStreaming?: boolean;
  error?: string | null;
  onSendMessage: (message: string) => Promise<void>;
  repoSummary?: string | null;    
  repoName?: string;              
}

export function ChatArea({
  messages,
  isLoading = false,
  isStreaming = false,
  error,
  onSendMessage,
  repoSummary = null,
  repoName,
}: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;
    setInputValue('');
    await onSendMessage(content);
  };

  return (
    <div className="flex flex-col h-full min-h-0" style={{ background: '#060a10' }}>

      <div
        className="flex-1 overflow-y-auto p-6"
        style={{ scrollbarWidth: 'thin' }}
      >
        {repoSummary && (
          <div className="mb-3" style={{ maxWidth: '820px', margin: '0 auto 12px auto' }}>
            <div
              className="rounded-lg p-3.5"
              style={{
                background: '#0a0f1a',
                border: '1px solid rgba(59,130,246,0.18)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
                <span
                  className="text-xs font-semibold uppercase"
                  style={{ color: '#3b82f6', letterSpacing: '0.06em' }}
                >
                  {repoName ? `Summary — ${repoName}` : 'Repository Summary'}
                </span>
              </div>
              <p className="text-sm" style={{ color: '#9fb3c8', lineHeight: 1.55 }}>
                {repoSummary}
              </p>
              {messages.length === 0 && (
                <p className="text-xs mt-2" style={{ color: '#2a4560' }}>
                  Generated while indexing continues in the background — ask anything below
                </p>
              )}
            </div>
          </div>
        )}

        {messages.length === 0 && !isLoading && !repoSummary && (
         
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div
              className="flex items-center justify-center rounded-2xl mb-5"
              style={{
                width: '56px',
                height: '56px',
                background: 'rgba(59,130,246,0.08)',
                border: '1px solid rgba(59,130,246,0.18)',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#c8d8f0' }}>
              Ask anything about this codebase
            </p>
         
          </div>
        )}

        {isLoading && messages.length === 0 && (
          /* TODO: replace with your original loading-state markup if it differs */
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-2">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: 'bounce1 1.2s infinite' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: 'bounce2 1.2s infinite' }} />
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', animation: 'bounce3 1.2s infinite' }} />
            </div>
          </div>
        )}

        {messages.length > 0 && (
          <div className="space-y-3" style={{ maxWidth: '820px', margin: '0 auto' }}>
            {messages.map((message) => (
              <React.Fragment key={message.id}>
                <MessageBubble message={message} />
                {message.agentSteps && message.agentSteps.length > 0 && (
                  <AgentStepsDisplay steps={message.agentSteps} />
                )}
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {error && (
        <div
          className="mx-6 mb-4 flex items-start gap-2 p-3 rounded-lg text-sm"
          style={{
            background: 'rgba(239,68,68,0.06)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171',
            maxWidth: '820px',
            marginLeft: 'auto',
            marginRight: 'auto',
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

      <div
        style={{
          borderTop: '1px solid rgba(59,130,246,0.1)',
          background: '#0a0f1a',
          padding: '20px 24px',
        }}
      >
        <div style={{ maxWidth: '820px', margin: '0 auto' }}>
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
            placeholder="Ask about the codebase..."
          />
        </div>
      </div>

      <style>{`
        @keyframes bounce1 { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
        @keyframes bounce2 { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
        @keyframes bounce3 { 0%, 80%, 100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-6px); opacity: 1; } }
        @keyframes bounce2 { animation-delay: 0.15s; }
        @keyframes bounce3 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
}
