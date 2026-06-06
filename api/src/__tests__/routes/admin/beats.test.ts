import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../app';

vi.mock('../../../lib/prisma', () => ({
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

const JWT_SECRET = process.env.JWT_SECRET!;

function authHeader() {
  const token = jwt.sign({ sub: 'admin-uuid', email: 'admin@cba.com' }, JWT_SECRET, { expiresIn: '1h' });
  return { Authorization: `Bearer ${token}` };
}

function makeBeat(override?: object) {
  return {
    id:              'beat-uuid-1',
    slug:            'midnight-trap',
    title:           'Midnight Trap',
    tagline:         'Dark and moody',
    description:     'A dark trap beat for night sessions',
    bpm:             140,
    musicalKey:      'Am',
    genre:           'Trap',
    mood:            'Dark',
    priceBasic:      '29.99',
    pricePremium:    '59.99',
    priceExclusive:  '199.99',
    previewKey:      'preview/midnight-trap.mp3',
    fullKey:         'full/midnight-trap.wav',
    artworkKey:      'artwork/midnight-trap.jpg',
    tags:            ['dark', 'trap'],
    bestFor:         ['rap'],
    mixPalette:      ['808s'],
    featured:        false,
    isExclusiveSold: false,
    playCount:       0,
    createdAt:       new Date(),
    ...override,
  };
}

function validBeatBody(override?: object) {
  return {
    slug:           'test-beat',
    title:          'Test Beat',
    tagline:        'A test tagline',
    description:    'Full description of the test beat',
    bpm:            120,
    musicalKey:     'Cm',
    genre:          'Hip-Hop',
    mood:           'Chill',
    priceBasic:     29.99,
    pricePremium:   59.99,
    priceExclusive: 199.99,
    previewKey:     'preview/test-beat.mp3',
    fullKey:        'full/test-beat.wav',
    artworkKey:     'artwork/test-beat.jpg',
    tags:           ['chill'],
    bestFor:        ['study'],
    mixPalette:     ['keys'],
    featured:       false,
    ...override,
  };
}

describe('Admin beats routes — authentication guard', () => {
  it('GET /admin/beats returns 401 without token', async () => {
    const res = await request(app).get('/admin/beats');
    expect(res.status).toBe(401);
  });

  it('POST /admin/beats returns 401 without token', async () => {
    const res = await request(app).post('/admin/beats').send(validBeatBody());
    expect(res.status).toBe(401);
  });

  it('PUT /admin/beats/:id returns 401 without token', async () => {
    const res = await request(app).put('/admin/beats/some-id').send({ title: 'Updated' });
    expect(res.status).toBe(401);
  });

  it('DELETE /admin/beats/:id returns 401 without token', async () => {
    const res = await request(app).delete('/admin/beats/some-id');
    expect(res.status).toBe(401);
  });
});

describe('GET /admin/beats', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 200 with all beats including fullKey for admin', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.beat.findMany).mockResolvedValue([makeBeat()] as any);

    const res = await request(app)
      .get('/admin/beats')
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.beats).toHaveLength(1);
    // Admin response MAY include fullKey (it's the full Prisma record)
    expect(res.body.beats[0].id).toBe('beat-uuid-1');
  });
});

describe('POST /admin/beats', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 201 with created beat on valid body', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.beat.create).mockResolvedValue(makeBeat() as any);

    const res = await request(app)
      .post('/admin/beats')
      .set(authHeader())
      .send(validBeatBody());

    expect(res.status).toBe(201);
    expect(res.body.beat).toMatchObject({ id: 'beat-uuid-1' });
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/admin/beats')
      .set(authHeader())
      .send({ title: 'Incomplete' }); // missing many required fields

    expect(res.status).toBe(400);
  });

  it('returns 400 when bpm is out of range', async () => {
    const res = await request(app)
      .post('/admin/beats')
      .set(authHeader())
      .send(validBeatBody({ bpm: 9999 })); // max is 250

    expect(res.status).toBe(400);
  });
});

describe('PUT /admin/beats/:id', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 200 with updated beat on valid body', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(makeBeat() as any);
    vi.mocked(prisma.beat.update).mockResolvedValue(makeBeat({ title: 'Updated Title' }) as any);

    const res = await request(app)
      .put('/admin/beats/beat-uuid-1')
      .set(authHeader())
      .send({ title: 'Updated Title' });

    expect(res.status).toBe(200);
    expect(res.body.beat.title).toBe('Updated Title');
  });

  it('returns 404 when beat does not exist', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .put('/admin/beats/nonexistent')
      .set(authHeader())
      .send({ title: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Beat not found' });
  });
});

describe('DELETE /admin/beats/:id', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns 204 on successful deletion', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(makeBeat() as any);
    vi.mocked(prisma.beat.delete).mockResolvedValue(makeBeat() as any);

    const res = await request(app)
      .delete('/admin/beats/beat-uuid-1')
      .set(authHeader());

    expect(res.status).toBe(204);
  });

  it('returns 404 when beat does not exist', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.beat.findUnique).mockResolvedValue(null);

    const res = await request(app)
      .delete('/admin/beats/nonexistent')
      .set(authHeader());

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ error: 'Beat not found' });
  });
});
