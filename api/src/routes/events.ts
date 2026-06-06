import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const eventsRouter = Router();

// GET /events — list all published upcoming events
eventsRouter.get('/', async (_req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true },
      orderBy: { date: 'asc' },
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        posterKey: true,
        ticketPrice: true,
        totalTickets: true,
        ticketsSold: true,
      },
    });

    res.json(
      events.map((e) => ({
        ...e,
        ticketsRemaining: e.totalTickets - e.ticketsSold,
        isSoldOut: e.ticketsSold >= e.totalTickets,
      }))
    );
  } catch (err) {
    next(err);
  }
});

// GET /events/:id
eventsRouter.get('/:id', async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        date: true,
        location: true,
        posterKey: true,
        ticketPrice: true,
        totalTickets: true,
        ticketsSold: true,
        isPublished: true,
      },
    });

    if (!event || !event.isPublished) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json({
      ...event,
      ticketsRemaining: event.totalTickets - event.ticketsSold,
      isSoldOut: event.ticketsSold >= event.totalTickets,
    });
  } catch (err) {
    next(err);
  }
});
