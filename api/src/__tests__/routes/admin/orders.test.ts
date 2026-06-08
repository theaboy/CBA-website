import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    orderBeat: {
      findMany: vi.fn(),
    },
    orderTicket: {
      findMany: vi.fn(),
    },
  },
}));

const JWT_SECRET = process.env.JWT_SECRET!;

function authHeader() {
  const token = jwt.sign({ sub: 'admin-uuid', email: 'admin@cba.com' }, JWT_SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

describe('GET /admin/orders/beats', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 401 without token', async () => {
    const res = await request(app).get('/admin/orders/beats');
    expect(res.status).toBe(401);
  });

  it('returns beat orders with beat context', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.orderBeat.findMany).mockResolvedValue([
      {
        id: 'order-beat-uuid-1',
        customerEmail: 'buyer@example.com',
        customerName: 'Buyer',
        licenseType: 'BASIC',
        amountPaid: '29.99',
        createdAt: new Date('2026-06-01T00:00:00Z'),
        beat: { id: 'beat-uuid-1', title: 'Midnight Trap' },
      },
    ] as any);

    const res = await request(app)
      .get('/admin/orders/beats')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0]).toMatchObject({
      id: 'order-beat-uuid-1',
      customerEmail: 'buyer@example.com',
      beat: { title: 'Midnight Trap' },
    });
    expect(vi.mocked(prisma.orderBeat.findMany)).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      include: { beat: true },
    });
  });
});

describe('GET /admin/orders/tickets', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 401 without token', async () => {
    const res = await request(app).get('/admin/orders/tickets');
    expect(res.status).toBe(401);
  });

  it('returns ticket orders with event and tickets', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.orderTicket.findMany).mockResolvedValue([
      {
        id: 'order-ticket-uuid-1',
        customerEmail: 'buyer@example.com',
        customerName: 'Buyer',
        quantity: 2,
        amountPaid: '50.00',
        createdAt: new Date('2026-06-01T00:00:00Z'),
        event: { id: 'event-uuid-1', name: 'CBA Night' },
        tickets: [{ id: 'ticket-uuid-1', checkedIn: false }],
      },
    ] as any);

    const res = await request(app)
      .get('/admin/orders/tickets')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(1);
    expect(res.body.orders[0]).toMatchObject({
      id: 'order-ticket-uuid-1',
      event: { name: 'CBA Night' },
      tickets: [{ id: 'ticket-uuid-1', checkedIn: false }],
    });
    expect(vi.mocked(prisma.orderTicket.findMany)).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
      include: {
        event: true,
        tickets: true,
      },
    });
  });
});
