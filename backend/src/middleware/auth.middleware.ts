import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

export interface JwtPayload {
  userId: string;
  email: string;
}


declare module 'express-serve-static-core' {
  interface Request {
    jwtUser?: JwtPayload;
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new AppError('Not authenticated', 401);
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    req.jwtUser = payload;
    
    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);
    next(new AppError('Invalid or expired token', 401));
  }
};