import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app';

const stripeMocks = vi.hoisted(() => ({
  createSession: vi.fn(),
}));

vi.mock('../../../lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: stripeMocks.createSession,
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  },
}));

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    event: { findUnique: vi.fn() },
  },
}));

function makeEvent(override?: object) {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'CBA Night',
    slug: 'cba-night',
    date: new Date('2026-07-01T02:00:00Z'),
    location: 'Montreal',
    ticketPrice: '25.00',
    totalTickets: 10,
    ticketsSold: 2,
    isPublished: true,
    ...override,
  };
}

function validBody(override?: object) {
  return {
    eventId: '11111111-1111-4111-8111-111111111111',
    quantity: 2,
    customerName: 'Ticket Buyer',
    customerEmail: 'BUYER@EXAMPLE.COM',
    ...override,
  };
}

describe('POST /checkout/tickets', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    stripeMocks.createSession.mockResolvedValue({ url: 'https://checkout.stripe.test/session' });
  });

  it('creates a Stripe Checkout session for available tickets', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.event.findUnique).mockResolvedValue(makeEvent() as any);

    const res = await request(app)
      .post('/checkout/tickets')
      .send(validBody());

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ url: 'https://checkout.stripe.test/session' });
    expect(stripeMocks.createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: 'buyer@example.com',
        metadata: expect.objectContaining({
          type: 'ticket',
          eventId: '11111111-1111-4111-8111-111111111111',
          quantity: '2',
          customerEmail: 'buyer@example.com',
        }),
        cancel_url: expect.stringContaining('/events/cba-night'),
      }),
      expect.objectContaining({ idempotencyKey: expect.stringContaining('ticket-checkout-') })
    );
  });

  it('returns 409 when requested quantity exceeds remaining capacity', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.event.findUnique).mockResolvedValue(makeEvent({ ticketsSold: 9 }) as any);

    const res = await request(app)
      .post('/checkout/tickets')
      .send(validBody({ quantity: 2 }));

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      error: 'Not enough tickets available',
      ticketsRemaining: 1,
    });
    expect(stripeMocks.createSession).not.toHaveBeenCalled();
  });

  it('returns 404 for unpublished events', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.event.findUnique).mockResolvedValue(makeEvent({ isPublished: false }) as any);

    const res = await request(app)
      .post('/checkout/tickets')
      .send(validBody());

    expect(res.status).toBe(404);
    expect(stripeMocks.createSession).not.toHaveBeenCalled();
  });
});
