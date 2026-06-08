import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

const supabaseMocks = vi.hoisted(() => ({
  from: vi.fn(),
  createSignedUrl: vi.fn(),
}));

vi.mock('../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    orderBeat: { findFirst: vi.fn() },
  },
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: supabaseMocks.from,
    },
  },
}));

function makeOrder(override?: object) {
  return {
    id: 'order-uuid-1',
    beatId: 'beat-uuid-1',
    licenseType: 'BASIC',
    amountPaid: '29.99',
    customerEmail: 'buyer@example.com',
    customerName: 'Buyer',
    stripePaymentId: 'pi_test',
    downloadKey: 'download-key-1',
    downloadExpiry: new Date(Date.now() + 60_000),
    createdAt: new Date(),
    beat: {
      id: 'beat-uuid-1',
      fullKey: 'full/midnight-trap.wav',
    },
    ...override,
  };
}

describe('GET /downloads/:key', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    supabaseMocks.from.mockReturnValue({
      createSignedUrl: supabaseMocks.createSignedUrl,
    });
  });

  it('redirects valid download keys to a signed Supabase Storage URL', async () => {
    const { prisma } = await import('../../lib/prisma');

    vi.mocked(prisma.orderBeat.findFirst).mockResolvedValue(makeOrder() as any);
    supabaseMocks.createSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://signed.example.com/full/midnight-trap.wav' },
      error: null,
    });

    const res = await request(app).get('/downloads/download-key-1');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://signed.example.com/full/midnight-trap.wav');
    expect(supabaseMocks.from).toHaveBeenCalledWith('full-audio');
    expect(supabaseMocks.createSignedUrl).toHaveBeenCalledWith('full/midnight-trap.wav', 60);
  });

  it('returns 404 when the download key is unknown', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.orderBeat.findFirst).mockResolvedValue(null);

    const res = await request(app).get('/downloads/missing-key');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Download link not found or expired' });
  });

  it('returns 404 when the download key is expired', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.orderBeat.findFirst).mockResolvedValue(
      makeOrder({ downloadExpiry: new Date(Date.now() - 60_000) }) as any
    );

    const res = await request(app).get('/downloads/expired-key');

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Download link not found or expired' });
  });

  it('returns 500 when Supabase cannot sign the download URL', async () => {
    const { prisma } = await import('../../lib/prisma');

    vi.mocked(prisma.orderBeat.findFirst).mockResolvedValue(makeOrder() as any);
    supabaseMocks.createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: 'storage unavailable' },
    });

    const res = await request(app).get('/downloads/download-key-1');

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({ error: 'Internal server error' });
  });
});
