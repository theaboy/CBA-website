// app/(marketing)/radio/page.tsx
"use client";

import { useState } from "react";
import { RadioArchive } from "@/components/radio/radio-archive";
import { RadioPlayerBar } from "@/components/radio/radio-player-bar";
import type { RadioEpisode } from "@/lib/radio/catalog";

export default function RadioPage() {
  const [activeEpisode, setActiveEpisode] = useState<RadioEpisode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handleSelect(episode: RadioEpisode) {
    if (activeEpisode?.id === episode.id) {
      setIsPlaying((p) => !p);
    } else {
      setActiveEpisode(episode);
      setIsPlaying(true);
    }
  }

  return (
    <>
      <RadioArchive
        activeId={activeEpisode?.id ?? null}
        isPlaying={isPlaying}
        onSelect={handleSelect}
      />
      {activeEpisode && (
        <RadioPlayerBar
          episode={activeEpisode}
          onClose={() => { setActiveEpisode(null); setIsPlaying(false); }}
        />
      )}
    </>
  );
}
