"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { type Beat } from "@/lib/beats";

// ── Light-catalog palette (inversion of brand) ────────────────────────────────
const PAPER       = "#f5f1e8";
const PAPER_DEEP  = "#ece6d7";
const INK         = "#0d0c0a";
const INK_SOFT    = "#3a342d";
const INK_MUTE    = "#8a8580";
const INK_FAINT   = "#cdc4b3";
const GOLD        = "#a47b3c";
const GOLD_BRIGHT = "#c9a961";
const LINE_LT     = "rgba(13,12,10,0.10)";
const LINE_MED    = "rgba(13,12,10,0.18)";

const SERIF = `"Cinzel", "Cormorant Garamond", Georgia, serif`;
const SANS  = `"Space Grotesk", "Inter Tight", "Helvetica Neue", Arial, sans-serif`;
const MONO  = `"JetBrains Mono", ui-monospace, monospace`;

const indexLabel = (i: number) => String(i + 1).padStart(2, "0");

// Stable pseudo-random waveform peaks (no useEffect needed, deterministic from seed)
function makePeaks(seed: number, count = 80): number[] {
  const out: number[] = [];
  let s = seed * 9301 + 49297;
  for (let i = 0; i < count; i++) {
    s = (s * 9301 + 49297) % 233280;
    const r = s / 233280;
    const env = Math.sin((i / count) * Math.PI) * 0.5 + 0.5;
    out.push(0.15 + r * env * 0.85);
  }
  return out;
}

export function LightCatalog({ beats }: { beats: Beat[] }) {
  const [active, setActive] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const beat = beats[active];

  const wave = useMemo(() => makePeaks(beat ? beat.bpm + 11 : 142, 80), [beat]);
  const rackOrder = useMemo(
    () => beats.map((_, i) => i).filter((i) => i !== active),
    [beats, active],
  );

  if (!beat) {
    return (
      <section
        aria-labelledby="light-catalog-heading"
        style={{ background: PAPER, color: INK, fontFamily: SANS, padding: "80px 60px", textAlign: "center" }}
      >
        <p style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.2em", color: INK_MUTE, textTransform: "uppercase" }}>
          No beats available yet.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="light-catalog-heading"
      style={{
        background: PAPER,
        color: INK,
        fontFamily: SANS,
        position: "relative",
        overflow: "hidden",
        paddingBottom: 80,
      }}
    >
      {/* Paper warmth */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `
            radial-gradient(ellipse 60% 35% at 50% 0%, rgba(164,123,60,0.05), transparent 60%),
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(13,12,10,0.04), transparent 70%)`,
        }}
      />

      {/* ── Liquid CATALOG wordmark — SVG with feTurbulence displacement ── */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: 56,
          marginBottom: -32,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 1400 360"
          width="min(1240px, 90%)"
          style={{ display: "block", overflow: "visible" }}
          aria-labelledby="light-catalog-heading"
        >
          <title id="light-catalog-heading">Catalog</title>
          <defs>
            <filter id="lc-liquid" x="-12%" y="-20%" width="124%" height="140%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.010 0.022"
                numOctaves={2}
                seed={4}
                result="noise"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="noise"
                scale={38}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
          <text
            x="700"
            y="272"
            textAnchor="middle"
            fontFamily={SERIF}
            fontSize={300}
            fontWeight={600}
            letterSpacing={-6}
            fill={INK}
            filter="url(#lc-liquid)"
          >
            CATALOG
          </text>
        </svg>
      </div>

      {/* ── Breadcrumb + Genre row ── */}
      <div
        style={{
          position: "relative",
          zIndex: 3,
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 60px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: INK }}>Main</span>
          <span style={{ color: INK_FAINT, margin: "0 10px" }}>/</span>
          <span style={{ color: INK }}>Catalog</span>
          <span style={{ color: INK_FAINT, margin: "0 10px" }}>/</span>
          <span style={{ color: GOLD }}>All beats</span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            fontFamily: SANS,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <span style={{ color: INK_MUTE }}>{indexLabel(beats.length - 1)} records</span>
          <span style={{ width: 1, height: 14, background: LINE_MED }} />
          <span style={{ display: "flex", gap: 8, alignItems: "center", color: INK }}>
            Genre
            <span
              style={{
                display: "inline-grid",
                placeItems: "center",
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: `1px solid ${INK}`,
                fontSize: 11,
                lineHeight: 0,
              }}
            >
              +
            </span>
          </span>
        </div>
      </div>

      {/* ── FEATURE STAGE — sleeve + vinyl + liner notes ── */}
      <div
        className="ec-stage"
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1240,
          margin: "0 auto",
          padding: "0 60px",
        }}
      >
        <div
          className="ec-stage-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            gap: 0,
            alignItems: "stretch",
          }}
        >
          {/* Left — sleeve with vinyl peeking out */}
          <div className="ec-stage-left" style={{ position: "relative", paddingRight: 80 }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                width: "100%",
                background: `url('${beat.artwork_url}') center/cover`,
                boxShadow: `
                  0 30px 60px rgba(13,12,10,0.20),
                  0 8px 18px rgba(13,12,10,0.12),
                  inset 0 0 0 1px rgba(255,255,255,0.05)`,
              }}
            >
              {/* Top-left badges */}
              <div
                style={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  display: "flex",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.24em",
                    padding: "6px 12px",
                    background: PAPER,
                    color: INK,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {indexLabel(active)}
                </span>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.24em",
                    padding: "6px 12px",
                    background: GOLD,
                    color: PAPER,
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  ● Now spinning
                </span>
              </div>

              {/* Bottom-left title */}
              <div
                style={{
                  position: "absolute",
                  left: 22,
                  right: 22,
                  bottom: 22,
                  color: PAPER,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.3em",
                    textTransform: "uppercase",
                    opacity: 0.9,
                    marginBottom: 8,
                  }}
                >
                  {beat.genre} · {beat.mood}
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: "clamp(2rem, 4vw, 3.25rem)",
                    lineHeight: 0.92,
                    letterSpacing: "-0.02em",
                    fontWeight: 500,
                    textShadow: "0 4px 24px rgba(0,0,0,0.6)",
                  }}
                >
                  {beat.title}
                </div>
              </div>

              {/* Play/pause toggle for vinyl spin */}
              <button
                type="button"
                onClick={() => setSpinning((s) => !s)}
                aria-label={spinning ? "Pause vinyl" : "Spin vinyl"}
                style={{
                  position: "absolute",
                  right: 22,
                  top: 22,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: PAPER,
                  color: INK,
                  border: "none",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "0 10px 26px rgba(0,0,0,0.3)",
                }}
              >
                {spinning ? (
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14 }}>❚❚</span>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Vinyl peeking out — absolutely positioned so it overlaps the sleeve's right edge */}
            <div
              className="ec-vinyl"
              style={{
                position: "absolute",
                right: -50,
                top: "50%",
                transform: "translateY(-50%)",
                width: 340,
                height: 340,
                borderRadius: "50%",
                background: `
                  radial-gradient(circle at 50% 50%,
                    #0a0a0a 30%, #1a1a1a 30.6%, #1a1a1a 33%, #0a0a0a 33.6%,
                    #0a0a0a 38%, #1a1a1a 38.6%, #1a1a1a 41%, #0a0a0a 41.6%,
                    #0a0a0a 47%, #1a1a1a 47.6%, #1a1a1a 51%, #0a0a0a 51.6%,
                    #0a0a0a 58%, #1a1a1a 58.6%, #1a1a1a 62%, #0a0a0a 62.6%,
                    #0a0a0a 70%, #1a1a1a 70.6%, #1a1a1a 75%, #0a0a0a 75.6%,
                    #0a0a0a 82%, #1a1a1a 82.6%, #1a1a1a 87%, #0a0a0a 87.6%)`,
                boxShadow: `
                  0 30px 60px rgba(13,12,10,0.35),
                  inset 0 0 50px rgba(0,0,0,0.5)`,
                animation: spinning ? "ec-spin 5s linear infinite" : "none",
                display: "grid",
                placeItems: "center",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${GOLD} 0%, #6a4823 100%)`,
                  display: "grid",
                  placeItems: "center",
                  boxShadow: "inset 0 0 26px rgba(0,0,0,0.35)",
                  position: "relative",
                }}
              >
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: `url('${beat.artwork_url}') center/cover`,
                    opacity: 0.55,
                    mixBlendMode: "multiply",
                  }}
                />
                <div style={{ position: "relative", textAlign: "center", color: PAPER, padding: 10 }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 8,
                      letterSpacing: "0.3em",
                      textTransform: "uppercase",
                      opacity: 0.85,
                    }}
                  >
                    CBA Rec.
                  </div>
                  <div
                    style={{
                      fontFamily: SERIF,
                      fontSize: 12,
                      lineHeight: 1.05,
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    {beat.title}
                  </div>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 8,
                      marginTop: 4,
                      opacity: 0.85,
                    }}
                  >
                    {beat.bpm} BPM
                  </div>
                </div>
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    width: 11,
                    height: 11,
                    borderRadius: "50%",
                    background: PAPER,
                    boxShadow: "inset 0 0 3px rgba(0,0,0,0.7)",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right — liner notes panel */}
          <div
            className="ec-liner"
            style={{
              background: PAPER_DEEP,
              padding: "36px 36px 32px 100px",
              marginLeft: -60,
              display: "flex",
              flexDirection: "column",
              position: "relative",
              boxShadow: "inset 18px 0 30px -20px rgba(13,12,10,0.18)",
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.32em",
                color: GOLD,
                textTransform: "uppercase",
              }}
            >
              Liner notes · No. {indexLabel(active)}
            </div>

            <h2
              style={{
                margin: "16px 0 0",
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.5rem, 4.5vw, 4rem)",
                lineHeight: 0.94,
                letterSpacing: "-0.02em",
                color: INK,
              }}
            >
              {beat.title.split(" ").map((w, i) => (
                <span
                  key={i}
                  style={{
                    display: "block",
                    fontStyle: i ? "italic" : "normal",
                    color: i ? GOLD : INK,
                  }}
                >
                  {w}.
                </span>
              ))}
            </h2>

            <p
              style={{
                marginTop: 18,
                fontFamily: SERIF,
                fontStyle: "italic",
                fontSize: 17,
                lineHeight: 1.5,
                color: INK_SOFT,
                maxWidth: 420,
              }}
            >
              {beat.tagline}
            </p>

            {/* Spec table */}
            <div style={{ marginTop: 22, borderTop: `1px solid ${LINE_MED}` }}>
              {[
                ["BPM", String(beat.bpm)],
                ["Key", beat.musical_key],
                ["Genre", beat.genre],
                ["Mood", beat.mood],
                ["Pressing", `CBA/${indexLabel(active)} · First press`],
              ].map(([k, v]) => (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: `1px solid ${LINE_LT}`,
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  <span style={{ color: INK_MUTE }}>{k}</span>
                  <span style={{ color: INK, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Waveform */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 56 }}>
                {wave.map((v, i) => {
                  const on = i / wave.length < 0.34;
                  return (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: `${v * 100}%`,
                        background: on ? GOLD : "rgba(13,12,10,0.18)",
                        borderRadius: 1,
                      }}
                    />
                  );
                })}
              </div>
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                  color: INK_MUTE,
                  textTransform: "uppercase",
                }}
              >
                <span>0:47</span>
                <span>{beat.bpm} BPM</span>
              </div>
            </div>

            {/* CTA row */}
            <div
              style={{
                marginTop: "auto",
                paddingTop: 22,
                display: "flex",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 120 }}>
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 10,
                    letterSpacing: "0.24em",
                    color: INK_MUTE,
                    textTransform: "uppercase",
                  }}
                >
                  License from
                </div>
                <div
                  style={{
                    fontFamily: SERIF,
                    fontSize: 38,
                    color: INK,
                    marginTop: 2,
                    fontWeight: 500,
                  }}
                >
                  ${beat.price_basic}
                </div>
              </div>
              <Link
                href={`/beats/${beat.slug}#stems`}
                style={{
                  padding: "16px 22px",
                  background: "transparent",
                  color: INK,
                  border: `1px solid ${INK}`,
                  fontFamily: SANS,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                Stems
              </Link>
              <Link
                href={`/beats/${beat.slug}`}
                style={{
                  padding: "16px 26px",
                  background: INK,
                  color: PAPER,
                  border: "none",
                  fontFamily: SANS,
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                }}
              >
                License →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── THE RACK — leaning sleeves of the other beats ── */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1240,
          margin: "56px auto 0",
          padding: "0 60px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 22,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.32em",
                color: GOLD,
                textTransform: "uppercase",
              }}
            >
              — The rack · Tap a sleeve to swap
            </div>
            <h3
              style={{
                margin: "10px 0 0",
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: 32,
                lineHeight: 1,
                letterSpacing: "-0.01em",
                color: INK,
              }}
            >
              {rackOrder.length === 5 ? "Five more on rotation." : `${indexLabel(rackOrder.length - 1)} more on rotation.`}
            </h3>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              aria-label="Previous beat"
              onClick={() => setActive((a) => (a - 1 + beats.length) % beats.length)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "transparent",
                border: `1px solid ${INK}`,
                color: INK,
                cursor: "pointer",
                fontFamily: SANS,
                fontSize: 16,
              }}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Next beat"
              onClick={() => setActive((a) => (a + 1) % beats.length)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: INK,
                border: `1px solid ${INK}`,
                color: PAPER,
                cursor: "pointer",
                fontFamily: SANS,
                fontSize: 16,
              }}
            >
              →
            </button>
          </div>
        </div>

        <div className="ec-rack-grid">
          {rackOrder.map((idx, j) => {
            const b = beats[idx];
            const lean = (j - (rackOrder.length - 1) / 2) * 0.7;
            return (
              <RackSleeve
                key={b.id}
                beat={b}
                lean={lean}
                onSelect={() => setActive(idx)}
                index={idx}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 36,
            paddingTop: 18,
            borderTop: `1px solid ${LINE_MED}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.28em",
              color: INK_MUTE,
              textTransform: "uppercase",
            }}
          >
            {indexLabel(beats.length - 1)} in rotation
          </span>
          <Link
            href="/beats"
            style={{
              fontFamily: SANS,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: INK,
              borderBottom: `1px solid ${INK}`,
              paddingBottom: 4,
              textDecoration: "none",
            }}
          >
            See full catalogue →
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes ec-spin {
          from { transform: translateY(-50%) rotate(0); }
          to   { transform: translateY(-50%) rotate(360deg); }
        }
        .ec-rack-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 14px;
        }
        @media (max-width: 1024px) {
          .ec-stage-grid { grid-template-columns: 1fr !important; }
          .ec-stage-left { padding-right: 0 !important; }
          .ec-liner { margin-left: 0 !important; padding-left: 36px !important; }
          .ec-vinyl { display: none !important; }
          .ec-rack-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .ec-rack-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </section>
  );
}

// ── Rack sleeve component ────────────────────────────────────────────────────
function RackSleeve({
  beat,
  lean,
  onSelect,
  index,
}: {
  beat: Beat;
  lean: number;
  onSelect: () => void;
  index: number;
}) {
  const [hover, setHover] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "transparent",
        border: "none",
        padding: 0,
        cursor: "pointer",
        textAlign: "left",
        transform: hover
          ? "translateY(-6px) rotate(0)"
          : `translateY(0) rotate(${lean}deg)`,
        transformOrigin: "bottom center",
        transition: "transform 600ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          width: "100%",
          background: `url('${beat.artwork_url}') center/cover`,
          boxShadow: hover
            ? "0 24px 40px rgba(13,12,10,0.25)"
            : "0 8px 18px rgba(13,12,10,0.12)",
          transition: "box-shadow 400ms",
          outline: hover ? `1px solid ${GOLD_BRIGHT}` : "1px solid rgba(13,12,10,0.06)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: "0.22em",
            background: PAPER,
            color: INK,
            padding: "3px 7px",
            fontWeight: 600,
          }}
        >
          {num}
        </div>
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: hover ? "rgba(13,12,10,0.30)" : "transparent",
            transition: "background 300ms",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: GOLD,
              color: PAPER,
              display: "grid",
              placeItems: "center",
              opacity: hover ? 1 : 0,
              transform: hover ? "scale(1)" : "scale(0.7)",
              transition: "opacity 300ms, transform 400ms cubic-bezier(0.16,1,0.3,1)",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: INK,
            lineHeight: 1.2,
          }}
        >
          {beat.title}{" "}
          <span style={{ color: INK_MUTE, fontWeight: 400 }}>/ {beat.bpm}</span>
        </div>
        <div
          style={{
            marginTop: 4,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: SANS,
            fontSize: 12,
            color: INK_MUTE,
            lineHeight: 1.3,
          }}
        >
          <span>
            {beat.mood} · {beat.genre}
          </span>
          <span style={{ color: INK, fontWeight: 600 }}>${beat.price_basic}</span>
        </div>
      </div>
    </button>
  );
}
