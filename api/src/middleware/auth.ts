import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './errorHandler';

export interface AdminPayload {
  sub: string;
  email: string;
}

// Augment Express Request type to carry admin payload
declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw createError('Unauthorized', 401);
    }

    const token = authHeader.slice(7);
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const payload = jwt.verify(token, secret) as AdminPayload;
    req.admin = payload;
    next();
  } catch (err) {
    if (err instanceof Error && err.name === 'JsonWebTokenError') {
      next(createError('Unauthorized', 401));
    } else if (err instanceof Error && err.name === 'TokenExpiredError') {
      next(createError('Token expired', 401));
    } else {
      next(err);
    }
  }
}
