import { Counter, Histogram, Registry } from 'prom-client';

export const register = new Registry();

export const chatRequests = new Counter({
  name: 'codeatlas_chat_requests_total',
  help: 'Total number of chat requests',
  labelNames: ['status'],
  registers: [register]
});

export const cacheHits = new Counter({
  name: 'codeatlas_cache_hits_total',
  help: 'Total number of Redis cache hits',
  registers: [register]
});

export const ragDuration = new Histogram({
  name: 'codeatlas_rag_duration_seconds',
  help: 'Time taken for full RAG pipeline',
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [register]
});

export const ingestionDuration = new Histogram({
  name: 'codeatlas_ingestion_duration_seconds',
  help: 'Time taken to ingest a repository',
  buckets: [5, 10, 30, 60, 120, 300],
  registers: [register]
});

export const embeddingRequests = new Counter({
  name: 'codeatlas_embedding_requests_total',
  help: 'Total Gemini embedding API calls',
  labelNames: ['status'],
  registers: [register]
});