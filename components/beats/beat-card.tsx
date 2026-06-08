"use client";

import Link from "next/link";
import Image from "next/image";
import { Beat } from "@/lib/beats";
import { PlayToggle } from "@/components/audio/play-toggle";

export function BeatCard({ beat }: { beat: Beat }) {
  return (
    <article className="beat-card">
      <div className="beat-card-art">
        <Image src={beat.artwork_url} alt={beat.title} width={640} height={480} />
        <div className="beat-card-overlay">
          <PlayToggle beat={beat} />
          <span className="beat-price">${beat.price_basic}</span>
        </div>
      </div>
      <div className="beat-card-copy">
        <div className="beat-card-heading">
          <div>
            <p className="eyebrow">{beat.genre}</p>
            <h3>
              <Link href={`/beats/${beat.slug}`} className="beat-card-title-link">
                {beat.title}
              </Link>
            </h3>
          </div>
          <button type="button" className="favorite-chip" aria-label={`Favorite ${beat.title}`}>
            Save
          </button>
        </div>
        <p>{beat.tagline}</p>
        <div className="beat-card-meta">
          <span>{beat.bpm} BPM</span>
          <span>{beat.mood}</span>
        </div>
        <div className="beat-card-actions">
          <span className="ghost-chip">Add to Cart</span>
          <Link href={`/beats/${beat.slug}`} className="solid-chip">
            View Beat
          </Link>
        </div>
      </div>
    </article>
  );
}
