import { Router } from 'express';
import { prisma } from '../../lib/prisma';

export const adminOrdersRouter = Router();

// GET /admin/orders/beats — list beat purchases
adminOrdersRouter.get('/beats', async (_req, res, next) => {
  try {
    const orders = await prisma.orderBeat.findMany({
      orderBy: { createdAt: 'desc' },
      include: { beat: true },
    });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});

// GET /admin/orders/tickets — list ticket purchases
adminOrdersRouter.get('/tickets', async (_req, res, next) => {
  try {
    const orders = await prisma.orderTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        tickets: true,
      },
    });

    res.json({ orders });
  } catch (err) {
    next(err);
  }
});
