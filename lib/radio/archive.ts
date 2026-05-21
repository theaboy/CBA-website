// lib/radio/archive.ts — CBA Frequency Archive data

export type ArchiveVariant =
  | "portable" | "wood-square" | "cassette"
  | "mini" | "car-dash" | "studio" | "wood-mesh";

export type ArchiveItem = {
  id: string;
  title: string;
  source: string;
  date: string;
  duration: string;
  type: string;
  freq: string;
  variant: ArchiveVariant;
  moods: string[];
  plays: number;
  audioSrc?: string;
};

export type FeaturedItem = {
  id: string;
  title: string;
  source: string;
  date: string;
  duration: string;
  type: string;
  freq: string;
  audioSrc?: string;
};

export type FilterState = {
  category: string;
  moods: string[];
  search: string;
};

export const FEATURED: FeaturedItem = {
  id: "featured-mtl-session",
  title: "Session Montréal · Vol. III",
  source: "CBA Booth · Saint-Laurent",
  date: "3 déc · 2024",
  duration: "42:18",
  type: "Session live",
  freq: "088.7",
  audioSrc: "/audio/featured-mtl-session.mp3",
};

export const ARCHIVE: ArchiveItem[] = [
  {
    id: "midnight-freq",
    title: "CBA Live · Midnight Frequency",
    source: "CKUT 90.3 FM",
    date: "14 nov · 2024",
    duration: "12:40",
    type: "Passage radio",
    freq: "088.7",
    variant: "portable",
    moods: ["Late Night", "Montréal"],
    plays: 1832,
    audioSrc: "/audio/midnight-freq.mp3",
  },
  {
    id: "mtl-booth",
    title: "Session Booth Montréal",
    source: "Studio Mile-End",
    date: "2 oct · 2024",
    duration: "18:05",
    type: "Entrevue",
    freq: "102.4",
    variant: "wood-square",
    moods: ["Montréal", "Studio"],
    plays: 2640,
    audioSrc: "/audio/mtl-booth.mp3",
  },
  {
    id: "underground-mix",
    title: "Underground Signal Mix",
    source: "Rinse Mtl",
    date: "17 sep · 2024",
    duration: "31:22",
    type: "DJ Set",
    freq: "95.1",
    variant: "cassette",
    moods: ["Underground", "Late Night"],
    plays: 4221,
    audioSrc: "/audio/underground-mix.mp3",
  },
  {
    id: "behind-mic",
    title: "Derrière le micro avec CBA",
    source: "Radio Centre-Ville",
    date: "28 août · 2024",
    duration: "09:48",
    type: "Entrevue",
    freq: "102.3",
    variant: "mini",
    moods: ["Montréal", "Studio"],
    plays: 1410,
    audioSrc: "/audio/behind-mic.mp3",
  },
  {
    id: "late-night-studio",
    title: "Late Night Studio Frequency",
    source: "CBA Booth · A12",
    date: "19 juil · 2024",
    duration: "22:17",
    type: "Session live",
    freq: "88.7",
    variant: "car-dash",
    moods: ["Late Night", "Studio", "Raw Tape"],
    plays: 982,
    audioSrc: "/audio/late-night-studio.mp3",
  },
  {
    id: "archive-tape-07",
    title: "Cassette 07 — Moment CBA Radio",
    source: "Master reel-to-reel",
    date: "4 juin · 2024",
    duration: "14:33",
    type: "Passage radio",
    freq: "99.5",
    variant: "studio",
    moods: ["Raw Tape", "Underground"],
    plays: 720,
    audioSrc: "/audio/archive-tape-07.mp3",
  },
  {
    id: "cba-shortwave",
    title: "CBA Shortwave — Transmission 03",
    source: "Shortwave 6.085 kHz",
    date: "22 mai · 2024",
    duration: "26:54",
    type: "Passage radio",
    freq: "6.085",
    variant: "wood-mesh",
    moods: ["Underground", "Raw Tape", "Late Night"],
    plays: 590,
    audioSrc: "/audio/cba-shortwave.mp3",
  },
  {
    id: "mtl-3am",
    title: "Mile-End 3h du mat",
    source: "Studio Mile-End",
    date: "8 mai · 2024",
    duration: "47:12",
    type: "DJ Set",
    freq: "93.7",
    variant: "portable",
    moods: ["Late Night", "Montréal"],
    plays: 3104,
    audioSrc: "/audio/mtl-3am.mp3",
  },
  {
    id: "tape-saint-laurent",
    title: "Tape du Booth Saint-Laurent",
    source: "Enregistrement terrain",
    date: "14 avr · 2024",
    duration: "11:08",
    type: "Passage radio",
    freq: "101.1",
    variant: "cassette",
    moods: ["Raw Tape", "Montréal"],
    plays: 1265,
    audioSrc: "/audio/tape-saint-laurent.mp3",
  },
];

export function parseDuration(str: string): number {
  const [m, s] = str.split(":").map(Number);
  return m * 60 + (s || 0);
}

export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

// Maps display category label → exact item.type value
const CATEGORY_TYPE: Record<string, string> = {
  "Entrevues":      "Entrevue",
  "DJ Sets":        "DJ Set",
  "Sessions live":  "Session live",
  "Passages radio": "Passage radio",
};

export function applyFilters(
  items: ArchiveItem[],
  filters: FilterState,
  sort: string,
): ArchiveItem[] {
  let out = [...items];

  if (filters.category && filters.category !== "Tout") {
    const typeFilter = CATEGORY_TYPE[filters.category];
    if (typeFilter) {
      out = out.filter((i) => i.type === typeFilter);
    }
  }

  if (filters.moods.length) {
    out = out.filter((i) => filters.moods.some((m) => i.moods.includes(m)));
  }

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    out = out.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.source.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q) ||
        i.moods.join(" ").toLowerCase().includes(q),
    );
  }

  if (sort === "Plus long") {
    out.sort((a, b) => parseDuration(b.duration) - parseDuration(a.duration));
  } else if (sort === "Plus écouté") {
    out.sort((a, b) => b.plays - a.plays);
  }

  return out;
}
