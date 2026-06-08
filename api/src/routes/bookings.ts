import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { createError } from '../middleware/errorHandler';

export const bookingsRouter = Router();

const baseBookingSchema = z.object({
  name:  z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  notes: z.string().max(2000).optional(),
});

const studioBookingSchema = baseBookingSchema.extend({
  date:          z.string().datetime(),
  time:          z.string().min(1).max(40).optional(),
  package:       z.string().min(1).max(120).optional(),
  durationHours: z.number().int().min(1).max(24).optional(),
});

const djBookingSchema = baseBookingSchema.extend({
  eventDate: z.string().datetime(),
  eventType: z.string().min(1).max(120).optional(),
  budget:    z.number().min(0).optional(),
  location:  z.string().min(1).max(200).optional(),
});

bookingsRouter.post('/studio', async (req, res, next) => {
  try {
    const parsed = studioBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const data = parsed.data;
    const booking = await prisma.booking.create({
      data: {
        bookingType: 'STUDIO',
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        eventDate: new Date(data.date),
        durationHours: data.durationHours,
        message: data.notes,
        notes: formatNotes([
          ['Requested time', data.time],
          ['Package', data.package],
          ['Notes', data.notes],
        ]),
      },
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
});

bookingsRouter.post('/dj', async (req, res, next) => {
  try {
    const parsed = djBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const data = parsed.data;
    const booking = await prisma.booking.create({
      data: {
        bookingType: 'DJ',
        customerName: data.name,
        customerEmail: data.email,
        customerPhone: data.phone,
        eventDate: new Date(data.eventDate),
        message: data.notes,
        notes: formatNotes([
          ['Event type', data.eventType],
          ['Budget', data.budget !== undefined ? `$${data.budget}` : undefined],
          ['Location', data.location],
          ['Notes', data.notes],
        ]),
      },
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
});

function formatNotes(entries: Array<[string, string | undefined]>) {
  const lines = entries
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([label, value]) => `${label}: ${value}`);

  return lines.length > 0 ? lines.join('\n') : undefined;
}
