import { createClient } from "@/lib/supabase/server";
import { getPreviewAudioUrl, getArtworkUrl } from "@/lib/supabase/storage";
import type { Beat, BeatGenre, BeatMood, BeatSort } from "@/lib/beats/catalog";

export type BeatFilters = {
  genre?: BeatGenre;
  mood?: BeatMood;
  bpm_min?: number;
  bpm_max?: number;
  price_min?: number;
  price_max?: number;
  sort?: BeatSort;
  limit?: number;
};

// Column list — full_key is intentionally absent.
// This is the enforcement mechanism for BE-04: RLS is row-level only;
// column exclusion via explicit select is required.
const PUBLIC_BEAT_COLUMNS = `
  id, slug, title, tagline, description,
  bpm, musical_key, genre, mood,
  price_basic, price_premium, price_exclusive,
  preview_key, artwork_key,
  tags, best_for, mix_palette,
  featured, is_exclusive_sold, play_count, published, created_at
` as const;

type RawBeat = Omit<Beat, "audio_src" | "artwork_url">;

async function resolveUrls(raw: RawBeat): Promise<Beat> {
  const [audio_src, artwork_url] = await Promise.all([
    getPreviewAudioUrl(raw.preview_key),
    getArtworkUrl(raw.artwork_key),
  ]);
  return { ...raw, audio_src, artwork_url };
}

export async function getPublishedBeats(filters: BeatFilters = {}): Promise<Beat[]> {
  const supabase = await createClient();

  let query = supabase
    .from("beats")
    .select(PUBLIC_BEAT_COLUMNS)
    .eq("published", true);

  if (filters.genre)     query = query.eq("genre", filters.genre);
  if (filters.mood)      query = query.eq("mood", filters.mood);
  if (filters.bpm_min !== undefined) query = query.gte("bpm", filters.bpm_min);
  if (filters.bpm_max !== undefined) query = query.lte("bpm", filters.bpm_max);
  if (filters.price_min !== undefined) query = query.gte("price_basic", filters.price_min);
  if (filters.price_max !== undefined) query = query.lte("price_basic", filters.price_max);

  // Sort
  switch (filters.sort) {
    case "price-low":
      query = query.order("price_basic", { ascending: true });
      break;
    case "price-high":
      query = query.order("price_basic", { ascending: false });
      break;
    case "popular":
      query = query.order("play_count", { ascending: false });
      break;
    case "bpm-low":
      query = query.order("bpm", { ascending: true });
      break;
    case "bpm-high":
      query = query.order("bpm", { ascending: false });
      break;
    case "latest":
    default:
      query = query.order("created_at", { ascending: false });
  }

  if (filters.limit) query = query.limit(filters.limit);

  const { data, error } = await query;
  if (error) throw error;
  if (!data) return [];

  return Promise.all((data as RawBeat[]).map(resolveUrls));
}

export async function getBeatBySlug(slug: string): Promise<Beat | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("beats")
    .select(PUBLIC_BEAT_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error || !data) return null;
  return resolveUrls(data as RawBeat);
}

export async function getFeaturedBeats(): Promise<Beat[]> {
  return getPublishedBeats({ sort: "latest", limit: 6 });
}
