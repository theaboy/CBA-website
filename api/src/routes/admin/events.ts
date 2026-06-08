import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const adminEventsRouter = Router();

const eventBodySchema = z.object({
  name:         z.string().min(1).max(200),
  slug:         z.string().min(1).max(120).optional(),
  description:  z.string().optional(),
  date:         z.string().datetime(),
  venue:        z.string().optional(),
  location:     z.string().min(1),
  ticketPrice:  z.number().min(0),
  totalTickets: z.number().int().min(1),
  isPublished:  z.boolean().default(false),
  posterKey:    z.string().optional(),
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// GET /admin/events — list all events
adminEventsRouter.get('/', async (_req, res, next) => {
  try {
    const events = await prisma.event.findMany({ orderBy: { date: 'asc' } });
    res.json({ events });
  } catch (err) {
    next(err);
  }
});

// POST /admin/events — create event
adminEventsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = eventBodySchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const data = parsed.data;
    const event = await prisma.event.create({
      data: {
        ...data,
        slug: data.slug ?? slugify(data.name),
        date: new Date(data.date),
        ticketPrice: new Prisma.Decimal(data.ticketPrice),
      },
    });

    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
});

// PATCH /admin/events/:id — partial update
adminEventsRouter.patch('/:id', async (req, res, next) => {
  try {
    const parsed = eventBodySchema.partial().safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Event not found', 404);

    const data = parsed.data;
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(data.date !== undefined ? { date: new Date(data.date) } : {}),
        ...(data.ticketPrice !== undefined ? { ticketPrice: new Prisma.Decimal(data.ticketPrice) } : {}),
      },
    });

    res.json({ event });
  } catch (err) {
    next(err);
  }
});

// DELETE /admin/events/:id
adminEventsRouter.delete('/:id', async (req, res, next) => {
  try {
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Event not found', 404);
    if (existing.ticketsSold > 0) throw createError('Cannot delete event with sold tickets', 409);

    await prisma.event.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
