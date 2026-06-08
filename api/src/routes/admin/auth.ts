import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const adminAuthRouter = Router();

// Rate limiter: max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

adminAuthRouter.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError('Invalid request body', 400);
    }

    const { email, password } = parsed.data;

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    // Always run bcrypt to prevent timing attacks even if user not found
    const passwordHash = admin?.passwordHash ?? '$2b$12$invalidhashtopreventtiming';
    const valid = await bcrypt.compare(password, passwordHash);

    if (!admin || !valid) {
      throw createError('Invalid credentials', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const token = jwt.sign(
      { sub: admin.id, email: admin.email },
      secret,
      { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as jwt.SignOptions['expiresIn'] }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});
