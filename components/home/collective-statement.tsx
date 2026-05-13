import Link from "next/link";

function OrnamentIcon() {
  return (
    <svg
      className="collective-ornament"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Medieval sun / ornament motif */}
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="1.2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 24 + 9 * Math.cos(rad);
        const y1 = 24 + 9 * Math.sin(rad);
        const x2 = 24 + 18 * Math.cos(rad);
        const y2 = 24 + 18 * Math.sin(rad);
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth={angle % 90 === 0 ? "1.4" : "0.8"}
            strokeLinecap="round"
          />
        );
      })}
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="0.6" strokeDasharray="2 3" />
    </svg>
  );
}

export function CollectiveStatement() {
  return (
    <section className="collective-section" aria-labelledby="collective-heading">
      <div className="collective-inner">
        {/* Left: pull quote */}
        <div className="collective-quote-side reveal">
          <OrnamentIcon />
          <blockquote className="collective-quote">
            We don&apos;t make beats.<br />
            We build <em>worlds</em><br />
            out of sound.
          </blockquote>
        </div>

        {/* Right: text */}
        <div className="collective-text-side reveal reveal-delay-2">
          <p className="collective-eyebrow" id="collective-heading">About CBA</p>
          <p className="collective-body">
            CBA is a Montréal-based music collective rooted in the city&apos;s underground sound culture.
            We produce custom instrumentals, run a professional studio, and bring live energy to events
            across the region — all under one creative identity.
          </p>
          <p className="collective-body">
            From trap and Afrobeats to soul and cinematic composition, our catalog is built for artists
            who refuse to sound generic. Every beat is crafted with intention, every session held with care.
          </p>
          <Link href="/about" className="collective-link">
            Learn About CBA
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
