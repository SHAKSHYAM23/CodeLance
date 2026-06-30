'use client';

import { useState, useEffect, useCallback } from 'react';
import { getDocumentStatus } from '@/lib/api';
import { POLLING_INTERVALS } from '@/lib/constants';

export type DocumentStatus =
  | 'PENDING'
  | 'FETCHING'
  | 'PARSING'
  | 'EMBEDDING'
  | 'READY'
  | 'FAILED';

export interface Document {
  id:             string;
  name:           string;
  status:         DocumentStatus;
  totalFiles:     number;
  totalChunks:    number;
  embeddedChunks: number;
  progress:       number;
  createdAt:      string;
}

interface UseDocumentsReturn {
  document:  Document | null;
  isLoading: boolean;
  error:     string | null;
  refetch:   () => Promise<void>;
}

export function useDocuments(repoId: string): UseDocumentsReturn {
  const [document, setDocument] = useState<Document | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const fetchDocument = useCallback(async () => {
    if (!repoId) return
    try {
      setError(null)
      const res = await getDocumentStatus(repoId)
      if (res.success && res.document) {
        setDocument(res.document as Document)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch document status')
    } finally {
      setIsLoading(false)
    }
  }, [repoId])

  useEffect(() => {
    if (!repoId) {
      setIsLoading(false)
      return
    }
    fetchDocument()

  
    const interval = setInterval(() => {
      if (
        document?.status &&
        !['READY', 'FAILED'].includes(document.status)
      ) {
        fetchDocument()
      }
    }, POLLING_INTERVALS.DOCUMENT_STATUS)

    return () => clearInterval(interval)
  }, [repoId, fetchDocument])

  return { document, isLoading, error, refetch: fetchDocument }
}