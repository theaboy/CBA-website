import { Router, raw } from 'express';
import { randomUUID } from 'crypto';
import { stripe } from '../../lib/stripe';
import { prisma } from '../../lib/prisma';
import { sendBeatOrderEmail, sendTicketOrderEmail } from '../../lib/emails';
import { fulfillTicketOrder as createTicketOrder } from '../../lib/ticketOrders';

// Derive types from the stripe singleton — avoids fighting Stripe v22's CJS
// namespace wrapping (export = StripeConstructor only exposes type Stripe,
// not the inner Event/Checkout.Session types).
type StripeEvent = ReturnType<typeof stripe.webhooks.constructEvent>;
type CheckoutSession = Extract<StripeEvent, { type: 'checkout.session.completed' }>['data']['object'];
const DOWNLOAD_EXPIRY_DAYS = 7;

export const stripeWebhookRouter = Router();

// IMPORTANT: Stripe requires the raw request body to verify the signature.
// This route must use express.raw() and be registered BEFORE express.json()
// in app.ts (handled by mounting this router with raw middleware inline below).
stripeWebhookRouter.post(
  '/',
  raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      res.status(400).json({ error: 'Missing signature or webhook secret' });
      return;
    }

    let event: StripeEvent;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as CheckoutSession;
      const meta = session.metadata ?? {};

      try {
        if (meta.type === 'beat') {
          await fulfillBeatOrder(session, meta);
        } else if (meta.type === 'ticket') {
          await fulfillTicketOrder(session, meta);
        } else {
          console.warn('Unknown checkout type in metadata:', meta.type);
        }
      } catch (err) {
        // Log the error but still return 200 so Stripe doesn't retry an
        // order that may have partially fulfilled
        console.error('Fulfillment error for session', session.id, err);
      }
    }

    res.json({ received: true });
  }
);

// ─── Beat fulfillment ────────────────────────────────────────────────────────

async function fulfillBeatOrder(
  session: CheckoutSession,
  meta: Record<string, string>
) {
  const { beatId, licenseType, customerName, customerEmail } = meta;

  // Idempotency: skip if order already exists for this Stripe session
  const existing = await prisma.orderBeat.findFirst({
    where: { stripePaymentId: session.payment_intent as string },
  });
  if (existing) return;

  const order = await prisma.$transaction(async (tx) => {
    const downloadExpiry = new Date();
    downloadExpiry.setDate(downloadExpiry.getDate() + DOWNLOAD_EXPIRY_DAYS);

    // If exclusive, mark beat as sold
    if (licenseType === 'EXCLUSIVE') {
      await tx.beat.update({
        where: { id: beatId },
        data: { isExclusiveSold: true },
      });
    }

    return tx.orderBeat.create({
      data: {
        beatId,
        licenseType: licenseType as 'BASIC' | 'PREMIUM' | 'EXCLUSIVE',
        amountPaid: (session.amount_total ?? 0) / 100,
        customerEmail,
        customerName,
        stripePaymentId: session.payment_intent as string,
        downloadKey: randomUUID(),
        downloadExpiry,
      },
      include: { beat: true },
    });
  });

  console.log(`Beat order fulfilled: beat=${beatId} license=${licenseType} email=${customerEmail}`);
  try {
    await sendBeatOrderEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      beatTitle: order.beat.title,
      licenseType: order.licenseType,
      downloadKey: order.downloadKey,
    });
  } catch (err) {
    console.error('Beat confirmation email failed:', err);
  }
}

// ─── Ticket fulfillment ──────────────────────────────────────────────────────

async function fulfillTicketOrder(
  session: CheckoutSession,
  meta: Record<string, string>
) {
  const { eventId, quantity, customerName, customerEmail } = meta;
  const qty = Number(quantity);

  const { order, created } = await createTicketOrder({
    eventId,
    quantity: qty,
    customerEmail,
    customerName,
    amountTotalCents: session.amount_total ?? 0,
    paymentReference: getPaymentReference(session),
  });

  if (!created) return;

  console.log(`Ticket order fulfilled: event=${eventId} qty=${qty} email=${customerEmail}`);
  try {
    await sendTicketOrderEmail({
      to: order.customerEmail,
      customerName: order.customerName,
      eventName: order.event.name,
      eventDate: order.event.date,
      location: order.event.location,
      qrTokens: order.tickets.map((ticket) => ticket.qrToken),
    });
  } catch (err) {
    console.error('Ticket confirmation email failed:', err);
  }
}

function getPaymentReference(session: CheckoutSession): string {
  const paymentIntent = session.payment_intent;
  if (typeof paymentIntent === 'string' && paymentIntent.length > 0) {
    return paymentIntent;
  }

  return session.id;
}
