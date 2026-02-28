"use client";

import { getFeaturedBeats } from "@/lib/beats";
import { BeatCard } from "@/components/beats/beat-card";

export function FeaturedBeats() {
  const featured = getFeaturedBeats();

  return (
    <div className="featured-beats-shell">
      <div className="featured-beats-head">
        <div>
          <p className="eyebrow">Featured Beats</p>
          <h2>Curated entry points into the catalog.</h2>
        </div>
        <p className="section-body">
          The homepage now previews the beat system without flattening into the full browse grid.
        </p>
      </div>
      <div className="featured-beats-grid">
        {featured.slice(0, 3).map((beat) => (
          <BeatCard key={beat.id} beat={beat} />
        ))}
      </div>
    </div>
  );
}
