import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { healthRouter }          from './routes/health';
import { beatsRouter }           from './routes/beats';
import { eventsRouter }          from './routes/events';
import { downloadsRouter }       from './routes/downloads';
import { adminAuthRouter }       from './routes/admin/auth';
import { adminBeatsRouter }      from './routes/admin/beats';
import { adminEventsRouter }     from './routes/admin/events';
import { adminTicketsRouter }    from './routes/admin/tickets';
import { checkoutBeatsRouter }   from './routes/checkout/beats';
import { checkoutTicketsRouter } from './routes/checkout/tickets';
import { stripeWebhookRouter }   from './routes/webhooks/stripe';
import { requireAuth }           from './middleware/auth';
import { errorHandler }          from './middleware/errorHandler';

const app = express();

// Trust proxy headers — required for correct IP detection on Railway/Render
// and for rate limiter to work correctly with X-Forwarded-For in tests
app.set('trust proxy', true);

app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,
}));

// Stripe webhook MUST be mounted before express.json() so it receives the
// raw body needed for signature verification. The route applies its own
// raw() middleware internally.
app.use('/webhooks/stripe', stripeWebhookRouter);

app.use(express.json());

// Public routes
app.use('/health',    healthRouter);
app.use('/beats',     beatsRouter);
app.use('/events',    eventsRouter);
app.use('/downloads', downloadsRouter);

// Checkout (public — Stripe handles auth)
app.use('/checkout/beats',   checkoutBeatsRouter);
app.use('/checkout/tickets', checkoutTicketsRouter);

// Admin: login is public, resource routes require JWT
app.use('/admin',         adminAuthRouter);
app.use('/admin/beats',   requireAuth, adminBeatsRouter);
app.use('/admin/events',  requireAuth, adminEventsRouter);
app.use('/admin/tickets', requireAuth, adminTicketsRouter);

// 404 fallback
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export default app;
