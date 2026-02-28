"use client";

import Image from "next/image";
import Link from "next/link";
import { Beat, getRelatedBeats } from "@/lib/beats";
import { PlayToggle } from "@/components/audio/play-toggle";
import { BeatWaveform } from "@/components/beats/beat-waveform";

export function BeatDetailHero({ beat }: { beat: Beat }) {
  const relatedBeats = getRelatedBeats(beat);

  return (
    <div className="beat-detail-shell">
      <div className="beat-detail-breadcrumb">
        <Link href="/beats">Beats</Link>
        <span>/</span>
        <span>{beat.title}</span>
      </div>

      <section className="beat-detail-hero">
        <div className="beat-detail-media">
          <div className="beat-detail-art">
            <Image src={beat.artworkSrc} alt={beat.title} width={960} height={960} priority />
            <div className="beat-detail-art-overlay">
              <PlayToggle beat={beat} />
              <div className="beat-detail-price">
                <span>Starting at</span>
                <strong>${beat.price}</strong>
              </div>
            </div>
          </div>
          <BeatWaveform beat={beat} />
        </div>

        <div className="beat-detail-copy">
          <p className="eyebrow">{beat.genre} / {beat.mood}</p>
          <h1>{beat.title}</h1>
          <p className="beat-detail-tagline">{beat.tagline}</p>
          <p className="section-body">{beat.description}</p>

          <div className="beat-detail-stat-grid">
            <article>
              <span>BPM</span>
              <strong>{beat.bpm}</strong>
            </article>
            <article>
              <span>Runtime</span>
              <strong>{beat.duration}</strong>
            </article>
            <article>
              <span>Best for</span>
              <strong>{beat.bestFor[0]}</strong>
            </article>
          </div>

          <div className="beat-detail-chip-row">
            {beat.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>

          <div className="beat-detail-columns">
            <article className="beat-detail-panel">
              <p className="eyebrow">Mix Palette</p>
              <ul>
                {beat.mixPalette.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </article>
            <article className="beat-detail-panel">
              <p className="eyebrow">Ideal Uses</p>
              <ul>
                {beat.bestFor.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="beat-detail-related">
        <div className="beat-detail-related-head">
          <div>
            <p className="eyebrow">Keep Browsing</p>
            <h2>Adjacent moods from the catalog.</h2>
          </div>
          <p className="section-body">
            The detail route stays connected to the marketplace instead of feeling like a dead end.
          </p>
        </div>
        <div className="beat-detail-related-grid">
          {relatedBeats.map((relatedBeat) => (
            <Link key={relatedBeat.id} href={`/beats/${relatedBeat.slug}`} className="beat-detail-related-card">
              <span>{relatedBeat.genre}</span>
              <strong>{relatedBeat.title}</strong>
              <em>{relatedBeat.bpm} BPM / {relatedBeat.mood}</em>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
