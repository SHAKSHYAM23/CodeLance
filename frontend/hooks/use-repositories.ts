// ─────────────────────────────────────────────────────────────
// hooks/use-repositories.ts  —  CodeLance Repositories Hook
//
// "Repository" in the UI maps to "Document" in the backend.
// Backend endpoint: /api/document (NOT /api/repositories)
//
// Polling: for any doc that is not READY or FAILED,
//          poll GET /api/document/status/:id every 3 seconds.
// ─────────────────────────────────────────────────────────────

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { getDocuments, uploadRepo, deleteDocument, getDocumentStatus, getDocumentSummary } from '@/lib/api';

export type DocumentStatus = 'PENDING' | 'FETCHING' | 'PARSING' | 'EMBEDDING' | 'READY' | 'FAILED';

export interface Repo {
  id:             string;
  name:           string;
  githubUrl:      string;
  status:         DocumentStatus;
  totalFiles:     number;
  totalChunks:    number;
  embeddedChunks: number;
  summary?:       string;
  createdAt:      string;
  progress:       number;
}

const TERMINAL: DocumentStatus[] = ['READY', 'FAILED'];
const POLL_MS = 3000;

interface UseRepositoriesReturn {
  repos:     Repo[];
  loading:   boolean;
  error:     string | null;
  add:       (githubUrl: string) => Promise<string>;
  remove:    (id: string) => Promise<void>;
  updateRepo:(repo: Repo) => void;
}

export function useRepositories(): UseRepositoriesReturn {
  const [repos, setRepos]     = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});
  // Track which docs already have a summary so we only fetch it once per doc
  const summaryFetched = useRef<Record<string, boolean>>({});

  const startPolling = useCallback((id: string) => {
    if (timers.current[id]) return;

    timers.current[id] = setInterval(async () => {
      try {
        const doc = (await getDocumentStatus(id)).document;

        // Update status/progress IMMEDIATELY — don't let summary fetch block this
        setRepos((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: doc.status, progress: doc.progress,
                  totalChunks: doc.totalChunks, embeddedChunks: doc.embeddedChunks,
                  totalFiles: doc.totalFiles }
              : r
          )
        );

        if (TERMINAL.includes(doc.status)) {
          clearInterval(timers.current[id]);
          delete timers.current[id];
        }

       
        if (!summaryFetched.current[id]) {
          getDocumentSummary(id)
            .then((summaryRes) => {
              if (summaryRes.document.summary) {
                summaryFetched.current[id] = true;
                setRepos((prev) =>
                  prev.map((r) =>
                    r.id === id ? { ...r, summary: summaryRes.document.summary } : r
                  )
                );
              }
            })
            .catch(() => {
             
            });
        }
      } catch {
  
      }
    }, POLL_MS);
  }, []);

  useEffect(() => {
    setLoading(true);
    getDocuments()
      .then((res) => {
        const mapped: Repo[] = res.documents.map((d) => ({
          ...d,
          progress: d.totalChunks > 0
            ? Math.round((d.embeddedChunks / d.totalChunks) * 100)
            : 0,
        }));
        setRepos(mapped);

        mapped.forEach((r) => {
          if (r.summary) summaryFetched.current[r.id] = true;
        });

        mapped.filter((r) => !TERMINAL.includes(r.status)).forEach((r) => startPolling(r.id));
      })
      .catch(() => setError('Failed to load repositories'))
      .finally(() => setLoading(false));

    return () => {
      Object.values(timers.current).forEach(clearInterval);
    };
  }, [startPolling]);

  const add = useCallback(async (githubUrl: string): Promise<string> => {
    const res = await uploadRepo(githubUrl);
    const listRes = await getDocuments();
    const mapped: Repo[] = listRes.documents.map((d) => ({
      ...d,
      progress: d.totalChunks > 0
        ? Math.round((d.embeddedChunks / d.totalChunks) * 100)
        : 0,
    }));
    setRepos(mapped);
    startPolling(res.documentId);
    return res.documentId;
  }, [startPolling]);

  const remove = useCallback(async (id: string) => {
    await deleteDocument(id);
    clearInterval(timers.current[id]);
    delete timers.current[id];
    delete summaryFetched.current[id];
    setRepos((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const updateRepo = useCallback((updated: Repo) => {
    setRepos((prev) => prev.map((r) => r.id === updated.id ? updated : r));
  }, []);

  return { repos, loading, error, add, remove, updateRepo };
}
