import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../../app';
import { signAdminToken } from '../../../lib/adminJwt';

vi.mock('../../../lib/prisma', () => {
  const radioEpisode = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
    delete: vi.fn(),
  };

  return {
    prisma: {
      adminUser: { findUnique: vi.fn() },
      radioEpisode,
      $transaction: vi.fn((callback) => callback({ radioEpisode })),
    },
  };
});

function authHeader() {
  const token = signAdminToken({ sub: 'admin-uuid', email: 'admin@cba.com' });
  return { Authorization: `Bearer ${token}` };
}

function makeEpisode(override?: object) {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    slug: 'midnight-frequency',
    title: 'CBA Live · Midnight Frequency',
    source: 'CKUT 90.3 FM',
    dateLabel: '14 nov · 2024',
    duration: '12:40',
    type: 'Passage radio',
    freq: '088.7',
    variant: 'portable',
    moods: ['Late Night', 'Montréal'],
    plays: 1832,
    audioSrc: 'https://storage.example.com/radio/midnight.mp3',
    featured: false,
    published: true,
    createdAt: new Date('2024-11-14T00:00:00Z'),
    ...override,
  };
}

function validBody(override?: object) {
  return {
    slug: 'midnight-frequency',
    title: 'CBA Live · Midnight Frequency',
    source: 'CKUT 90.3 FM',
    dateLabel: '14 nov · 2024',
    duration: '12:40',
    type: 'Passage radio',
    freq: '088.7',
    variant: 'portable',
    moods: ['Late Night', 'Montréal'],
    plays: 0,
    audioSrc: 'https://storage.example.com/radio/midnight.mp3',
    featured: false,
    published: true,
    ...override,
  };
}

describe('Admin radio routes', () => {
  beforeEach(() => vi.resetAllMocks());

  it('requires auth', async () => {
    const res = await request(app).get('/admin/radio');
    expect(res.status).toBe(401);
  });

  it('lists radio episodes for admins', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.radioEpisode.findMany).mockResolvedValue([makeEpisode()] as any);

    const res = await request(app).get('/admin/radio').set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.episodes).toHaveLength(1);
  });

  it('creates radio episodes', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.radioEpisode.create).mockResolvedValue(makeEpisode() as any);

    const res = await request(app)
      .post('/admin/radio')
      .set(authHeader())
      .send(validBody({ featured: true }));

    expect(res.status).toBe(201);
    expect(res.body.episode).toMatchObject({ slug: 'midnight-frequency' });
    expect(prisma.radioEpisode.updateMany).toHaveBeenCalledWith({
      where: { featured: true },
      data: { featured: false },
    });
  });

  it('returns 400 for invalid duration', async () => {
    const res = await request(app)
      .post('/admin/radio')
      .set(authHeader())
      .send(validBody({ duration: 'twelve minutes' }));

    expect(res.status).toBe(400);
  });

  it('updates radio episodes', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.radioEpisode.findUnique).mockResolvedValue(makeEpisode() as any);
    vi.mocked(prisma.radioEpisode.update).mockResolvedValue(makeEpisode({ title: 'Updated' }) as any);

    const res = await request(app)
      .patch('/admin/radio/11111111-1111-4111-8111-111111111111')
      .set(authHeader())
      .send({ title: 'Updated' });

    expect(res.status).toBe(200);
    expect(res.body.episode).toMatchObject({ title: 'Updated' });
  });

  it('deletes radio episodes', async () => {
    const { prisma } = await import('../../../lib/prisma');
    vi.mocked(prisma.radioEpisode.findUnique).mockResolvedValue(makeEpisode() as any);
    vi.mocked(prisma.radioEpisode.delete).mockResolvedValue(makeEpisode() as any);

    const res = await request(app)
      .delete('/admin/radio/11111111-1111-4111-8111-111111111111')
      .set(authHeader());

    expect(res.status).toBe(204);
  });
});
