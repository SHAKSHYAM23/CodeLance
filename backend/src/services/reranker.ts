export interface SearchResult {
  id: string;
  content: string;
  metadata: any;
}

export interface RankedChunk extends SearchResult {
  score: number;
}

const RRF_K = 60;

export function rerankRRF(
  vectorResults: SearchResult[],
  keywordResults: SearchResult[]
): RankedChunk[] {
  const scores = new Map<string, number>();
  const chunkMap = new Map<string, SearchResult>();


  const process = (results: SearchResult[]) => {
    results.forEach((chunk, index) => {
      const score = 1 / (RRF_K + index + 1);
      scores.set(chunk.id, (scores.get(chunk.id) || 0) + score);
      
     
      if (!chunkMap.has(chunk.id)) {
        chunkMap.set(chunk.id, chunk);
      }
    });
  };

  process(vectorResults);
  process(keywordResults);

 
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, score]) => ({
      ...chunkMap.get(id)!,
      score,
    }));
}