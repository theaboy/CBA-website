import Link from "next/link";
import type { Beat } from "@/lib/beats";

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M5.5 3.5L12.5 8L5.5 12.5V3.5Z" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

const artGradients = [
  "linear-gradient(135deg, #0d3a1e 0%, #1e6539 40%, #0a4b2a 70%, #051a0f 100%)",
  "linear-gradient(140deg, #1a0d2e 0%, #2d1a4a 40%, #1e0f38 70%, #0a0612 100%)",
  "linear-gradient(130deg, #1a1200 0%, #3d2c00 40%, #2a1e00 70%, #0d0900 100%)",
];

export function FeaturedBeats({ beats }: { beats: Beat[] }) {
  const displayBeats = beats.slice(0, 3);

  return (
    <section className="home-beats-section reveal">
      <div className="home-beats-head">
        <h2 className="home-beats-title">Featured Beats</h2>
        <Link href="/beats" className="home-beats-link">
          Full catalog <ArrowIcon />
        </Link>
      </div>

      <div className="home-beats-bento">
        {displayBeats.map((beat, index) => (
          <article key={beat.id} className={`home-beat-card ${index === 0 ? "featured" : ""}`}>
            {/* Artwork */}
            <div className="home-beat-art">
              <div className="home-beat-art-inner">
                <div
                  className="home-beat-art-gradient"
                  style={{ background: artGradients[index % artGradients.length] }}
                />
                <div className="home-beat-play-ring">
                  <button
                    className="home-beat-play-btn"
                    aria-label={`Play ${beat.title}`}
                    type="button"
                  >
                    <PlayIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="home-beat-info">
              <div className="home-beat-meta">
                <span className="home-beat-genre">{beat.genre}</span>
                <span className="home-beat-bpm">·</span>
                <span className="home-beat-bpm">{beat.bpm} BPM</span>
              </div>
              <h3 className="home-beat-title">{beat.title}</h3>
              <p className="home-beat-tagline">{beat.tagline}</p>
            </div>

            {/* Footer */}
            <div className="home-beat-footer">
              <span className="home-beat-price">${beat.price_basic}</span>
              <Link href={`/beats/${beat.slug}`} className="home-beat-action">
                View Beat <ArrowIcon />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
