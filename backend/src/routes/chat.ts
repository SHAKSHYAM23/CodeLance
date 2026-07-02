import { Router, Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import logger from '../lib/logger';
import { authenticate } from '../middleware/auth.middleware';
import { rateLimiter } from '../middleware/rateLimiter';
import { AppError } from '../middleware/errorHandler';
import { rewriteQuery } from '../services/queryRewriter';
import { runAgent } from '../services/agent';
import { getCache, setCache } from '../services/cache';
import { evaluateRAG } from '../services/evaluator';
import {
  chatRequests,
  ragDuration,
  cacheHits,
  ragasFaithfulness,
  ragasRelevancy,
  ragasContextPrecision,
  ragasOverall,
} from '../lib/metrics';

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
      // if (document.status !== 'READY') {
      //   throw new AppError(`Document is not ready. Current status: ${document.status}`, 400);
      // }

      const recentChats = await prisma.chat.findMany({
        where:   { documentId, userId },
        orderBy: { createdAt: 'desc' },
        take:    3,
        select:  { question: true, answer: true },
      });

      const history = recentChats.reverse().map((c) => ({
        question: c.question,
        answer:   c.answer,
      }));

      // Step 1 — Rewrite query
      const t0 = Date.now();
      const rewrittenQuery = await rewriteQuery(question.trim(), history);
      const t1 = Date.now();

      logger.info('Chat request', {
        userId,
        documentId,
        original:  question,
        rewritten: rewrittenQuery,
      });

      // Step 2 — Check cache
      const cached = await getCache(documentId, rewrittenQuery);
      const t2 = Date.now();

      if (cached) {
        cacheHits.inc();
        chatRequests.inc({ status: 'cache_hit' });
        timer();

        await prisma.chat.create({
          data: {
            question:   question.trim(),
            answer:     cached.answer,
            sources:    cached.sources as any,
            agentSteps: cached.agentSteps as any,
            fromCache:  true,
            documentId,
            userId,
          },
        });

        logger.info('Cache hit', {
          queryRewriteMs: t1 - t0,
          cacheCheckMs:   t2 - t1,
          totalMs:        t2 - t0,
        });

        res.json({
          success:    true,
          answer:     cached.answer,
          sources:    cached.sources,
          agentSteps: cached.agentSteps,
          fromCache:  true,
        });
        return;
      }

      // Step 3 — Run agent
      const result = await runAgent(rewrittenQuery, documentId, history);
      const t3 = Date.now();

      // Pipeline breakdown log
      logger.info('RAG pipeline breakdown', {
        queryRewriteMs: t1 - t0,
        cacheCheckMs:   t2 - t1,
        agentMs:        t3 - t2,
        totalMs:        t3 - t0,
        toolCallCount:  result.agentSteps.length,
        sourceCount:    result.sources.length,
      });

      // Step 4 — Save to cache
      await setCache(documentId, rewrittenQuery, result);

      // Step 5 — Save to DB
      await prisma.chat.create({
        data: {
          question:   question.trim(),
          answer:     result.answer,
          sources:    result.sources as any,
          agentSteps: result.agentSteps as any,
          fromCache:  false,
          documentId,
          userId,
        },
      });

      // Step 6 — Track metrics
      chatRequests.inc({ status: 'success' });
      timer();

      // Step 7 — Send response immediately
      res.json({
        success:    true,
        answer:     result.answer,
        sources:    result.sources,
        agentSteps: result.agentSteps,
        fromCache:  false,
      });

      // Step 8 — RAGAS evaluation fire and forget (after response sent)
      evaluateRAG(question, result.answer, result.sources)
        .then((scores) => {
          ragasFaithfulness.set(scores.faithfulness);
          ragasRelevancy.set(scores.answerRelevancy);
          ragasContextPrecision.set(scores.contextPrecision);
          ragasOverall.set(scores.overall);
        })
        .catch(() => {});

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
        select: {
          id:         true,
          question:   true,
          answer:     true,
          sources:    true,
          agentSteps: true,
          fromCache:  true,
          createdAt:  true,
        },
      });

      res.json({ success: true, chats: chats.reverse() });
    } catch (err) {
      next(err);
    }
  }
);

export default router;