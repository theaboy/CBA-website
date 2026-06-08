"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type Beat } from "@/lib/beats";

const GOLD = "#c9a961";
const PAPER = "#f5f0e6";
const BG = "#0a0a0a";

export function EditorialCatalog({ beats }: { beats: Beat[] }) {
  const displayBeats = beats.slice(0, 5);
  const [activeId, setActiveId] = useState(displayBeats[0]?.id);
  const [entered, setEntered] = useState<number[]>([]);

  useEffect(() => {
    const timers = displayBeats.map((_, i) =>
      setTimeout(() => setEntered((prev) => [...prev, i]), 140 * i),
    );
    return () => timers.forEach(clearTimeout);
  }, [displayBeats.length]);

  return (
    <section
      id="beats"
      aria-labelledby="editorial-catalog-heading"
      className="px-6 py-10 md:px-16 md:py-14"
      style={{ background: "transparent", color: PAPER }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Header (Studio-style) */}
        <header
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "0 1.25rem",
            marginBottom: "clamp(2.6rem, 4.5vw, 4rem)",
          }}
        >
          <p
            style={{
              margin: "0 0 0.9rem",
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#d4a373",
            }}
          >
            Catalogue
          </p>
          <h2
            id="editorial-catalog-heading"
            style={{
              margin: 0,
              fontFamily: 'var(--font-title, "Cinzel", serif)',
              fontStyle: "italic",
              fontSize: "clamp(1.85rem, 4.5vw, 3.4rem)",
              fontWeight: 500,
              lineHeight: 1.04,
              color: "#f5ecd9",
              letterSpacing: "0.01em",
            }}
          >
            Catalogue éditorial
          </h2>
          <div
            aria-hidden
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              margin: "1.1rem auto 1.1rem",
              width: "8rem",
            }}
          >
            <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9965a, transparent)" }} />
            <span style={{ display: "block", width: 5, height: 5, background: "#c9965a", transform: "rotate(45deg)", flexShrink: 0 }} />
            <span style={{ flex: 1, height: 1, background: "linear-gradient(to right, transparent, #c9965a, transparent)" }} />
          </div>
          <p
            style={{
              margin: "0 auto 1.6rem",
              maxWidth: "42ch",
              color: "rgba(245, 236, 222, 0.62)",
              fontSize: "0.94rem",
              lineHeight: 1.72,
            }}
          >
            Beats exclusifs, palettes sonores distinctes, énergie montréalaise.
          </p>
          <Link
            href="/beats"
            className="border px-8 py-3 text-xs font-semibold uppercase tracking-[0.22em] transition-all duration-300"
            style={{ borderColor: GOLD, color: GOLD }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = GOLD;
              e.currentTarget.style.color = BG;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = GOLD;
            }}
          >
            Tout le catalogue →
          </Link>
        </header>

        {/* Interactive Selector */}
        <div className="flex h-[520px] w-full gap-4 overflow-hidden md:h-[600px]">
          {displayBeats.map((beat, i) => {
            const isActive = beat.id === activeId;
            const isEntered = entered.includes(i);
            return (
              <button
                key={beat.id}
                type="button"
                onClick={() => setActiveId(beat.id)}
                aria-expanded={isActive}
                aria-label={`${beat.title} — ${beat.genre}, ${beat.bpm} BPM`}
                className={[
                  "group relative cursor-pointer overflow-hidden text-left outline-none transition-all duration-500 ease-in-out focus-visible:ring-2 focus-visible:ring-[#c9a961]",
                  isActive ? "flex-[4]" : "flex-[0.5] hover:flex-[0.7]",
                ].join(" ")}
                style={{
                  opacity: isEntered ? 1 : 0,
                  transform: isEntered ? "translateX(0)" : "translateX(-40px)",
                  transitionProperty: "flex-grow, opacity, transform",
                }}
              >
                {/* Background image — scales up slightly when active */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out"
                  style={{
                    backgroundImage: `url('${beat.artwork_url}')`,
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                  }}
                />
                {/* Bottom-up paper gradient */}
                <div
                  className="absolute inset-0 opacity-80"
                  style={{
                    background: `linear-gradient(to top, ${BG} 0%, transparent 55%)`,
                  }}
                />
                {/* Active: emerald tint; idle: dark veil */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={
                    isActive
                      ? {
                          background:
                            "linear-gradient(to top, rgba(26,61,46,0.9), transparent)",
                          opacity: 0.4,
                        }
                      : { backgroundColor: "rgba(0,0,0,1)", opacity: 0.2 }
                  }
                />

                {/* Content */}
                {isActive ? (
                  <div
                    className="relative z-10 flex h-full flex-col justify-end p-6 md:p-10"
                    style={{ animation: "cat-fade-in 0.5s ease-out forwards" }}
                  >
                    <div className="mb-6 flex gap-3">
                      <span
                        className="rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
                        style={{ backgroundColor: GOLD, color: BG }}
                      >
                        {beat.genre}
                      </span>
                      <span
                        className="rounded-sm border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em]"
                        style={{ borderColor: GOLD, color: GOLD }}
                      >
                        {beat.bpm} BPM
                      </span>
                    </div>

                    <h3
                      className="mb-4 font-serif text-4xl leading-[1.05] md:text-6xl"
                      style={{ color: PAPER }}
                    >
                      {beat.title}
                    </h3>

                    <p
                      className="mb-8 max-w-lg text-sm font-light"
                      style={{ color: "rgba(201,169,97,0.8)" }}
                    >
                      {beat.tagline}
                    </p>

                    <div className="flex flex-wrap items-center gap-6 md:gap-8">
                      <span
                        className="font-serif text-3xl font-medium"
                        style={{ color: GOLD }}
                      >
                        ${beat.price_basic}
                      </span>
                      <div className="flex gap-4">
                        <Link
                          href={`/beats?beat=${beat.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 rounded-sm px-6 py-2 text-xs font-bold uppercase tracking-[0.22em] transition-all hover:brightness-110"
                          style={{ backgroundColor: GOLD, color: BG }}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Écouter
                        </Link>
                        <Link
                          href={`/beats?beat=${beat.slug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center rounded-sm border px-6 py-2 text-xs font-bold uppercase tracking-[0.22em] transition-all"
                          style={{ borderColor: GOLD, color: GOLD }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor =
                              "rgba(201,169,97,0.1)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "transparent")
                          }
                        >
                          Détails
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex h-full items-end justify-center pb-8">
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold transition-colors group-hover:border-[#c9a961] group-hover:text-[#c9a961]"
                      style={{
                        borderColor: "rgba(255,255,255,0.2)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {beat.genre.charAt(0)}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes cat-fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
