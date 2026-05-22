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
  musical_key: string;
  genre: BeatGenre;
  mood: BeatMood;
  price_basic: number;
  price_premium: number;
  price_exclusive: number;
  preview_key: string;
  artwork_key: string;
  tags: string[];
  best_for: string[];
  mix_palette: string[];
  featured: boolean;
  is_exclusive_sold: boolean;
  play_count: number;
  published: boolean;
  created_at: string;
  // Resolved URLs — populated by queries.ts using storage helpers
  audio_src: string;
  artwork_url: string;
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

export const beatGenres: BeatGenre[] = ["Trap", "Drill", "Soul", "Afro", "R&B"];
export const beatMoods: BeatMood[] = ["Cinematic", "Nocturnal", "Luxe", "Cold", "Melodic"];
export const beatBpmRange: [number, number] = [80, 160];
export const beatPriceRange: [number, number] = [80, 500];

export function getBeatLicenseOptions(beat: Beat) {
  return [
    { ...beatLicenseTiers[0], price: beat.price_basic },
    { ...beatLicenseTiers[1], price: beat.price_premium },
    { ...beatLicenseTiers[2], price: beat.price_exclusive },
  ];
}
