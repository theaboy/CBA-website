import { Router } from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { signAdminToken } from '../../lib/adminJwt';
import { createError } from '../../middleware/errorHandler';

export const adminAuthRouter = Router();

const DUMMY_PASSWORD_HASH = '$2b$12$dYg9MSq72ISlreZoCkpN0.c6BnmzDK10o6KnwUlgqqZTsX34oGh9G';

// Rate limiter: max 5 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(256),
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
    const passwordHash = admin?.passwordHash ?? DUMMY_PASSWORD_HASH;
    const valid = await bcrypt.compare(password, passwordHash);

    if (!admin || !valid) {
      throw createError('Invalid credentials', 401);
    }

    const token = signAdminToken({ sub: admin.id, email: admin.email });

    res.json({ token });
  } catch (err) {
    next(err);
  }
});
