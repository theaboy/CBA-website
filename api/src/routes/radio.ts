import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const radioRouter = Router();

const publicSelect = {
  id: true,
  slug: true,
  title: true,
  source: true,
  dateLabel: true,
  duration: true,
  type: true,
  freq: true,
  variant: true,
  moods: true,
  plays: true,
  audioSrc: true,
  featured: true,
  createdAt: true,
} as const;

function toRadioItem(episode: {
  id: string;
  slug: string;
  title: string;
  source: string;
  dateLabel: string;
  duration: string;
  type: string;
  freq: string;
  variant: string;
  moods: string[];
  plays: number;
  audioSrc: string | null;
  featured: boolean;
  createdAt: Date;
}) {
  return {
    id: episode.slug || episode.id,
    title: episode.title,
    source: episode.source,
    date: episode.dateLabel,
    duration: episode.duration,
    type: episode.type,
    freq: episode.freq,
    variant: episode.variant,
    moods: episode.moods,
    plays: episode.plays,
    audioSrc: episode.audioSrc ?? undefined,
    featured: episode.featured,
    createdAt: episode.createdAt,
  };
}

radioRouter.get('/episodes', async (_req, res, next) => {
  try {
    const episodes = await prisma.radioEpisode.findMany({
      where: { published: true },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      select: publicSelect,
    });

    const items = episodes.map(toRadioItem);
    res.json({
      featured: items.find((item) => item.featured) ?? items[0] ?? null,
      episodes: items.filter((item) => !item.featured),
    });
  } catch (err) {
    next(err);
  }
});
