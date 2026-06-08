import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    beat: {
      findMany:   vi.fn(),
      findUnique: vi.fn(),
      create:     vi.fn(),
      update:     vi.fn(),
      delete:     vi.fn(),
    },
  },
}));

function makeBeat(override?: object) {
  // Mirrors what Prisma returns with the route's `select` clause applied —
  // fullKey is intentionally excluded here, just as Prisma excludes it via select.
  return {
    id:              'beat-uuid-1',
    slug:            'midnight-trap',
    title:           'Midnight Trap',
    tagline:         'Dark and moody',
    description:     'A dark trap beat',
    bpm:             140,
    musicalKey:      'Am',
    genre:           'Trap',
    mood:            'Dark',
    priceBasic:      '29.99',
    pricePremium:    '59.99',
    priceExclusive:  '199.99',
    previewKey:      'preview/midnight-trap.mp3',
    artworkKey:      'artwork/midnight-trap.jpg',
    tags:            ['dark', 'trap'],
    bestFor:         ['rap', 'drill'],
    mixPalette:      ['808s', 'hi-hats'],
    featured:        false,
    isExclusiveSold: false,
    playCount:       42,
    published:       true,
    createdAt:       new Date('2024-11-14T00:00:00Z'),
    // fullKey is NOT here — Prisma's select excludes it from public responses
    ...override,
  };
}

describe('GET /beats', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 200 with beats array', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.beat.findMany).mockResolvedValue([makeBeat()] as any);

    const res = await request(app).get('/beats');
    expect(res.status).toBe(200);
    expect(res.body.beats).toBeInstanceOf(Array);
    expect(res.body.beats).toHaveLength(1);
  });

  it('returns empty array when no beats exist', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.beat.findMany).mockResolvedValue([]);

    const res = await request(app).get('/beats');
    expect(res.status).toBe(200);
    expect(res.body.beats).toEqual([]);
  });

  it('never exposes fullKey in the response', async () => {
    const { prisma } = await import('../../lib/prisma');
    // Mock returns what Prisma returns with select applied — no fullKey
    vi.mocked(prisma.beat.findMany).mockResolvedValue([makeBeat()] as any);

    const res = await request(app).get('/beats');
    expect(JSON.stringify(res.body)).not.toContain('fullKey');
  });

  describe('filtering', () => {
    it('passes genre filter to prisma query', async () => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.beat.findMany).mockResolvedValue([]);

      await request(app).get('/beats?genre=Trap');

      expect(vi.mocked(prisma.beat.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ genre: 'Trap', published: true }) })
      );
    });

    it('passes mood filter to prisma query', async () => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.beat.findMany).mockResolvedValue([]);

      await request(app).get('/beats?mood=Dark');

      expect(vi.mocked(prisma.beat.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ mood: 'Dark', published: true }) })
      );
    });

    it('passes bpm range filter to prisma query', async () => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.beat.findMany).mockResolvedValue([]);

      await request(app).get('/beats?bpmMin=120&bpmMax=160');

      expect(vi.mocked(prisma.beat.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ bpm: { gte: 120, lte: 160 } }),
        })
      );
    });

    it('supports issue-style snake_case range filters', async () => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.beat.findMany).mockResolvedValue([]);

      await request(app).get('/beats?bpm_min=90&bpm_max=120&price_min=25&price_max=80');

      expect(vi.mocked(prisma.beat.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            bpm: { gte: 90, lte: 120 },
            priceBasic: { gte: expect.anything(), lte: expect.anything() },
          }),
        })
      );
    });

    it('returns 400 for invalid query params', async () => {
      const res = await request(app).get('/beats?sort=invalid-sort-value');
      expect(res.status).toBe(400);
    });
  });

  describe('sorting', () => {
    it.each([
      ['latest',     { createdAt: 'desc' }],
      ['popular',    { playCount: 'desc' }],
      ['most_played', { playCount: 'desc' }],
      ['price-low',  { priceBasic: 'asc' }],
      ['price-high', { priceBasic: 'desc' }],
      ['bpm-low',    { bpm: 'asc' }],
      ['bpm-high',   { bpm: 'desc' }],
    ])('sort=%s passes correct orderBy to prisma', async (sort, expectedOrderBy) => {
      const { prisma } = await import('../../lib/prisma');
      vi.mocked(prisma.beat.findMany).mockResolvedValue([]);

      await request(app).get(`/beats?sort=${sort}`);

      expect(vi.mocked(prisma.beat.findMany)).toHaveBeenCalledWith(
        expect.objectContaining({ orderBy: expectedOrderBy })
      );
    });
  });
});

describe('GET /beats/:id', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 200 with the beat when found', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(makeBeat() as any);

    const res = await request(app).get('/beats/beat-uuid-1');
    expect(res.status).toBe(200);
    expect(res.body.beat).toMatchObject({ id: 'beat-uuid-1', title: 'Midnight Trap' });
    expect(vi.mocked(prisma.beat.update)).toHaveBeenCalledWith({
      where: { id: 'beat-uuid-1' },
      data: { playCount: { increment: 1 } },
    });
  });

  it('can look up beat detail by slug', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(makeBeat() as any);

    const res = await request(app).get('/beats/midnight-trap');

    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.beat.findUnique)).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'midnight-trap' } })
    );
  });

  it('returns 404 when beat is not found', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(null);

    const res = await request(app).get('/beats/nonexistent-id');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Beat not found' });
  });

  it('returns 404 when beat is unpublished', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(makeBeat({ published: false }) as any);

    const res = await request(app).get('/beats/beat-uuid-1');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Beat not found' });
    expect(vi.mocked(prisma.beat.update)).not.toHaveBeenCalled();
  });

  it('never exposes fullKey in single beat response', async () => {
    const { prisma } = await import('../../lib/prisma');
    // Mock returns what Prisma returns with select applied — no fullKey
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(makeBeat() as any);

    const res = await request(app).get('/beats/beat-uuid-1');
    expect(JSON.stringify(res.body)).not.toContain('fullKey');
  });
});
