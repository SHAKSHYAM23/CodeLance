
const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Core fetch wrapper ────────────────────────────────────────
async function req<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',                      // sends the httpOnly JWT cookie
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data as T;
}



export const getMe = () =>
  req<{ success: boolean; user: { id: string; email: string; name: string; avatar?: string; createdAt: string } }>(
    '/api/auth/me'
  );


export const loginWithGoogle = () => {
  window.location.href = `${BASE}/api/auth/google`;
};


export const logout = () =>
  req<{ success: boolean; message: string }>('/api/auth/logout', { method: 'POST' });


export const getDocuments = () =>
  req<{
    success: boolean;
    documents: {
      id: string;
      name: string;
      githubUrl: string;
      status: 'PENDING' | 'FETCHING' | 'PARSING' | 'EMBEDDING' | 'READY' | 'FAILED';
      totalFiles: number;
      totalChunks: number;
      embeddedChunks: number;
      summary?: string;
      createdAt: string;
    }[];
  }>('/api/document');


export const uploadRepo = (githubUrl: string) =>
  req<{ success: boolean; documentId: string; status: string; message: string }>(
    '/api/document/upload',
    { method: 'POST', body: JSON.stringify({ githubUrl }) }
  );

export const getDocumentStatus = (id: string) =>
  req<{
    success: boolean;
    document: {
      id: string;
      name: string;
      status: 'PENDING' | 'FETCHING' | 'PARSING' | 'EMBEDDING' | 'READY' | 'FAILED';
      totalFiles: number;
      totalChunks: number;
      embeddedChunks: number;
      createdAt: string;
      progress: number;          // Math.round(embeddedChunks / totalChunks * 100)
    };
  }>(`/api/document/status/${id}`);


export const getDocumentSummary = (id: string) =>
  req<{
    success: boolean;
    document: { id: string; name: string; summary: string; status: string };
  }>(`/api/document/summary/${id}`);


export const deleteDocument = (id: string) =>
  req<{ success: boolean; message: string }>(`/api/document/${id}`, { method: 'DELETE' });


export const askQuestion = (question: string, documentId: string) =>
  req<{
    success: boolean;
    answer: string;
    sources: {
      fileName: string;
      language?: string;
      functionName?: string;
      startLine?: number;
      endLine?: number;
    }[];
    agentSteps: {
      tool: string;              // "search" | "get_function" | "get_file" | "list_functions"
      input: string | Record<string, unknown>;
      output: string | Record<string, unknown>;
    }[] | null;
    fromCache: boolean;
  }>('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ question, documentId }),
  });


export const getChatHistory = (documentId: string, limit = 20) =>
  req<{
    success: boolean;
    chats: {
      id: string;
      question: string;
      answer: string;
      sources: {
        fileName: string;
        language?: string;
        functionName?: string;
        startLine?: number;
        endLine?: number;
      }[];
      agentSteps: {
        tool: string;
        input: string | Record<string, unknown>;
        output: string | Record<string, unknown>;
      }[] | null;
      fromCache: boolean;
      createdAt: string;
    }[];
  }>(`/api/chat/history/${documentId}?limit=${limit}`);



export const getIngestionStatus = getDocumentStatus