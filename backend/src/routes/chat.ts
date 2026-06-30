import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';
import { rewriteQuery } from '../services/queryRewriter';
import { runAgent } from '../services/agent';
import { getCache, setCache } from '../services/cache';
import { chatRequests, ragDuration, cacheHits } from '../lib/metrics';

const router = Router();

router.post(
  '/',
  authenticate,
  rateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    const timer = ragDuration.startTimer();

    try {
      const { question, documentId } = req.body;
      const userId = req.jwtUser!.userId;

      if (!question || typeof question !== 'string' || question.trim().length === 0) {
        throw new AppError('question is required', 400);
      }
      if (!documentId || typeof documentId !== 'string') {
        throw new AppError('documentId is required', 400);
      }

      const document = await prisma.document.findFirst({
        where:  { id: documentId, userId },
        select: { id: true, status: true, name: true },
      });

      if (!document) throw new AppError('Document not found', 404);
      if (document.status !== 'READY') {
        throw new AppError(`Document is not ready. Current status: ${document.status}`, 400);
      }

      const recentChats = await prisma.chat.findMany({
        where:   { documentId, userId },
        orderBy: { createdAt: 'desc' },
        take:    3,
        select:  { question: true, answer: true },
      });

      const history = recentChats.reverse().map((c) => ({ question: c.question, answer: c.answer }));

      const rewrittenQuery = await rewriteQuery(question.trim(), history);

      logger.info('Chat request', { userId, documentId, original: question, rewritten: rewrittenQuery });

      const cached = await getCache(documentId, rewrittenQuery);

      if (cached) {
        cacheHits.inc();
        chatRequests.inc({ status: 'cache_hit' });
        timer();

        await prisma.chat.create({
          data: { question: question.trim(), answer: cached.answer, sources: cached.sources as any, agentSteps: cached.agentSteps as any, fromCache: true, documentId, userId },
        });

        res.json({ success: true, answer: cached.answer, sources: cached.sources, agentSteps: cached.agentSteps, fromCache: true });
        return;
      }

      const result = await runAgent(rewrittenQuery, documentId, history);

      await setCache(documentId, rewrittenQuery, result);

      await prisma.chat.create({
        data: { question: question.trim(), answer: result.answer, sources: result.sources as any, agentSteps: result.agentSteps as any, fromCache: false, documentId, userId },
      });

      chatRequests.inc({ status: 'success' });
      timer();

      res.json({ success: true, answer: result.answer, sources: result.sources, agentSteps: result.agentSteps, fromCache: false });

    } catch (err: any) {
      chatRequests.inc({ status: 'error' });
      timer();
      next(err);
    }
  }
);

router.get(
  '/history/:documentId',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const documentId = req.params.documentId as string;
      const userId     = req.jwtUser!.userId;
      const limit      = Math.min(parseInt(req.query.limit as string) || 20, 50);

      const document = await prisma.document.findFirst({
        where:  { id: documentId, userId },
        select: { id: true },
      });

      if (!document) throw new AppError('Document not found', 404);

      const chats = await prisma.chat.findMany({
        where:   { documentId, userId },
        orderBy: { createdAt: 'desc' },
        take:    limit,
        select:  { id: true, question: true, answer: true, sources: true, agentSteps: true, fromCache: true, createdAt: true },
      });

      res.json({ success: true, chats: chats.reverse() });
    } catch (err) {
      next(err);
    }
  }
);

export default router;