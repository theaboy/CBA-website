import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const adminBeatsRouter = Router();

const beatBodySchema = z.object({
  slug:            z.string().min(1).max(100),
  title:           z.string().min(1).max(200),
  tagline:         z.string().min(1).max(300),
  description:     z.string().min(1),
  bpm:             z.number().int().min(60).max(250),
  musicalKey:      z.string().min(1).max(20),
  genre:           z.string().min(1),
  mood:            z.string().min(1),
  priceBasic:      z.number().min(0),
  pricePremium:    z.number().min(0),
  priceExclusive:  z.number().min(0),
  previewKey:      z.string().min(1),  // Supabase Storage object key
  fullKey:         z.string().min(1),  // Supabase Storage object key
  artworkKey:      z.string().min(1),  // Supabase Storage object key
  tags:            z.array(z.string()).default([]),
  bestFor:         z.array(z.string()).default([]),
  mixPalette:      z.array(z.string()).default([]),
  featured:        z.boolean().default(false),
});

// GET /admin/beats — list all beats including fullKey (admin only)
adminBeatsRouter.get('/', async (_req, res, next) => {
  try {
    const beats = await prisma.beat.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ beats });
  } catch (err) {
    next(err);
  }
});

// POST /admin/beats — create beat
adminBeatsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = beatBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const data = parsed.data;
    const beat = await prisma.beat.create({
      data: {
        ...data,
        priceBasic:     new Prisma.Decimal(data.priceBasic),
        pricePremium:   new Prisma.Decimal(data.pricePremium),
        priceExclusive: new Prisma.Decimal(data.priceExclusive),
      },
    });

    res.status(201).json({ beat });
  } catch (err) {
    next(err);
  }
});

// PUT /admin/beats/:id — full update
adminBeatsRouter.put('/:id', async (req, res, next) => {
  try {
    const parsed = beatBodySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const existing = await prisma.beat.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Beat not found', 404);

    const data = parsed.data;
    const beat = await prisma.beat.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(data.priceBasic     !== undefined ? { priceBasic:     new Prisma.Decimal(data.priceBasic)     } : {}),
        ...(data.pricePremium   !== undefined ? { pricePremium:   new Prisma.Decimal(data.pricePremium)   } : {}),
        ...(data.priceExclusive !== undefined ? { priceExclusive: new Prisma.Decimal(data.priceExclusive) } : {}),
      },
    });

    res.json({ beat });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/beats/:id
adminBeatsRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.beat.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Beat not found', 404);

    await prisma.beat.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
