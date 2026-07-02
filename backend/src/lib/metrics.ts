import { Counter, Histogram, Registry } from 'prom-client';
import { Gauge } from 'prom-client';
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

export const ragasFaithfulness = new Gauge({
  name: 'codeatlas_ragas_faithfulness',
  help: 'Average RAGAS faithfulness score',
  registers: [register],
});

export const ragasRelevancy = new Gauge({
  name: 'codeatlas_ragas_answer_relevancy',
  help: 'Average RAGAS answer relevancy score',
  registers: [register],
});

export const ragasContextPrecision = new Gauge({
  name: 'codeatlas_ragas_context_precision',
  help: 'Average RAGAS context precision score',
  registers: [register],
});

export const ragasOverall = new Gauge({
  name: 'codeatlas_ragas_overall',
  help: 'Average RAGAS overall score',
  registers: [register],
});