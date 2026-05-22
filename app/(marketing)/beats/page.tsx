import { getPublishedBeats } from "@/lib/beats/queries";
import { LightCatalog } from "@/components/beats/light-catalog";
import type { BeatGenre, BeatMood, BeatSort } from "@/lib/beats/catalog";

export const dynamic = "force-dynamic";

type SearchParams = {
  genre?: string;
  mood?: string;
  bpm_min?: string;
  bpm_max?: string;
  price_min?: string;
  price_max?: string;
  sort?: string;
};

export default async function BeatsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const beats = await getPublishedBeats({
    genre: params.genre as BeatGenre | undefined,
    mood: params.mood as BeatMood | undefined,
    bpm_min: params.bpm_min ? Number(params.bpm_min) : undefined,
    bpm_max: params.bpm_max ? Number(params.bpm_max) : undefined,
    price_min: params.price_min ? Number(params.price_min) : undefined,
    price_max: params.price_max ? Number(params.price_max) : undefined,
    sort: params.sort as BeatSort | undefined,
  });

  return <LightCatalog beats={beats} />;
}
