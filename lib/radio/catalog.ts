// lib/radio/catalog.ts

export type RadioEpisode = {
  id: string;
  title: string;
  host: string;
  genre: string;
  description: string;
  date: string;        // ISO "2026-04-12"
  duration: string;    // "1:24:07"
  durationSeconds: number;
  audioSrc: string;    // TODO: replace with real bucket URL per episode
  featured: boolean;
};

// 24 equalizer bars — stable (no hydration mismatch)
export const BAR_CONFIG: { h: number; d: number }[] = [
  { h: 35, d: 1.1 }, { h: 68, d: 0.8 }, { h: 52, d: 1.4 }, { h: 82, d: 0.7 },
  { h: 44, d: 1.2 }, { h: 91, d: 0.9 }, { h: 60, d: 1.6 }, { h: 38, d: 1.0 },
  { h: 75, d: 0.6 }, { h: 55, d: 1.3 }, { h: 88, d: 0.8 }, { h: 42, d: 1.5 },
  { h: 66, d: 1.1 }, { h: 93, d: 0.7 }, { h: 50, d: 1.4 }, { h: 77, d: 0.9 },
  { h: 34, d: 1.2 }, { h: 84, d: 0.6 }, { h: 58, d: 1.7 }, { h: 70, d: 1.0 },
  { h: 47, d: 0.8 }, { h: 79, d: 1.3 }, { h: 62, d: 0.9 }, { h: 41, d: 1.1 },
];

// Sorted newest-first. Add new episodes at the top.
export const radioEpisodes: RadioEpisode[] = [
  {
    id: "uf-vol-12",
    title: "Underground Frequency Vol. 12",
    host: "DJ Korvax",
    genre: "Afrobeat · Electronic",
    description: "Deux heures dans les fréquences basses du Plateau. Sélection brute, transitions lentes.",
    date: "2026-05-10",
    duration: "2:04:33",
    durationSeconds: 7473,
    audioSrc: "/audio/uf-vol-12.mp3", // TODO: replace with bucket URL
    featured: true,
  },
  {
    id: "deep-sessions-08",
    title: "Deep Sessions #08",
    host: "Solène",
    genre: "Deep House · Ambient",
    description: "Nuit longue, atmosphères denses. Pour ceux qui restent debout après 2h.",
    date: "2026-05-03",
    duration: "1:32:18",
    durationSeconds: 5538,
    audioSrc: "/audio/deep-sessions-08.mp3",
    featured: false,
  },
  {
    id: "nuit-blanche-04",
    title: "Nuit Blanche #04",
    host: "MC Taro",
    genre: "Hip-Hop · Spoken Word",
    description: "Freestyles, confessions et rythmes. Une heure de mots depuis le studio.",
    date: "2026-04-26",
    duration: "1:08:44",
    durationSeconds: 4124,
    audioSrc: "/audio/nuit-blanche-04.mp3",
    featured: false,
  },
  {
    id: "aube-libre-02",
    title: "Aube Libre #02",
    host: "Fira",
    genre: "Soul · Jazz · Fusion",
    description: "La douceur avant l'aube. Jazz, électronique et soul tissés ensemble.",
    date: "2026-04-20",
    duration: "1:18:55",
    durationSeconds: 4735,
    audioSrc: "/audio/aube-libre-02.mp3",
    featured: false,
  },
  {
    id: "uf-vol-11",
    title: "Underground Frequency Vol. 11",
    host: "DJ Korvax",
    genre: "Afrobeat · Electronic",
    description: "Le volume 11 — plus sombre, plus profond. Enregistré en direct au Bar Le Ritz.",
    date: "2026-04-12",
    duration: "1:58:20",
    durationSeconds: 7100,
    audioSrc: "/audio/uf-vol-11.mp3",
    featured: false,
  },
  {
    id: "deep-sessions-07",
    title: "Deep Sessions #07",
    host: "Solène",
    genre: "Deep House · Ambient",
    description: "La septième session. Morceaux rares, transitions fluides.",
    date: "2026-04-05",
    duration: "1:44:02",
    durationSeconds: 6242,
    audioSrc: "/audio/deep-sessions-07.mp3",
    featured: false,
  },
];

export function getFeaturedEpisode(): RadioEpisode {
  return radioEpisodes.find((e) => e.featured) ?? radioEpisodes[0];
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
}
