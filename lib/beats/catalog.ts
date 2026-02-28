export type BeatGenre = "Trap" | "Drill" | "Soul" | "Afro" | "R&B";
export type BeatMood = "Cinematic" | "Nocturnal" | "Luxe" | "Cold" | "Melodic";
export type BeatSort = "latest" | "popular" | "price-low" | "price-high" | "bpm-low" | "bpm-high";

export type Beat = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  bpm: number;
  genre: BeatGenre;
  mood: BeatMood;
  price: number;
  duration: string;
  durationSeconds: number;
  artworkSrc: string;
  audioSrc: string;
  featured: boolean;
  latest: boolean;
  popular: boolean;
};

export const beatsCatalog: Beat[] = [
  {
    id: "after-hours-anthem",
    slug: "after-hours-anthem",
    title: "After Hours Anthem",
    tagline: "Luxurious synth stacks for a late Montreal skyline.",
    bpm: 142,
    genre: "Trap",
    mood: "Luxe",
    price: 120,
    duration: "2:18",
    durationSeconds: 138,
    artworkSrc: "/cba/home-reference.png",
    audioSrc: "/audio/after-hours-anthem.wav",
    featured: true,
    latest: true,
    popular: true
  },
  {
    id: "concrete-velvet",
    slug: "concrete-velvet",
    title: "Concrete Velvet",
    tagline: "Silky keys and low-end pressure with editorial weight.",
    bpm: 132,
    genre: "R&B",
    mood: "Melodic",
    price: 95,
    duration: "2:42",
    durationSeconds: 162,
    artworkSrc: "/cba/mixes-reference.png",
    audioSrc: "/audio/concrete-velvet.wav",
    featured: true,
    latest: false,
    popular: true
  },
  {
    id: "north-line",
    slug: "north-line",
    title: "North Line",
    tagline: "Steel-wire drums and hard winter atmosphere.",
    bpm: 148,
    genre: "Drill",
    mood: "Cold",
    price: 110,
    duration: "2:06",
    durationSeconds: 126,
    artworkSrc: "/cba/gigs-reference.png",
    audioSrc: "/audio/north-line.wav",
    featured: false,
    latest: true,
    popular: true
  },
  {
    id: "amber-session",
    slug: "amber-session",
    title: "Amber Session",
    tagline: "Warm soul textures with vocal-pocket space.",
    bpm: 96,
    genre: "Soul",
    mood: "Cinematic",
    price: 85,
    duration: "2:31",
    durationSeconds: 151,
    artworkSrc: "/cba/press-kit-reference.png",
    audioSrc: "/audio/amber-session.wav",
    featured: false,
    latest: false,
    popular: false
  },
  {
    id: "district-fever",
    slug: "district-fever",
    title: "District Fever",
    tagline: "Afro percussion and glossy club momentum.",
    bpm: 118,
    genre: "Afro",
    mood: "Luxe",
    price: 100,
    duration: "2:24",
    durationSeconds: 144,
    artworkSrc: "/cba/home-reference.png",
    audioSrc: "/audio/district-fever.wav",
    featured: true,
    latest: true,
    popular: false
  },
  {
    id: "strobe-testimony",
    slug: "strobe-testimony",
    title: "Strobe Testimony",
    tagline: "Nocturnal pads with a tense halftime pulse.",
    bpm: 136,
    genre: "Trap",
    mood: "Nocturnal",
    price: 105,
    duration: "2:12",
    durationSeconds: 132,
    artworkSrc: "/cba/mixes-reference.png",
    audioSrc: "/audio/strobe-testimony.wav",
    featured: false,
    latest: true,
    popular: false
  }
];

export const beatGenres = [...new Set(beatsCatalog.map((beat) => beat.genre))];
export const beatMoods = [...new Set(beatsCatalog.map((beat) => beat.mood))];
export const beatPriceRange: [number, number] = [
  Math.min(...beatsCatalog.map((beat) => beat.price)),
  Math.max(...beatsCatalog.map((beat) => beat.price))
];
export const beatBpmRange: [number, number] = [
  Math.min(...beatsCatalog.map((beat) => beat.bpm)),
  Math.max(...beatsCatalog.map((beat) => beat.bpm))
];

export function getFeaturedBeats() {
  return beatsCatalog.filter((beat) => beat.featured);
}

export function sortBeats(beats: Beat[], sort: BeatSort) {
  const sorted = [...beats];

  switch (sort) {
    case "popular":
      return sorted.sort((a, b) => Number(b.popular) - Number(a.popular) || b.bpm - a.bpm);
    case "price-low":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-high":
      return sorted.sort((a, b) => b.price - a.price);
    case "bpm-low":
      return sorted.sort((a, b) => a.bpm - b.bpm);
    case "bpm-high":
      return sorted.sort((a, b) => b.bpm - a.bpm);
    case "latest":
    default:
      return sorted.sort((a, b) => Number(b.latest) - Number(a.latest) || b.bpm - a.bpm);
  }
}
