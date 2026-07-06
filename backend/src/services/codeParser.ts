import logger from '../lib/logger';

export interface ParsedChunk {
  content: string;
  type: 'function' | 'group' | 'overview' | 'section' | 'window' | 'full';
  functionName?: string;
  functions?: string[];
  startLine: number;
  endLine: number;
  partIndex: number;
  totalParts: number;
}

interface FunctionBoundary {
  name: string;
  startLine: number;
  endLine: number;
  content: string;
}

const FUNCTION_PATTERNS: Record<string, RegExp[]> = {
  typescript: [
    /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[(<]/m,
    /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/m,
    /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/m, // Improved Arrow Fn
    /^\s+(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*\w+)?\s*\{/m,
    /^(?:export\s+)?class\s+(\w+)/m,
  ],
  javascript: [
    /^(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[(<]/m,
    /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(/m,
    /^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|\w+)\s*=>/m, // Improved Arrow Fn
    /^\s+(?:async\s+)?(\w+)\s*\([^)]*\)\s*\{/m,
    /^(?:export\s+)?class\s+(\w+)/m,
      /^\w+\.(\w+)\s*=\s*function\s*\w*\s*\(/m, 
  ],
  python: [
    /^(?:async\s+)?def\s+(\w+)\s*\([^)]*\)\s*(?:->\s*[^:]+)?\s*:/m, // Improved with Type Hints
    /^class\s+(\w+)/m,
  ],
  go: [
    /^func\s+(?:\(\w+\s+\*?\w+\)\s+)?(\w+)\s*\(/m,
  ],
  java: [
    /^(?:public|private|protected|static|\s)+[\w<>\[\]]+\s+(\w+)\s*\([^)]*\)\s*(?:throws\s+\w+\s*)?\{/m,
    /^(?:public|private|protected)?\s*class\s+(\w+)/m,
  ],
  rust: [
    /^(?:pub\s+)?(?:async\s+)?fn\s+(\w+)\s*[(<]/m,
    /^(?:pub\s+)?struct\s+(\w+)/m,
    /^(?:pub\s+)?impl\s+(\w+)/m,
  ],
};

const CHUNK_SIZE = 80;
const OVERLAP = 15;
const SMALL_FN_THRESHOLD = 10;
const LARGE_FN_THRESHOLD = 80;
const GROUP_SIZE = 4;
const OVERVIEW_LINES = 25;

function getLines(content: string): string[] {
  return content.split('\n');
}

function extractOverview(lines: string[]): ParsedChunk {
  const end = Math.min(OVERVIEW_LINES, lines.length) - 1;
  return {
    content: lines.slice(0, end + 1).join('\n'),
    type: 'overview',
    startLine: 1,
    endLine: end + 1,
    partIndex: 1,
    totalParts: 1,
  };
}

function detectFunctions(
  lines: string[],
  language: string
): FunctionBoundary[] {
  const patterns = FUNCTION_PATTERNS[language];
  if (!patterns) return [];

  const boundaries: FunctionBoundary[] = [];
  const openFunctions: { name: string; startLine: number; depth: number }[] = [];

  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line starts a new function
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        const name = match[1] || match[2] || 'anonymous';
        openFunctions.push({ name, startLine: i, depth: braceDepth });
        break;
      }
    }

  
    const cleanLine = line
      .replace(/(["'`]).*?(?<!\\)\1/g, '') 
      .replace(/\/\/.*$/, ''); 


    for (const char of cleanLine) {
      if (char === '{') braceDepth++;
      if (char === '}') {
        braceDepth--;
        
        for (let j = openFunctions.length - 1; j >= 0; j--) {
          if (braceDepth === openFunctions[j].depth) {
            const fn = openFunctions.splice(j, 1)[0];
            boundaries.push({
              name: fn.name,
              startLine: fn.startLine,
              endLine: i,
              content: lines.slice(fn.startLine, i + 1).join('\n'),
            });
            break;
          }
        }
      }
    }
  }

  return boundaries;
}

function detectPythonFunctions(lines: string[]): FunctionBoundary[] {
  const boundaries: FunctionBoundary[] = [];
  const stack: { name: string; startLine: number; indent: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\s*)(?:async\s+)?(?:def|class)\s+(\w+)/);

    if (match) {
      const indent = match[1].length;
      const name = match[2];

      // Close any functions at same or deeper indent
      for (let j = stack.length - 1; j >= 0; j--) {
        if (stack[j].indent >= indent) {
          const fn = stack.splice(j, 1)[0];
          boundaries.push({
            name: fn.name,
            startLine: fn.startLine,
            endLine: i - 1,
            content: lines.slice(fn.startLine, i).join('\n'),
          });
        }
      }

      stack.push({ name, startLine: i, indent });
    }
  }


  for (const fn of stack) {
    boundaries.push({
      name: fn.name,
      startLine: fn.startLine,
      endLine: lines.length - 1,
      content: lines.slice(fn.startLine).join('\n'),
    });
  }

  return boundaries;
}

function splitLargeFunction(
  fn: FunctionBoundary,
  lines: string[]
): ParsedChunk[] {
  const fnLines = lines.slice(fn.startLine, fn.endLine + 1);
  const parts: ParsedChunk[] = [];
  let partIndex = 1;
  let start = 0;

  while (start < fnLines.length) {
    const end = Math.min(start + CHUNK_SIZE, fnLines.length);
    const partContent = fnLines.slice(start, end).join('\n');

    parts.push({
      content: partContent,
      type: 'function',
      functionName: fn.name,
      startLine: fn.startLine + start + 1,
      endLine: fn.startLine + end,
      partIndex,
      totalParts: 0,
    });

    partIndex++;
    start += CHUNK_SIZE - OVERLAP;
    if (start >= fnLines.length) break;
  }

  const totalParts = parts.length;
  return parts.map((p) => ({ ...p, totalParts }));
}

function groupSmallFunctions(fns: FunctionBoundary[]): ParsedChunk[] {
  const groups: ParsedChunk[] = [];

  for (let i = 0; i < fns.length; i += GROUP_SIZE) {
    const group = fns.slice(i, i + GROUP_SIZE);
    const content = group.map((f) => f.content).join('\n\n');
    const functionNames = group.map((f) => f.name);

    groups.push({
      content,
      type: 'group',
      functions: functionNames,
      startLine: group[0].startLine + 1,
      endLine: group[group.length - 1].endLine, 
      partIndex: 1,
      totalParts: 1,
    });
  }

  return groups;
}

function slidingWindowChunks(
  lines: string[],
  windowSize = 80,
  overlap = 20
): ParsedChunk[] {
  const chunks: ParsedChunk[] = [];
  let start = 0;

  while (start < lines.length) {
    const end = Math.min(start + windowSize, lines.length);
    chunks.push({
      content: lines.slice(start, end).join('\n'),
      type: 'window',
      startLine: start + 1,
      endLine: end,
      partIndex: chunks.length + 1,
      totalParts: 0,
    });
    start += windowSize - overlap;
    if (start >= lines.length) break;
  }

  const total = chunks.length;
  return chunks.map((c) => ({ ...c, totalParts: total }));
}

function parseMarkdown(lines: string[]): ParsedChunk[] {
  const chunks: ParsedChunk[] = [];
  let sectionStart = 0;
  let sectionTitle = 'intro';

  for (let i = 1; i < lines.length; i++) {
    // Check for any H1-H6 header
    if (/^#{1,6}\s+/.test(lines[i])) {
      if (i > sectionStart) {
        chunks.push({
          content: lines.slice(sectionStart, i).join('\n'),
          type: 'section',
          functionName: sectionTitle,
          startLine: sectionStart + 1,
          endLine: i,
          partIndex: chunks.length + 1,
          totalParts: 0,
        });
      }
      sectionStart = i;
      sectionTitle = lines[i].replace(/^#+\s*/, '').trim();
    }
  }


  if (sectionStart < lines.length) {
    chunks.push({
      content: lines.slice(sectionStart).join('\n'),
      type: 'section',
      functionName: sectionTitle,
      startLine: sectionStart + 1,
      endLine: lines.length,
      partIndex: chunks.length + 1,
      totalParts: 0,
    });
  }

  const total = chunks.length;
  return chunks.map((c) => ({ ...c, totalParts: total }));
}

export function parseFile(
  content: string,
  language: string,
  fileName: string
): ParsedChunk[] {
  const lines = getLines(content);
  const chunks: ParsedChunk[] = [];

  try {

    if (language === 'markdown') {
      return parseMarkdown(lines);
    }

 
    if (['json', 'config', 'prisma'].includes(language)) {
      if (content.length < 100 * 1024) {
        return [{
          content,
          type: 'full',
          startLine: 1,
          endLine: lines.length,
          partIndex: 1,
          totalParts: 1,
        }];
      }
      return slidingWindowChunks(lines);
    }

  
    chunks.push(extractOverview(lines));

    // Detect functions
    let functions: FunctionBoundary[] = [];

    if (language === 'python') {
      functions = detectPythonFunctions(lines);
    } else if (FUNCTION_PATTERNS[language]) {
      functions = detectFunctions(lines, language);
    }

    if (functions.length === 0) {
     
      const windows = slidingWindowChunks(lines);
      chunks.push(...windows);
      return chunks;
    }

    const smallFns: FunctionBoundary[] = [];

    for (const fn of functions) {
      const lineCount = fn.endLine - fn.startLine + 1;

      if (lineCount >= LARGE_FN_THRESHOLD) {
        // Split into overlapping parts
        const parts = splitLargeFunction(fn, lines);
        chunks.push(...parts);
      } else if (lineCount >= SMALL_FN_THRESHOLD) {
       
        chunks.push({
          content: fn.content,
          type: 'function',
          functionName: fn.name,
          startLine: fn.startLine + 1,
          endLine: fn.endLine + 1,
          partIndex: 1,
          totalParts: 1,
        });
      } else {
       
        smallFns.push(fn);
      }
    }

  
    if (smallFns.length > 0) {
      const groups = groupSmallFunctions(smallFns);
      chunks.push(...groups);
    }

  } catch (err) {
    logger.warn('Parser failed, falling back to sliding window', {
      fileName,
      language,
      err,
    });
    return slidingWindowChunks(lines);
  }

  return chunks;
}