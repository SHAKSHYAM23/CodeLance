import { Request, Response, NextFunction } from 'express';
import { upstash } from '../lib/redis';
import { AppError } from './errorHandler';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS   = 20;

export const rateLimiter = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.jwtUser?.userId || req.ip || 'anonymous';
    const key    = `rate:${userId}`;

    const count = await upstash.incr(key);

    if (count === 1) {
      await upstash.expire(key, WINDOW_SECONDS);
    }

    if (count > MAX_REQUESTS) {
      throw new AppError('Too many requests, slow down', 429);
    }

    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next();
  }
};