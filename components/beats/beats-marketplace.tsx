"use client";

import { useState } from "react";
import { Beat, beatsCatalog, beatBpmRange, beatPriceRange, sortBeats } from "@/lib/beats";
import { BeatCard } from "@/components/beats/beat-card";
import { MarketplaceFilters, MarketplaceFiltersState } from "@/components/beats/marketplace-filters";

const initialState: MarketplaceFiltersState = {
  genre: "All",
  mood: "All",
  sort: "latest",
  maxPrice: beatPriceRange[1],
  bpmRange: [beatBpmRange[0], beatBpmRange[1]]
};

export function BeatsMarketplace() {
  const [filters, setFilters] = useState<MarketplaceFiltersState>(initialState);

  const filteredBeats = sortBeats(
    beatsCatalog.filter((beat: Beat) => {
      if (filters.genre !== "All" && beat.genre !== filters.genre) return false;
      if (filters.mood !== "All" && beat.mood !== filters.mood) return false;
      if (beat.price > filters.maxPrice) return false;
      if (beat.bpm < filters.bpmRange[0] || beat.bpm > filters.bpmRange[1]) return false;
      return true;
    }),
    filters.sort
  );

  return (
    <div className="marketplace-shell">
      <div className="marketplace-header">
        <div>
          <p className="eyebrow">Browse Instrumentals</p>
          <h2>Curated placeholders with real playback and real browse behavior.</h2>
        </div>
        <p className="section-body">
          Phase 2 turns the shell into an audio-first storefront: dense cards, persistent playback,
          and filters that feel built for music discovery.
        </p>
      </div>

      <MarketplaceFilters state={filters} onChange={setFilters} />

      {filteredBeats.length ? (
        <div className="beat-grid">
          {filteredBeats.map((beat) => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      ) : (
        <div className="marketplace-empty">
          <p className="eyebrow">No Matches</p>
          <h3>Shift the filters and the catalog opens back up.</h3>
          <p>Even the empty state stays editorial so the browse surface never feels broken.</p>
        </div>
      )}
    </div>
  );
}
