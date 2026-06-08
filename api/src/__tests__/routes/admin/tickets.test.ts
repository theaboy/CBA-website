import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { signAdminToken } from '../../../lib/adminJwt';

vi.mock('../../../lib/prisma', () => {
  const tx = {
    ticket: {
      findUnique: vi.fn(),
      update:     vi.fn(),
    },
  };

  return {
    prisma: {
      adminUser: { findUnique: vi.fn() },
      $transaction: vi.fn((callback) => callback(tx)),
      ticket: tx.ticket,
    },
  };
});

const QR_TOKEN = '11111111-1111-4111-8111-111111111111';

function authHeader() {
  const token = signAdminToken({ sub: 'admin-uuid', email: 'admin@cba.com' });
  return { Authorization: `Bearer ${token}` };
}

function makeTicket(override?: object) {
  return {
    id: 'ticket-uuid-1',
    qrToken: QR_TOKEN,
    checkedIn: false,
    usedAt: null,
    createdAt: new Date('2026-06-01T00:00:00Z'),
    orderId: 'order-ticket-uuid-1',
    order: {
      id: 'order-ticket-uuid-1',
      customerName: 'Ticket Buyer',
      customerEmail: 'buyer@example.com',
      quantity: 2,
      eventId: 'event-uuid-1',
      amountPaid: '50.00',
      stripePaymentId: 'pi_test',
      createdAt: new Date('2026-06-01T00:00:00Z'),
      event: {
        id: 'event-uuid-1',
        name: 'CBA Night',
        slug: 'cba-night',
        date: new Date('2026-07-01T02:00:00Z'),
        location: 'Montreal',
      },
    },
    ...override,
  };
}

describe('POST /admin/tickets/verify', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .post('/admin/tickets/verify')
      .send({ qrToken: QR_TOKEN });

    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid QR token', async () => {
    const res = await request(app)
      .post('/admin/tickets/verify')
      .set(authHeader())
      .send({ qrToken: 'not-a-uuid' });

    expect(res.status).toBe(400);
  });

  it('checks in a valid ticket and returns order context', async () => {
    const { prisma } = await import('../../../lib/prisma');
    const checkedInAt = new Date('2026-06-08T12:00:00Z');

    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(makeTicket() as any);
    vi.mocked(prisma.ticket.update).mockResolvedValue(
      makeTicket({ checkedIn: true, usedAt: checkedInAt }) as any
    );

    const res = await request(app)
      .post('/admin/tickets/verify')
      .set(authHeader())
      .send({ qrToken: QR_TOKEN });

    expect(res.status).toBe(200);
    expect(res.body.ticket).toMatchObject({
      id: 'ticket-uuid-1',
      qrToken: QR_TOKEN,
      checkedIn: true,
    });
    expect(res.body.order).toMatchObject({
      id: 'order-ticket-uuid-1',
      customerName: 'Ticket Buyer',
      customerEmail: 'buyer@example.com',
      quantity: 2,
    });
    expect(res.body.event).toMatchObject({
      id: 'event-uuid-1',
      name: 'CBA Night',
      location: 'Montreal',
    });
    expect(vi.mocked(prisma.ticket.update)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'ticket-uuid-1' },
        data: expect.objectContaining({ checkedIn: true, usedAt: expect.any(Date) }),
      })
    );
  });

  it('returns 404 when ticket is not found', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .post('/admin/tickets/verify')
      .set(authHeader())
      .send({ qrToken: QR_TOKEN });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Ticket not found' });
  });

  it('returns 409 when ticket is already checked in', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(
      makeTicket({ checkedIn: true, usedAt: new Date('2026-06-08T12:00:00Z') }) as any
    );

    const res = await request(app)
      .post('/admin/tickets/verify')
      .set(authHeader())
      .send({ qrToken: QR_TOKEN });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ error: 'Ticket already checked in' });
    expect(vi.mocked(prisma.ticket.update)).not.toHaveBeenCalled();
  });
});
