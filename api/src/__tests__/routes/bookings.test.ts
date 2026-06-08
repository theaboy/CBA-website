import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    booking: {
      create: vi.fn(),
    },
  },
}));

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
    notes: 'Package: Gold\nNotes: Some notes',
    status: 'PENDING',
    createdAt: new Date('2026-06-01T00:00:00Z'),
    ...override,
  };
}

describe('POST /bookings/studio', () => {
  beforeEach(() => vi.resetAllMocks());

  it('creates a pending studio booking request', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.booking.create).mockResolvedValue(makeBooking() as any);

    const res = await request(app)
      .post('/bookings/studio')
      .send({
        name: 'Client Name',
        email: 'client@example.com',
        phone: '555-123-4567',
        date: '2026-07-01T18:00:00.000Z',
        time: '18:00',
        package: 'Gold',
        durationHours: 2,
        notes: 'Some notes',
      });

    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({ id: 'booking-uuid-1', bookingType: 'STUDIO' });
    expect(vi.mocked(prisma.booking.create)).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingType: 'STUDIO',
        customerName: 'Client Name',
        customerEmail: 'client@example.com',
        eventDate: expect.any(Date),
        durationHours: 2,
        notes: expect.stringContaining('Package: Gold'),
      }),
    });
  });

  it('returns 400 for invalid studio booking body', async () => {
    const res = await request(app)
      .post('/bookings/studio')
      .send({ name: 'Missing Email' });

    expect(res.status).toBe(400);
  });
});

describe('POST /bookings/dj', () => {
  beforeEach(() => vi.resetAllMocks());

  it('creates a pending DJ booking request', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.booking.create).mockResolvedValue(
      makeBooking({ bookingType: 'DJ', durationHours: null }) as any
    );

    const res = await request(app)
      .post('/bookings/dj')
      .send({
        name: 'Event Client',
        email: 'event@example.com',
        phone: '555-987-6543',
        eventDate: '2026-08-01T02:00:00.000Z',
        eventType: 'Club night',
        budget: 1200,
        location: 'Montreal',
        notes: 'Late set',
      });

    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({ bookingType: 'DJ' });
    expect(vi.mocked(prisma.booking.create)).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookingType: 'DJ',
        customerName: 'Event Client',
        customerEmail: 'event@example.com',
        eventDate: expect.any(Date),
        notes: expect.stringContaining('Event type: Club night'),
      }),
    });
  });

  it('returns 400 for invalid DJ booking body', async () => {
    const res = await request(app)
      .post('/bookings/dj')
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });
});
