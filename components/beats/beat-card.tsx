"use client";

import Image from "next/image";
import { Beat } from "@/lib/beats";
import { PlayToggle } from "@/components/audio/play-toggle";

export function BeatCard({ beat }: { beat: Beat }) {
  return (
    <article className="beat-card">
      <div className="beat-card-art">
        <Image src={beat.artworkSrc} alt={beat.title} width={640} height={480} />
        <div className="beat-card-overlay">
          <PlayToggle beat={beat} />
          <span className="beat-price">${beat.price}</span>
        </div>
      </div>
      <div className="beat-card-copy">
        <div className="beat-card-heading">
          <div>
            <p className="eyebrow">{beat.genre}</p>
            <h3>{beat.title}</h3>
          </div>
          <button type="button" className="favorite-chip" aria-label={`Favorite ${beat.title}`}>
            Save
          </button>
        </div>
        <p>{beat.tagline}</p>
        <div className="beat-card-meta">
          <span>{beat.bpm} BPM</span>
          <span>{beat.mood}</span>
          <span>{beat.duration}</span>
        </div>
        <div className="beat-card-actions">
          <span className="ghost-chip">Add to Cart</span>
          <span className="solid-chip">Licensing Next</span>
        </div>
      </div>
    </article>
  );
}
