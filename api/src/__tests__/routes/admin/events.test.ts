import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    event: {
      findUnique: vi.fn(),
    },
  },
}));

const JWT_SECRET = process.env.JWT_SECRET!;

function authHeader() {
  const token = jwt.sign({ sub: 'admin-uuid', email: 'admin@cba.com' }, JWT_SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

function makeEvent(override?: object) {
  return {
    id: 'event-uuid-1',
    name: 'CBA Night',
    date: new Date('2026-07-01T02:00:00Z'),
    location: 'Montreal',
    orders: [
      {
        id: 'order-ticket-uuid-1',
        customerName: 'Ticket Buyer',
        customerEmail: 'buyer@example.com',
        tickets: [
          {
            id: 'ticket-uuid-1',
            qrToken: '11111111-1111-4111-8111-111111111111',
            checkedIn: false,
            usedAt: null,
          },
        ],
      },
    ],
    ...override,
  };
}

describe('GET /admin/events/:id/attendees', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 401 without token', async () => {
    const res = await request(app).get('/admin/events/event-uuid-1/attendees');
    expect(res.status).toBe(401);
  });

  it('returns event attendees for admins', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.event.findUnique).mockResolvedValue(makeEvent() as any);

    const res = await request(app)
      .get('/admin/events/event-uuid-1/attendees')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.event).toMatchObject({
      id: 'event-uuid-1',
      name: 'CBA Night',
      location: 'Montreal',
    });
    expect(res.body.attendees).toEqual([
      expect.objectContaining({
        ticketId: 'ticket-uuid-1',
        customerName: 'Ticket Buyer',
        customerEmail: 'buyer@example.com',
        orderId: 'order-ticket-uuid-1',
        checkedIn: false,
      }),
    ]);
  });

  it('returns 404 when event is not found', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.event.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .get('/admin/events/missing/attendees')
      .set(authHeader());

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Event not found' });
  });
});
