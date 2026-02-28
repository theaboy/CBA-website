import Link from "next/link";

export function HomeHero() {
  return (
    <section className="hero-grid">
      <div className="hero-copy">
        <p className="eyebrow">Montreal / Premium Sound Identity</p>
        <h1>Dark, cinematic presentation for beats, bookings, and live momentum.</h1>
        <p className="section-body">
          CBA&apos;s first production shell balances storefront clarity with editorial mood. The
          interface is built to feel expensive before full commerce automation arrives.
        </p>
        <div className="hero-actions">
          <Link href="/beats" className="solid-chip">
            Browse Beats
          </Link>
          <Link href="/studio" className="ghost-chip">
            Book Studio
          </Link>
        </div>
      </div>

      <div className="hero-panel">
        <div className="hero-panel-stat">
          <span>Phase 1</span>
          <strong>Foundation / Brand System</strong>
        </div>
        <div className="hero-panel-line" />
        <div className="hero-panel-stack">
          <p>Audio-first layout rhythm</p>
          <p>Public + admin route split</p>
          <p>Responsive shell and theme tokens</p>
        </div>
      </div>
    </section>
  );
}
