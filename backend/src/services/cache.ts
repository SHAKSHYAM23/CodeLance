import { upstash } from '../lib/redis';
import logger from '../lib/logger';
import { AgentResult } from './agent';

const CACHE_TTL = 60 * 60 * 24;


function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

function buildKey(documentId: string, rewrittenQuery: string): string {
  const normalized = normalizeQuery(rewrittenQuery);
  return `chat:${documentId}:${normalized}`;
}

export async function getCache(
  documentId: string,
  rewrittenQuery: string
): Promise<AgentResult | null> {
  try {
    const key = buildKey(documentId, rewrittenQuery);
    const cached = await upstash.get<AgentResult>(key);

    if (cached) {
      logger.debug('Cache hit', { documentId, query: rewrittenQuery });
      return cached;
    }

    logger.debug('Cache miss', { documentId, query: rewrittenQuery });
    return null;
  } catch (err: any) {
   
    logger.warn('Cache get failed', { error: err?.message });
    return null;
  }
}

export async function setCache(
  documentId: string,
  rewrittenQuery: string,
  result: AgentResult
): Promise<void> {
  try {
    const key = buildKey(documentId, rewrittenQuery);
    
  
    await upstash.set(key, result, { ex: CACHE_TTL });
    
 
    const setKey = `doc_cache_keys:${documentId}`;
    await upstash.sadd(setKey, key);
 
    await upstash.expire(setKey, CACHE_TTL);

    logger.debug('Cache set', { documentId, query: rewrittenQuery });
  } catch (err: any) {
    logger.warn('Cache set failed', { error: err?.message });
  }
}

export async function invalidateDocumentCache(
  documentId: string
): Promise<void> {
  try {
    const setKey = `doc_cache_keys:${documentId}`;
    
    // 1. Fetch all cache keys associated with this document
    const keys = await upstash.smembers(setKey);
    
    if (keys.length > 0) {
     
      await upstash.del(...keys, setKey);
      
      logger.info('Document cache invalidated successfully', { 
        documentId, 
        clearedKeys: keys.length 
      });
    } else {
      logger.debug('No cache keys to invalidate', { documentId });
    }
  } catch (err: any) {
    logger.warn('Cache invalidation failed', { error: err?.message });
  }
}