import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AdminPayload, verifyAdminToken } from '../lib/adminJwt';
import { createError } from './errorHandler';

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

    req.admin = verifyAdminToken(authHeader.slice(7).trim());
    next();
  } catch (err) {
    if (err instanceof Error && err.name === 'JsonWebTokenError') {
      next(createError('Unauthorized', 401));
    } else if (err instanceof Error && err.name === 'TokenExpiredError') {
      next(createError('Token expired', 401));
    } else if (err instanceof ZodError) {
      next(createError('Unauthorized', 401));
    } else {
      next(err);
    }
  }
}
