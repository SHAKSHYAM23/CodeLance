import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { embedQuery } from './embedder';
import { rerankRRF, RankedChunk, SearchResult } from './reranker';

const VECTOR_CANDIDATES  = 20;
const KEYWORD_CANDIDATES = 20;
const TOP_K              = 5;

// Alias to maintain naming conventions in the rest of your app
export interface RetrievedChunk extends RankedChunk {}

async function vectorSearch(
  queryVector: number[],
  documentId: string
): Promise<SearchResult[]> {
  const vectorString = `[${queryVector.join(',')}]`;

  const results = await prisma.$queryRaw<any[]>`
    SELECT
      id,
      content,
      metadata,
      1 - (embedding <=> ${vectorString}::vector) AS similarity
    FROM "Chunk"
    WHERE
      "documentId" = ${documentId}
      AND embedding IS NOT NULL
      AND 1 - (embedding <=> ${vectorString}::vector) > 0.3
    ORDER BY embedding <=> ${vectorString}::vector
    LIMIT ${VECTOR_CANDIDATES}
  `;

  return results.map((r) => ({
    id:       r.id,
    content:  r.content,
    metadata: r.metadata,
  }));
}

async function keywordSearch(
  query: string,
  documentId: string
): Promise<SearchResult[]> {
  // If query is empty, bail early
  if (!query || query.trim().length === 0) return [];

  // websearch_to_tsquery handles natural language, punctuation, and syntax errors natively
  const results = await prisma.$queryRaw<any[]>`
    SELECT
      id,
      content,
      metadata,
      ts_rank("contentTsv", websearch_to_tsquery('english', ${query})) AS rank
    FROM "Chunk"
    WHERE
      "documentId" = ${documentId}
      AND "contentTsv" @@ websearch_to_tsquery('english', ${query})
    ORDER BY rank DESC
    LIMIT ${KEYWORD_CANDIDATES}
  `;

  return results.map((r) => ({
    id:       r.id,
    content:  r.content,
    metadata: r.metadata,
  }));
}

async function reassembleMultiPart(
  chunks: RankedChunk[],
  documentId: string
): Promise<RankedChunk[]> {
  const result: RankedChunk[] = [];
  const processedFunctions = new Set<string>();

  for (const chunk of chunks) {
    const meta = chunk.metadata;

    // If this is a multi-part function chunk
    if (
      meta?.totalParts > 1 &&
      meta?.functionName &&
      !processedFunctions.has(`${meta.fileName}:${meta.functionName}`)
    ) {
      processedFunctions.add(`${meta.fileName}:${meta.functionName}`);

      // Fetch all parts ordered by partIndex
      const allParts = await prisma.$queryRaw<any[]>`
        SELECT id, content, metadata
        FROM "Chunk"
        WHERE
          "documentId" = ${documentId}
          AND metadata->>'functionName' = ${meta.functionName}
          AND metadata->>'fileName'     = ${meta.fileName}
        ORDER BY (metadata->>'partIndex')::int ASC
      `;

      if (allParts.length > 0) {
        const joinedContent = allParts.map((p) => p.content).join('\n');
        result.push({
          id:       chunk.id,
          content:  joinedContent,
          metadata: { ...meta, reassembled: true },
          score:    chunk.score,
        });
      } else {
        result.push(chunk);
      }
    } else if (!meta?.functionName || !processedFunctions.has(`${meta.fileName}:${meta.functionName}`)) {
      if (meta?.functionName) {
        processedFunctions.add(`${meta.fileName}:${meta.functionName}`);
      }
      result.push(chunk);
    }
  }

  return result;
}

export async function retrieve(
  query: string,
  documentId: string
): Promise<RetrievedChunk[]> {
  logger.debug('Retrieval started', { query, documentId });

  try {
   
    const queryVector = await embedQuery(query);

    
    const [vectorResults, keywordResults] = await Promise.all([
      vectorSearch(queryVector, documentId),
      keywordSearch(query, documentId),
    ]);

    logger.debug('Search results', {
      vectorCount:  vectorResults.length,
      keywordCount: keywordResults.length,
    });

    
    const reranked = rerankRRF(vectorResults, keywordResults);

  
    const topK = reranked.slice(0, TOP_K);

 
    const final = await reassembleMultiPart(topK, documentId);

    logger.debug('Retrieval complete', { resultCount: final.length });

    return final;
  } catch (err: any) {
    logger.error('Retrieval failed', { query, documentId, error: err?.message });
    throw err;
  }
}

export async function getFunctionByName(
  functionName: string,
  fileName: string,
  documentId: string
): Promise<string | null> {
  const parts = await prisma.$queryRaw<any[]>`
    SELECT content, metadata
    FROM "Chunk"
    WHERE
      "documentId" = ${documentId}
      AND metadata->>'functionName' = ${functionName}
      AND metadata->>'fileName'     = ${fileName}
    ORDER BY (metadata->>'partIndex')::int ASC
  `;

  if (parts.length === 0) return null;
  return parts.map((p) => p.content).join('\n');
}

export async function getFileChunks(
  fileName: string,
  documentId: string
): Promise<string | null> {
  const chunks = await prisma.$queryRaw<any[]>`
    SELECT content, metadata
    FROM "Chunk"
    WHERE
      "documentId" = ${documentId}
      AND metadata->>'fileName' = ${fileName}
    ORDER BY (metadata->>'startLine')::int ASC
  `;

  if (chunks.length === 0) return null;
  return chunks.map((c) => c.content).join('\n');
}

export async function listFileFunctions(
  fileName: string,
  documentId: string
): Promise<{ functionName: string; startLine: number; endLine: number }[]> {
  const chunks = await prisma.$queryRaw<any[]>`
    SELECT metadata
    FROM "Chunk"
    WHERE
      "documentId" = ${documentId}
      AND metadata->>'fileName' = ${fileName}
      AND metadata->>'functionName' IS NOT NULL
      AND metadata->>'partIndex' = '1'
    ORDER BY (metadata->>'startLine')::int ASC
  `;

  return chunks.map((c) => ({
    functionName: c.metadata.functionName,
    startLine:    parseInt(c.metadata.startLine),
    endLine:      parseInt(c.metadata.endLine),
  }));
}