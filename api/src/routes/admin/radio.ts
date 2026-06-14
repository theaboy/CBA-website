import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const adminRadioRouter = Router();

const variantSchema = z.enum([
  'portable',
  'wood-square',
  'cassette',
  'mini',
  'car-dash',
  'studio',
  'wood-mesh',
]);

const radioEpisodeBodySchema = z.object({
  slug: z.string().min(1).max(120),
  title: z.string().min(1).max(220),
  source: z.string().min(1).max(160),
  dateLabel: z.string().min(1).max(80),
  duration: z.string().regex(/^\d{1,3}:\d{2}$/),
  type: z.string().min(1).max(80),
  freq: z.string().min(1).max(20),
  variant: variantSchema.default('portable'),
  moods: z.array(z.string().min(1).max(60)).default([]),
  plays: z.number().int().min(0).default(0),
  audioSrc: z.string().min(1).optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});

adminRadioRouter.get('/', async (_req, res, next) => {
  try {
    const episodes = await prisma.radioEpisode.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({ episodes });
  } catch (err) {
    next(err);
  }
});

adminRadioRouter.post('/', async (req, res, next) => {
  try {
    const parsed = radioEpisodeBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const episode = await prisma.$transaction(async (tx) => {
      if (parsed.data.featured) {
        await tx.radioEpisode.updateMany({
          where: { featured: true },
          data: { featured: false },
        });
      }

      return tx.radioEpisode.create({ data: parsed.data });
    });

    res.status(201).json({ episode });
  } catch (err) {
    next(err);
  }
});

adminRadioRouter.patch('/:id', async (req, res, next) => {
  try {
    const parsed = radioEpisodeBodySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const existing = await prisma.radioEpisode.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Radio episode not found', 404);

    const episode = await prisma.$transaction(async (tx) => {
      if (parsed.data.featured) {
        await tx.radioEpisode.updateMany({
          where: { featured: true, NOT: { id: req.params.id } },
          data: { featured: false },
        });
      }

      return tx.radioEpisode.update({
        where: { id: req.params.id },
        data: parsed.data,
      });
    });

    res.json({ episode });
  } catch (err) {
    next(err);
  }
});

adminRadioRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.radioEpisode.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Radio episode not found', 404);

    await prisma.radioEpisode.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
