import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { ingestionQueue } from '../queues/ingestion.queue';
import { AppError } from '../middleware/errorHandler';
import { invalidateDocumentCache } from '../services/cache';

const router = Router();

function isValidGithubUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const parts  = parsed.pathname.split('/').filter(Boolean);
    return parsed.hostname === 'github.com' && parts.length >= 2;
  } catch {
    return false;
  }
}

router.post(
  '/upload',
  authenticate,
  rateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { githubUrl } = req.body;
      const userId        = req.jwtUser!.userId;

      if (!githubUrl || typeof githubUrl !== 'string') {
        throw new AppError('githubUrl is required', 400);
      }
      if (!isValidGithubUrl(githubUrl)) {
        throw new AppError('Invalid GitHub URL format', 400);
      }

      const normalizedUrl = githubUrl.trim().replace(/\.git$/, '').replace(/\/$/, '');

      const existing = await prisma.document.findFirst({
        where:  { userId, githubUrl: normalizedUrl, status: { not: 'FAILED' } },
        select: { id: true, status: true },
      });

      if (existing) {
        res.json({ success: true, documentId: existing.id, status: existing.status, message: 'Repository already indexed' });
        return;
      }

      const parts = new URL(normalizedUrl).pathname.split('/').filter(Boolean);
      const name  = `${parts[0]}/${parts[1]}`;

      let document;
      try {
        document = await prisma.document.create({
          data:   { name, githubUrl: normalizedUrl, status: 'PENDING', userId },
          select: { id: true, status: true },
        });
      } catch (dbError: any) {
        if (dbError.code === 'P2002') {
          const raceExisting = await prisma.document.findFirst({
            where:  { userId, githubUrl: normalizedUrl },
            select: { id: true, status: true },
          });
          return res.json({ success: true, documentId: raceExisting?.id, status: raceExisting?.status, message: 'Repository already indexed' });
        }
        throw dbError;
      }

      await ingestionQueue.add(
        `ingest-${document.id}`,
        { documentId: document.id, githubUrl: normalizedUrl, userId },
        { jobId: `ingest-${document.id}` }
      );

      logger.info('Document upload queued', { documentId: document.id, githubUrl: normalizedUrl, userId });

      res.status(201).json({ success: true, documentId: document.id, status: 'PENDING', message: 'Repository queued for ingestion' });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/status/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id     = req.params.id as string;
      const userId = req.jwtUser!.userId;

      const document = await prisma.document.findFirst({
        where:  { id, userId },
        select: { id: true, name: true, status: true, totalFiles: true, totalChunks: true, embeddedChunks: true, createdAt: true },
      });

      if (!document) throw new AppError('Document not found', 404);

      const progress = document.totalChunks > 0
        ? Math.round((document.embeddedChunks / document.totalChunks) * 100)
        : 0;

      res.json({ success: true, document: { ...document, progress } });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/summary/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id     = req.params.id as string;
      const userId = req.jwtUser!.userId;

      const document = await prisma.document.findFirst({
        where:  { id, userId },
        select: { id: true, name: true, summary: true, status: true },
      });

      if (!document) throw new AppError('Document not found', 404);

      // CHANGED: summary now generates early during PARSING -> EMBEDDING
      // transition, well before status reaches READY. We only check that
      // a summary string actually exists yet, not that ingestion is fully done.
      if (!document.summary) {
        throw new AppError('Summary not generated yet — still processing', 400);
      }

      res.json({ success: true, document });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.jwtUser!.userId;

      const documents = await prisma.document.findMany({
        where:   { userId },
        select:  { id: true, name: true, githubUrl: true, status: true, totalFiles: true, totalChunks: true, embeddedChunks: true, summary: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ success: true, documents });
    } catch (err) {
      next(err);
    }
  }
);

router.delete(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id     = req.params.id as string;
      const userId = req.jwtUser!.userId;

      const document = await prisma.document.findFirst({ where: { id, userId } });
      if (!document) throw new AppError('Document not found', 404);

      await invalidateDocumentCache(id);
      await prisma.document.delete({ where: { id } });

      logger.info('Document deleted', { documentId: id, userId });
      res.json({ success: true, message: 'Document deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
