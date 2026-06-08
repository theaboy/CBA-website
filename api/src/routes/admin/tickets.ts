import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { createError } from '../../middleware/errorHandler';

export const adminTicketsRouter = Router();

const verifyTicketSchema = z.object({
  qrToken: z.string().uuid(),
});

// POST /admin/tickets/verify — check in a ticket by QR token
adminTicketsRouter.post('/verify', async (req, res, next) => {
  try {
    const parsed = verifyTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      throw createError(parsed.error.errors[0]?.message ?? 'Invalid body', 400);
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const existing = await tx.ticket.findUnique({
        where: { qrToken: parsed.data.qrToken },
        include: {
          order: {
            include: { event: true },
          },
        },
      });

      if (!existing) throw createError('Ticket not found', 404);
      if (existing.checkedIn || existing.usedAt) {
        throw createError('Ticket already checked in', 409);
      }

      return tx.ticket.update({
        where: { id: existing.id },
        data: {
          checkedIn: true,
          usedAt: new Date(),
        },
        include: {
          order: {
            include: { event: true },
          },
        },
      });
    });

    res.json({
      ticket: {
        id: ticket.id,
        qrToken: ticket.qrToken,
        checkedIn: ticket.checkedIn,
        usedAt: ticket.usedAt,
      },
      order: {
        id: ticket.order.id,
        customerName: ticket.order.customerName,
        customerEmail: ticket.order.customerEmail,
        quantity: ticket.order.quantity,
      },
      event: {
        id: ticket.order.event.id,
        name: ticket.order.event.name,
        date: ticket.order.event.date,
        location: ticket.order.event.location,
      },
    });
  } catch (err) {
    next(err);
  }
});
