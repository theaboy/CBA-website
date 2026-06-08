import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    booking: {
      findMany:   vi.fn(),
      findUnique: vi.fn(),
      update:     vi.fn(),
    },
  },
}));

const JWT_SECRET = process.env.JWT_SECRET!;

function authHeader() {
  const token = jwt.sign({ sub: 'admin-uuid', email: 'admin@cba.com' }, JWT_SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

function makeBooking(override?: object) {
  return {
    id: 'booking-uuid-1',
    bookingType: 'STUDIO',
    customerName: 'Client Name',
    customerEmail: 'client@example.com',
    customerPhone: '555-123-4567',
    message: 'Some notes',
    eventDate: new Date('2026-07-01T18:00:00Z'),
    durationHours: 2,
    notes: 'Package: Gold',
    status: 'PENDING',
    createdAt: new Date('2026-06-01T00:00:00Z'),
    ...override,
  };
}

describe('GET /admin/bookings', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 401 without token', async () => {
    const res = await request(app).get('/admin/bookings');
    expect(res.status).toBe(401);
  });

  it('returns all bookings for admins', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.booking.findMany).mockResolvedValue([makeBooking()] as any);

    const res = await request(app)
      .get('/admin/bookings')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.bookings).toHaveLength(1);
    expect(vi.mocked(prisma.booking.findMany)).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
    });
  });

  it('filters bookings by bookingType', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.booking.findMany).mockResolvedValue([makeBooking({ bookingType: 'DJ' })] as any);

    const res = await request(app)
      .get('/admin/bookings?bookingType=DJ')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.booking.findMany)).toHaveBeenCalledWith({
      where: { bookingType: 'DJ' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('returns 400 for invalid bookingType filter', async () => {
    const res = await request(app)
      .get('/admin/bookings?bookingType=INVALID')
      .set(authHeader());

    expect(res.status).toBe(400);
  });
});

describe('PUT /admin/bookings/:id', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 401 without token', async () => {
    const res = await request(app)
      .put('/admin/bookings/booking-uuid-1')
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(401);
  });

  it('updates booking status', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.booking.findUnique).mockResolvedValue(makeBooking() as any);
    vi.mocked(prisma.booking.update).mockResolvedValue(makeBooking({ status: 'CONFIRMED' }) as any);

    const res = await request(app)
      .put('/admin/bookings/booking-uuid-1')
      .set(authHeader())
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(200);
    expect(res.body.booking).toMatchObject({ id: 'booking-uuid-1', status: 'CONFIRMED' });
    expect(vi.mocked(prisma.booking.update)).toHaveBeenCalledWith({
      where: { id: 'booking-uuid-1' },
      data: { status: 'CONFIRMED' },
    });
  });

  it('returns 400 for invalid status', async () => {
    const res = await request(app)
      .put('/admin/bookings/booking-uuid-1')
      .set(authHeader())
      .send({ status: 'DONE' });

    expect(res.status).toBe(400);
  });

  it('returns 404 when booking does not exist', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.booking.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .put('/admin/bookings/missing')
      .set(authHeader())
      .send({ status: 'CONFIRMED' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Booking not found' });
  });
});
