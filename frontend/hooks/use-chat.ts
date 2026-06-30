// ─────────────────────────────────────────────────────────────
// hooks/use-chat.ts  —  CodeAtlas Chat Hook
//
// HOW THE BACKEND WORKS (important):
//   POST /api/chat returns the full answer in ONE response.
//   The agent runs its tool loop server-side (max 5 iterations),
//   then sends back { answer, sources, agentSteps, fromCache }.
//   NO polling needed. NO streaming. Just await the response.
//
//   History: GET /api/chat/history/:documentId
//   Returns chats in desc order — we reverse to show oldest first.
// ─────────────────────────────────────────────────────────────

'use client';

import { useState, useEffect, useCallback } from 'react';
import { askQuestion, getChatHistory } from '@/lib/api';

export interface Source {
  fileName:      string;
  language?:     string;
  functionName?: string;
  startLine?:    number;
  endLine?:      number;
}

export interface AgentStep {
  tool:   string;
  input:  string | Record<string, unknown>;
  output: string | Record<string, unknown>;
}

export interface ChatMessage {
  id:         string;
  question:   string;
  answer:     string;
  sources:    Source[];
  agentSteps: AgentStep[] | null;
  fromCache:  boolean;
  createdAt:  string;
  pending?:   boolean;   // true while waiting for API response
}

interface UseChatReturn {
  messages:       ChatMessage[];
  isLoading:      boolean;      // true while sending a question
  historyLoading: boolean;      // true while fetching past chats
  error:          string | null;
  send:           (question: string) => Promise<void>;
}

export function useChat(documentId: string | null): UseChatReturn {
  const [messages, setMessages]       = useState<ChatMessage[]>([]);
  const [isLoading, setLoading]       = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);

  // Load history whenever the selected document changes
  useEffect(() => {
    if (!documentId) {
      setMessages([]);
      return;
    }

    setMessages([]);
    setHistoryLoading(true);
    setError(null);

    getChatHistory(documentId)
      .then((res) => setMessages(res.chats))   // already in asc order from backend
      .catch(() => setError('Failed to load chat history'))
      .finally(() => setHistoryLoading(false));
  }, [documentId]);

  const send = useCallback(async (question: string) => {
    if (!documentId || !question.trim() || isLoading) return;

    const tempId = `pending-${Date.now()}`;

    // Optimistic UI: show the question immediately with a pending state
    const pendingMsg: ChatMessage = {
      id:         tempId,
      question:   question.trim(),
      answer:     '',
      sources:    [],
      agentSteps: null,
      fromCache:  false,
      createdAt:  new Date().toISOString(),
      pending:    true,
    };

    setMessages((prev) => [...prev, pendingMsg]);
    setLoading(true);
    setError(null);

    try {
  
      const res = await askQuestion(question.trim(), documentId);

      const realMsg: ChatMessage = {
        id:         tempId,
        question:   question.trim(),
        answer:     res.answer,
        sources:    res.sources,
        agentSteps: res.agentSteps,
        fromCache:  res.fromCache,
        createdAt:  new Date().toISOString(),
        pending:    false,
      };

      // Replace the pending message with the real answer
      setMessages((prev) => prev.map((m) => m.id === tempId ? realMsg : m));
    } catch (err: any) {
      // Replace pending with error state
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? { ...m, pending: false, answer: `Error: ${err.message}` }
            : m
        )
      );
      setError(err.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  }, [documentId, isLoading]);

  return { messages, isLoading, historyLoading, error, send };
}
