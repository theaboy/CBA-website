export type BeatGenre = "Trap" | "Drill" | "Soul" | "Afro" | "R&B";
export type BeatMood = "Cinematic" | "Nocturnal" | "Luxe" | "Cold" | "Melodic";
export type BeatSort = "latest" | "popular" | "price-low" | "price-high" | "bpm-low" | "bpm-high";
export type BeatLicenseCode = "basic" | "premium" | "exclusive";

export type BeatLicenseTier = {
  code: BeatLicenseCode;
  name: string;
  shortDescription: string;
  usage: string;
  turnaround: string;
  features: string[];
  multiplier: number;
};

export type Beat = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  bpm: number;
  genre: BeatGenre;
  mood: BeatMood;
  price: number;
  duration: string;
  durationSeconds: number;
  artworkSrc: string;
  audioSrc: string;
  mixPalette: string[];
  bestFor: string[];
  tags: string[];
  featured: boolean;
  latest: boolean;
  popular: boolean;
};

export const beatLicenseTiers: BeatLicenseTier[] = [
  {
    code: "basic",
    name: "Basic License",
    shortDescription: "For early releases, demos, and agile single drops.",
    usage: "Small release / standard streaming",
    turnaround: "Fast follow-up",
    features: ["Tagged preview reference", "Manual licensing follow-up", "Standard release intent"],
    multiplier: 1
  },
  {
    code: "premium",
    name: "Premium License",
    shortDescription: "For serious artist campaigns that need a wider release lane.",
    usage: "Campaign release / higher visibility",
    turnaround: "Priority review",
    features: ["Priority response", "Expanded release discussion", "Campaign-oriented usage review"],
    multiplier: 1.65
  },
  {
    code: "exclusive",
    name: "Exclusive License",
    shortDescription: "For artists who want to discuss full exclusivity around the record.",
    usage: "Exclusive rights discussion",
    turnaround: "Direct manual negotiation",
    features: ["Direct CBA follow-up", "Exclusivity discussion", "Custom usage terms review"],
    multiplier: 3.5
  }
];

export const beatsCatalog: Beat[] = [
  {
    id: "after-hours-anthem",
    slug: "after-hours-anthem",
    title: "After Hours Anthem",
    tagline: "Luxurious synth stacks for a late Montreal skyline.",
    description:
      "A glossy late-night trap instrumental with patient synth builds, heavyweight low end, and enough open air for a melodic hook or direct rap pocket.",
    bpm: 142,
    genre: "Trap",
    mood: "Luxe",
    price: 120,
    duration: "2:18",
    durationSeconds: 138,
    artworkSrc: "/cba/home-reference.png",
    audioSrc: "/audio/after-hours-anthem.wav",
    mixPalette: ["Velvet synth lead", "Sub pressure", "Glass percussion"],
    bestFor: ["Single rollouts", "Luxury visuals", "Night-drive records"],
    tags: ["Montreal", "Night shift", "Premium trap"],
    featured: true,
    latest: true,
    popular: true
  },
  {
    id: "concrete-velvet",
    slug: "concrete-velvet",
    title: "Concrete Velvet",
    tagline: "Silky keys and low-end pressure with editorial weight.",
    description:
      "An R&B-leaning pocket with rich harmonic movement, polished drum programming, and enough negative space for vocal runs, rap verses, or crossover toplines.",
    bpm: 132,
    genre: "R&B",
    mood: "Melodic",
    price: 95,
    duration: "2:42",
    durationSeconds: 162,
    artworkSrc: "/cba/mixes-reference.png",
    audioSrc: "/audio/concrete-velvet.wav",
    mixPalette: ["Electric piano bed", "Soft-top drums", "Weighted bassline"],
    bestFor: ["Hook-first records", "Artist demos", "Smooth performance sets"],
    tags: ["Velvet", "Topline-ready", "Editorial R&B"],
    featured: true,
    latest: false,
    popular: true
  },
  {
    id: "north-line",
    slug: "north-line",
    title: "North Line",
    tagline: "Steel-wire drums and hard winter atmosphere.",
    description:
      "A cold drill bounce built around clipped melodic fragments, hard-knock percussion, and a focused pocket designed for direct bars and stripped-back energy.",
    bpm: 148,
    genre: "Drill",
    mood: "Cold",
    price: 110,
    duration: "2:06",
    durationSeconds: 126,
    artworkSrc: "/cba/gigs-reference.png",
    audioSrc: "/audio/north-line.wav",
    mixPalette: ["Steel bell textures", "Compressed low end", "Sparse tension pads"],
    bestFor: ["Street visuals", "Direct verses", "Aggressive performance moments"],
    tags: ["Winter", "Drill", "Pressure"],
    featured: false,
    latest: true,
    popular: true
  },
  {
    id: "amber-session",
    slug: "amber-session",
    title: "Amber Session",
    tagline: "Warm soul textures with vocal-pocket space.",
    description:
      "A slower soul pocket with rich chord color, brushed movement, and room for emotional writing. Built for storytelling records and intimate studio sessions.",
    bpm: 96,
    genre: "Soul",
    mood: "Cinematic",
    price: 85,
    duration: "2:31",
    durationSeconds: 151,
    artworkSrc: "/cba/press-kit-reference.png",
    audioSrc: "/audio/amber-session.wav",
    mixPalette: ["Dusty keys", "Tape warmth", "Rounded live-feel drums"],
    bestFor: ["Story records", "Live session cuts", "Soul-heavy hooks"],
    tags: ["Warm", "Soul study", "Live-room"],
    featured: false,
    latest: false,
    popular: false
  },
  {
    id: "district-fever",
    slug: "district-fever",
    title: "District Fever",
    tagline: "Afro percussion and glossy club momentum.",
    description:
      "An afro-fusion instrumental with active percussion, slick melodic accents, and a polished club energy that still leaves space for clean topline writing.",
    bpm: 118,
    genre: "Afro",
    mood: "Luxe",
    price: 100,
    duration: "2:24",
    durationSeconds: 144,
    artworkSrc: "/cba/home-reference.png",
    audioSrc: "/audio/district-fever.wav",
    mixPalette: ["Bright guitar motif", "Club percussion", "Elastic bass groove"],
    bestFor: ["Dance-ready singles", "Festival cuts", "Upbeat visuals"],
    tags: ["Afro-fusion", "Club gloss", "Motion"],
    featured: true,
    latest: true,
    popular: false
  },
  {
    id: "strobe-testimony",
    slug: "strobe-testimony",
    title: "Strobe Testimony",
    tagline: "Nocturnal pads with a tense halftime pulse.",
    description:
      "Dark melodic trap with suspended pad work, half-time drum movement, and a moody arc that suits confessional writing or atmospheric visuals.",
    bpm: 136,
    genre: "Trap",
    mood: "Nocturnal",
    price: 105,
    duration: "2:12",
    durationSeconds: 132,
    artworkSrc: "/cba/mixes-reference.png",
    audioSrc: "/audio/strobe-testimony.wav",
    mixPalette: ["Wide pad stack", "Subtle distortion", "Half-time snap"],
    bestFor: ["Late-night records", "Reflective verses", "Dark visual edits"],
    tags: ["Nocturnal", "Half-time", "Atmosphere"],
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

export function getBeatBySlug(slug: string) {
  return beatsCatalog.find((beat) => beat.slug === slug) ?? null;
}

export function getBeatLicenseOptions(beat: Beat) {
  return beatLicenseTiers.map((tier) => ({
    ...tier,
    price: Math.round(beat.price * tier.multiplier)
  }));
}

export function getRelatedBeats(beat: Beat, limit = 3) {
  return beatsCatalog
    .filter((candidate) => candidate.id !== beat.id)
    .sort((a, b) => {
      const scoreA = Number(a.genre === beat.genre) + Number(a.mood === beat.mood) + Number(a.popular);
      const scoreB = Number(b.genre === beat.genre) + Number(b.mood === beat.mood) + Number(b.popular);
      return scoreB - scoreA;
    })
    .slice(0, limit);
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
