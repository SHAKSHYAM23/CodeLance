import axios from 'axios';
import unzipper from 'unzipper';
import path from 'path';
import logger from '../lib/logger';

export interface FetchedFile {
  fileName: string;
  content: string;
  language: string;
  size: number;
}

const SUPPORTED_EXTENSIONS: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.py': 'python',
  '.go': 'go',
  '.java': 'java',
  '.rs': 'rust',
  '.md': 'markdown',
  '.json': 'json',
  '.prisma': 'prisma',
  '.env.example': 'config',
  '.yml': 'config',
  '.yaml': 'config',
};

const SKIP_DIRS = [
  'node_modules', 'dist', 'build', '.git', 'coverage',
  '__pycache__', '.next', 'vendor', 'target', '.cache',
];

const SKIP_PATTERNS = [
  /\.min\.(js|css)$/,
  /\.lock$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
];

const MAX_FILE_SIZE = 500 * 1024; 

function getLanguage(filePath: string): string | null {
  const ext = path.extname(filePath).toLowerCase();
  return SUPPORTED_EXTENSIONS[ext] || null;
}

function shouldSkip(filePath: string): boolean {
  const parts = filePath.split('/');

  for (const dir of SKIP_DIRS) {
    if (parts.includes(dir)) return true;
  }

  for (const pattern of SKIP_PATTERNS) {
    if (pattern.test(filePath)) return true;
  }

  return false;
}

function isMinified(content: string): boolean {
  const lines = content.split('\n');
  if (lines.length < 5) return false;
  const avgLineLength = content.length / lines.length;
  return avgLineLength > 300;
}

function parseGithubUrl(githubUrl: string): { owner: string; repo: string } {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    
    if (url.hostname !== 'github.com' || parts.length < 2) {
      throw new Error();
    }

    return { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
  } catch (error) {
    throw new Error(`Invalid GitHub URL: ${githubUrl}`);
  }
}

export async function* fetchRepoFiles(
  githubUrl: string
): AsyncGenerator<FetchedFile> {
  const { owner, repo } = parseGithubUrl(githubUrl);
const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball`;

  logger.info('Fetching repo ZIP', { owner, repo });

  const response = await axios.get(zipUrl, {
    responseType: 'stream',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
    },
    maxRedirects: 5,
  });

  const zip = response.data.pipe(unzipper.Parse({ forceStream: true }));

  // Handle stream disconnect errors
  response.data.on('error', (err: Error) => {
    logger.error('ZIP stream disconnected', { err: err.message });
    zip.destroy(err);
  });

  for await (const entry of zip) {
    const entryPath: string = entry.path;
    const type: string = entry.type;

    if (type === 'Directory') {
      await entry.autodrain();
      continue;
    }


    const filePath = entryPath.split('/').slice(1).join('/');

    if (!filePath || shouldSkip(filePath)) {
      await entry.autodrain();
      continue;
    }

    const language = getLanguage(filePath);
    if (!language) {
      await entry.autodrain();
      continue;
    }

    const chunks: Buffer[] = [];
    let size = 0;
    let tooLarge = false;

    for await (const chunk of entry) {
      size += chunk.length;
      if (size > MAX_FILE_SIZE) {
        tooLarge = true;
        break;
      }
      chunks.push(chunk);
    }

    if (tooLarge) {
      await entry.autodrain();
      logger.debug('Skipping large file', { filePath, size });
      continue;
    }

    const content = Buffer.concat(chunks).toString('utf-8');

    if (isMinified(content)) {
      logger.debug('Skipping minified file', { filePath });
      continue;
    }

    if (content.trim().length === 0) continue;

    logger.debug('Fetched file', { filePath, language, size });

    yield { fileName: filePath, content, language, size };
  }

  logger.info('ZIP fetch complete', { owner, repo });
}