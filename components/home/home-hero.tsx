import Link from "next/link";

export function HomeHero() {
  return (
    <section className="cba-hero" aria-label="CBA Production — Hero">
      {/* Ambient radial glows */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background:
            "radial-gradient(ellipse 55% 45% at 20% 70%, rgba(10,75,42,0.32) 0%, transparent 70%)",
        }}
      />

      <div className="cba-hero-inner" style={{ paddingTop: "6rem", paddingBottom: "8rem" }}>
        {/* Eyebrow */}
        <p className="cba-hero-eyebrow">Montréal · Music Collective · Est. 2020</p>

        {/* Main brand title — letter-by-letter */}
        <h1 className="cba-hero-title" aria-label="CBA">
          {["C", "B", "A"].map((letter, i) => (
            <span key={letter} className="cba-hero-letter">
              <span className="cba-hero-letter-inner" style={{ animationDelay: `${0.35 + i * 0.13}s` }}>
                {letter}
              </span>
            </span>
          ))}
        </h1>

        {/* Sub-title */}
        <p className="cba-hero-sub">Production</p>

        {/* Divider */}
        <div className="cba-hero-divider" aria-hidden="true" />

        {/* Tagline */}
        <p className="cba-hero-tagline">
          Where Montréal&apos;s underground finds its sound — beats, sessions, and stages built for the culture.
        </p>

        {/* CTAs */}
        <div className="cba-hero-actions">
          <Link href="/beats" className="hero-cta-primary">
            Browse Beats
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <Link href="/studio" className="hero-cta-secondary">
            Book Studio
          </Link>
        </div>
      </div>

      {/* Waveform */}
      <div className="cba-hero-wave" aria-hidden="true">
        <svg
          viewBox="0 0 2880 100"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className="wave-path"
            d="M0,50 C90,20 180,80 270,50 C360,20 450,80 540,50 C630,20 720,80 810,50 C900,20 990,80 1080,50 C1170,20 1260,80 1350,50 C1440,20 1530,80 1620,50 C1710,20 1800,80 1890,50 C1980,20 2070,80 2160,50 C2250,20 2340,80 2430,50 C2520,20 2610,80 2700,50 C2790,20 2880,80 2880,50"
          />
          <path
            className="wave-path-2"
            d="M0,58 C120,35 240,72 360,58 C480,35 600,72 720,58 C840,35 960,72 1080,58 C1200,35 1320,72 1440,58 C1560,35 1680,72 1800,58 C1920,35 2040,72 2160,58 C2280,35 2400,72 2520,58 C2640,35 2760,72 2880,58"
          />
        </svg>
      </div>

      {/* Scroll cue */}
      <div className="cba-hero-scroll-cue" aria-hidden="true">
        <div className="hero-scroll-line" />
        <span>Scroll</span>
      </div>
    </section>
  );
}
