// ─────────────────────────────────────────────────────────────
// lib/constants.ts  —  CodeLance Constants
// ─────────────────────────────────────────────────────────────

// ── API Routes (matching actual Express backend) ──────────────
export const API_ROUTES = {
  AUTH_ME:          '/api/auth/me',
  AUTH_GOOGLE:      '/api/auth/google',
  AUTH_LOGOUT:      '/api/auth/logout',
  DOCUMENT_LIST:    '/api/document',
  DOCUMENT_UPLOAD:  '/api/document/upload',
  DOCUMENT_STATUS:  (id: string) => `/api/document/status/${id}`,
  DOCUMENT_SUMMARY: (id: string) => `/api/document/summary/${id}`,
  DOCUMENT_DELETE:  (id: string) => `/api/document/${id}`,
  CHAT:             '/api/chat',
  CHAT_HISTORY:     (documentId: string, limit = 20) =>
    `/api/chat/history/${documentId}?limit=${limit}`,
} as const;

// ── Ingestion Status ──────────────────────────────────────────
// The exact status strings the backend uses (Prisma Document.status)
export type DocumentStatus =
  | 'PENDING'
  | 'FETCHING'
  | 'PARSING'
  | 'EMBEDDING'
  | 'READY'
  | 'FAILED';

export const TERMINAL_STATUSES: DocumentStatus[] = ['READY', 'FAILED'];

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING:   'Queued…',
  FETCHING:  'Downloading ZIP…',
  PARSING:   'Parsing files…',
  EMBEDDING: 'Generating embeddings…',
  READY:     'Ready',
  FAILED:    'Failed',
};


export const POLLING_INTERVALS = {
  DOCUMENT_STATUS: 3000, 
} as const;

export const AGENT_TOOL_COLORS: Record<string, string> = {
  search:         'text-blue-400',
  get_function:   'text-purple-400',
  get_file:       'text-emerald-400',
  list_functions: 'text-amber-400',
};


export const LANGUAGE_CHIP_COLORS: Record<string, string> = {
  typescript: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  javascript: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  python:     'bg-green-500/10 text-green-400 border-green-500/20',
  go:         'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  rust:       'bg-orange-500/10 text-orange-400 border-orange-500/20',
  java:       'bg-red-500/10 text-red-400 border-red-500/20',
  markdown:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
};




export const CHAT_HISTORY_LIMIT = 20;


export const GITHUB_URL_PATTERN = /^https:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/;


export const ERROR_MESSAGES = {
  UNAUTHORIZED:    'Please sign in to continue',
  INVALID_URL:     'Enter a valid GitHub URL (e.g. https://github.com/owner/repo)',
  NETWORK_ERROR:   'Network error — please try again',
  SERVER_ERROR:    'Server error — please try again later',
  NOT_READY:       'Repository is still being indexed',
  NOT_FOUND:       'Repository not found',
} as const;


export const AGENT_STEP_COLORS: Record<string, string> = {
  search_codebase:  'text-blue-400',
  get_function:     'text-purple-400',
  get_file:         'text-emerald-400',
  list_functions:   'text-amber-400',
  default:          'text-textMuted'
}


export const AGENT_STEP_LABELS: Record<string, string> = {
  search_codebase:  'Searched codebase for',
  get_function:     'Read function',
  get_file:         'Read file',
  list_functions:   'Listed functions in',
  default:          'Used tool'
}


export const REPO_STATUS_LABELS: Record<string, string> = {
  PENDING:   'Queued…',
  FETCHING:  'Downloading ZIP…',
  PARSING:   'Parsing files…',
  EMBEDDING: 'Generating embeddings…',
  READY:     'Ready',
  FAILED:    'Failed',
}

export const PATTERNS = {
  GITHUB_URL: /^https?:\/\/github\.com\/[\w-]+\/[\w.-]+\/?$/,
}