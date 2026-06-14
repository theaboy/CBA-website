import { ARCHIVE, FEATURED } from "@/lib/radio/archive";
import type { ArchiveItem, FeaturedItem } from "@/lib/radio/archive";

export type RadioArchiveResponse = {
  featured: FeaturedItem | null;
  episodes: ArchiveItem[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchRadioArchive(): Promise<RadioArchiveResponse> {
  const res = await fetch(`${API_URL.replace(/\/$/, "")}/radio/episodes`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Radio archive request failed: ${res.status}`);
  }

  return res.json() as Promise<RadioArchiveResponse>;
}

export function fallbackRadioArchive(): RadioArchiveResponse {
  return {
    featured: FEATURED,
    episodes: ARCHIVE,
  };
}
