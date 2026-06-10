import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    adminUser: { findUnique: vi.fn() },
    radioEpisode: {
      findMany: vi.fn(),
    },
  },
}));

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
    createdAt: new Date('2024-11-14T00:00:00Z'),
    ...override,
  };
}

describe('GET /radio/episodes', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns published radio episodes with a featured item', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.radioEpisode.findMany).mockResolvedValue([
      makeEpisode({ slug: 'featured-session', featured: true }),
      makeEpisode(),
    ] as any);

    const res = await request(app).get('/radio/episodes');

    expect(res.status).toBe(200);
    expect(res.body.featured).toMatchObject({
      id: 'featured-session',
      title: 'CBA Live · Midnight Frequency',
      featured: true,
    });
    expect(res.body.episodes).toHaveLength(1);
    expect(res.body.episodes[0]).toMatchObject({
      id: 'midnight-frequency',
      date: '14 nov · 2024',
      audioSrc: 'https://storage.example.com/radio/midnight.mp3',
    });
    expect(prisma.radioEpisode.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { published: true },
      })
    );
  });

  it('returns null featured and empty episodes when no records exist', async () => {
    const { prisma } = await import('../../lib/prisma');
    vi.mocked(prisma.radioEpisode.findMany).mockResolvedValue([]);

    const res = await request(app).get('/radio/episodes');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ featured: null, episodes: [] });
  });
});
