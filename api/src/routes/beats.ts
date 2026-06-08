import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export const beatsRouter = Router();

const listQuerySchema = z.object({
  genre:    z.string().optional(),
  mood:     z.string().optional(),
  bpmMin:   z.coerce.number().int().min(0).optional(),
  bpmMax:   z.coerce.number().int().min(0).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  sort:     z.enum(['latest', 'popular', 'price-low', 'price-high', 'bpm-low', 'bpm-high']).optional(),
  featured: z.enum(['true', 'false']).optional(),
});

beatsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw createError('Invalid query parameters', 400);
    }

    const { genre, mood, bpmMin, bpmMax, priceMin, priceMax, sort, featured } = parsed.data;

    // Build where clause
    const where: Prisma.BeatWhereInput = {
      published: true,
      ...(genre    ? { genre }              : {}),
      ...(mood     ? { mood }               : {}),
      ...(bpmMin !== undefined || bpmMax !== undefined
        ? { bpm: { gte: bpmMin, lte: bpmMax } } : {}),
      ...(priceMin !== undefined || priceMax !== undefined
        ? { priceBasic: { gte: priceMin !== undefined ? new Prisma.Decimal(priceMin) : undefined,
                          lte: priceMax !== undefined ? new Prisma.Decimal(priceMax) : undefined } } : {}),
      ...(featured ? { featured: featured === 'true' } : {}),
    };

    // Build orderBy clause
    type OrderBy = Prisma.BeatOrderByWithRelationInput;
    const orderByMap: Record<string, OrderBy> = {
      'latest':     { createdAt: 'desc' },
      'popular':    { playCount: 'desc' },
      'price-low':  { priceBasic: 'asc' },
      'price-high': { priceBasic: 'desc' },
      'bpm-low':    { bpm: 'asc' },
      'bpm-high':   { bpm: 'desc' },
    };
    const orderBy: OrderBy = orderByMap[sort ?? 'latest'] ?? { createdAt: 'desc' };

    const beats = await prisma.beat.findMany({
      where,
      orderBy,
      // Exclude fullKey from public response — only previewKey is shared here
      // Plan 04 will replace previewKey with a signed URL in this response
      select: {
        id: true, slug: true, title: true, tagline: true, description: true,
        bpm: true, musicalKey: true, genre: true, mood: true,
        priceBasic: true, pricePremium: true, priceExclusive: true,
        previewKey: true, artworkKey: true,
        tags: true, bestFor: true, mixPalette: true,
        featured: true, isExclusiveSold: true, playCount: true, published: true, createdAt: true,
        // fullKey intentionally excluded from public list response
      },
    });

    res.json({ beats });
  } catch (err) {
    next(err);
  }
});

beatsRouter.get('/:id', async (req, res, next) => {
  try {
    const beat = await prisma.beat.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, slug: true, title: true, tagline: true, description: true,
        bpm: true, musicalKey: true, genre: true, mood: true,
        priceBasic: true, pricePremium: true, priceExclusive: true,
        previewKey: true, artworkKey: true,
        tags: true, bestFor: true, mixPalette: true,
        featured: true, isExclusiveSold: true, playCount: true, published: true, createdAt: true,
        // fullKey excluded — only returned after purchase
      },
    });

    if (!beat || !beat.published) throw createError('Beat not found', 404);

    res.json({ beat });
  } catch (err) {
    next(err);
  }
});
