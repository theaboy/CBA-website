import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const adminBookingsRouter = Router();

const listQuerySchema = z.object({
  bookingType: z.enum(['STUDIO', 'DJ']).optional(),
});

const updateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
});

// GET /admin/bookings — list all booking requests
adminBookingsRouter.get('/', async (req, res, next) => {
  try {
    const parsed = listQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid query parameters', 400);
    }

    const bookings = await prisma.booking.findMany({
      where: {
        ...(parsed.data.bookingType ? { bookingType: parsed.data.bookingType } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// PUT /admin/bookings/:id — update booking status
adminBookingsRouter.put('/:id', async (req, res, next) => {
  try {
    const parsed = updateBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const existing = await prisma.booking.findUnique({ where: { id: req.params.id } });
    if (!existing) throw createError('Booking not found', 404);

    const booking = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: parsed.data.status },
    });

    res.json({ booking });
  } catch (err) {
    next(err);
  }
});
