// User & Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
}


export interface Repository {
  id: string;
  name: string;
  url: string;
  language: string;
  totalFiles: number;
  processedFiles: number;
  status: 'idle' | 'ingesting' | 'processing' | 'complete' | 'error';
  ingestionProgress: number; 
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  repositoryId: string;
  filePath: string;
  fileName: string;
  content: string;
  language: string;
  lineCount: number;
  embedding?: number[];
  processedAt?: Date;
  status: 'pending' | 'processing' | 'complete' | 'error';
}

// Chat & Message Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  sources?: DocumentSource[];
  agentSteps?: AgentStep[];
}

export interface DocumentSource {
  documentId: string;
  filePath: string;
  fileName: string;
  lineNumbers?: [number, number];
  content: string;
  relevanceScore?: number;
}

export interface AgentStep {
  id: string;
  type: 'search' | 'retrieve' | 'analyze' | 'synthesize' | 'complete';
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  message: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  userId: string;
  repositoryId: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  title?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}

// Ingestion Types
export interface IngestionJob {
  id: string;
  repositoryId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  filesProcessed: number;
  totalFiles: number;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}
