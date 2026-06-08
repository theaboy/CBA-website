import { Router } from 'express';
import { z } from 'zod';
import { stripe } from '../../lib/stripe';
import { prisma } from '../../lib/prisma';

export const checkoutTicketsRouter = Router();

const bodySchema = z.object({
  eventId: z.string().uuid(),
  quantity: z.number().int().min(1).max(10),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().trim().toLowerCase().email(),
});

// POST /checkout/tickets
checkoutTicketsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }

    const { eventId, quantity, customerName, customerEmail } = parsed.data;

    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event || !event.isPublished) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const remaining = Math.max(0, event.totalTickets - event.ticketsSold);
    if (remaining < quantity) {
      res.status(409).json({
        error: 'Not enough tickets available',
        ticketsRemaining: remaining,
      });
      return;
    }

    const unitAmount = Math.round(Number(event.ticketPrice) * 100); // cents

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: customerEmail,
        line_items: [
          {
            quantity,
            price_data: {
              currency: 'cad',
              unit_amount: unitAmount,
              product_data: {
                name: `${event.name} — Ticket`,
                description: `${new Date(event.date).toLocaleDateString('fr-CA', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} · ${event.location}`,
              },
            },
          },
        ],
        metadata: {
          type: 'ticket',
          eventId,
          quantity: String(quantity),
          customerName,
          customerEmail,
        },
        success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/events/${event.slug}`,
      },
      {
        idempotencyKey: `ticket-checkout-${eventId}-${quantity}-${customerEmail}-${Date.now()}`,
      }
    );

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});
