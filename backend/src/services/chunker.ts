import { ParsedChunk } from './codeParser';
import logger from '../lib/logger';

export interface ChunkMetadata {
  fileName: string;
  language: string;
  type: 'function' | 'group' | 'overview' | 'section' | 'window' | 'full';
  functionName?: string;
  functions?: string[];
  partIndex: number;
  totalParts: number;
  startLine: number;
  endLine: number;
 
  charCount: number; 
}

export interface DbChunk {
  content: string;
  metadata: ChunkMetadata;
  documentId: string;
}

export function buildChunks(
  parsedChunks: ParsedChunk[],
  fileName: string,
  language: string,
  documentId: string
): DbChunk[] {
  
  const dbChunks = parsedChunks
    .filter(chunk => chunk.content && chunk.content.trim().length > 0)
    .map(chunk => {
     
      const cleanContent = chunk.content.trim();

    
      const enrichedContent = `File: ${fileName}\nLines: ${chunk.startLine}-${chunk.endLine}\n\n${cleanContent}`;

      const metadata: ChunkMetadata = {
        fileName,
        language,
        type: chunk.type,
        partIndex: chunk.partIndex,
        totalParts: chunk.totalParts,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
        charCount: enrichedContent.length,
      };

      if (chunk.functionName) metadata.functionName = chunk.functionName;
      if (chunk.functions)    metadata.functions    = chunk.functions;

      return {
        content: enrichedContent,
        metadata,
        documentId,
      };
    });

  logger.debug('Built chunks for file', {
    fileName,
    language,
    totalChunks: dbChunks.length,
  });

  return dbChunks;
}