"use client";

import { useMemo, useState } from "react";
import { eventsCatalog, type EventRecord } from "@/lib/events";
import { BoxOfficeModal } from "./box-office-modal";

const SERIF = `"Cinzel", "Cormorant Garamond", Georgia, serif`;
const SANS  = `"Space Grotesk", "Inter Tight", "Helvetica Neue", Arial, sans-serif`;
const MONO  = `"JetBrains Mono", ui-monospace, monospace`;

// ── 7×9 letter bitmaps for AGENDA ────────────────────────────────────────────
const LETTERS: Record<string, string[]> = {
  A: ["0011100", "0100010", "1000001", "1000001", "1000001", "1111111", "1000001", "1000001", "1000001"],
  G: ["0111110", "1000001", "1000000", "1000000", "1001111", "1000001", "1000001", "1000001", "0111110"],
  E: ["1111111", "1000000", "1000000", "1000000", "1111110", "1000000", "1000000", "1000000", "1111111"],
  N: ["1000001", "1100001", "1010001", "1001001", "1000101", "1000011", "1000001", "1000001", "1000001"],
  D: ["1111110", "1000001", "1000001", "1000001", "1000001", "1000001", "1000001", "1000001", "1111110"],
};

type Bulb = { cx: number; cy: number; on: boolean };

function bulbsForWord(word: string, cell: number, letterGap: number) {
  const bulbs: Bulb[] = [];
  let x = 0;
  for (const ch of word.toUpperCase()) {
    const grid = LETTERS[ch];
    if (!grid) {
      x += cell * 3 + letterGap;
      continue;
    }
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        bulbs.push({
          cx: x + c * cell + cell / 2,
          cy: r * cell + cell / 2,
          on: grid[r][c] === "1",
        });
      }
    }
    x += grid[0].length * cell + letterGap;
  }
  return { bulbs, width: x - letterGap, height: 9 * cell };
}

function MarqueeWord({ word, cell = 22, letterGap = 26 }: { word: string; cell?: number; letterGap?: number }) {
  const { bulbs, width, height } = useMemo(() => bulbsForWord(word, cell, letterGap), [word, cell, letterGap]);
  const r = cell * 0.34;

  return (
    <svg
      viewBox={`-20 -20 ${width + 40} ${height + 40}`}
      width="min(1180px, 92%)"
      style={{ display: "block", overflow: "visible" }}
      aria-label={word}
    >
      <defs>
        <radialGradient id="bulb-on" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#fff6d4" />
          <stop offset="30%" stopColor="#f3d27a" />
          <stop offset="100%" stopColor="#a47b3c" />
        </radialGradient>
        <radialGradient id="bulb-off" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#3a322a" />
          <stop offset="100%" stopColor="#1a1612" />
        </radialGradient>
        <filter id="bulb-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation={3} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {/* halo behind ON bulbs */}
      {bulbs.filter((b) => b.on).map((b, i) => (
        <circle key={"h" + i} cx={b.cx} cy={b.cy} r={r * 2.1} fill="#e8c870" opacity={0.13} />
      ))}
      {/* bulbs */}
      {bulbs.map((b, i) => (
        <g key={i}>
          <circle
            cx={b.cx}
            cy={b.cy}
            r={r}
            fill={b.on ? "url(#bulb-on)" : "url(#bulb-off)"}
            stroke={b.on ? "rgba(255,243,200,0.5)" : "rgba(255,255,255,0.05)"}
            strokeWidth={0.6}
            style={
              b.on
                ? {
                    animation: `marquee-flicker ${3 + (Math.floor(b.cx) % 5) * 0.4}s ease-in-out infinite`,
                    animationDelay: `${(Math.floor(b.cx) % 7) * 0.2}s`,
                    filter: "url(#bulb-glow)",
                  }
                : undefined
            }
          />
          {b.on && (
            <circle cx={b.cx - r * 0.32} cy={b.cy - r * 0.32} r={r * 0.22} fill="#fffaea" opacity={0.9} />
          )}
        </g>
      ))}
    </svg>
  );
}

// ── Barcode ──────────────────────────────────────────────────────────────────
function Barcode({ width = 188, height = 28, dark = "#0d0a07" }: { width?: number; height?: number; dark?: string }) {
  const bars = useMemo(() => {
    const out: { x: number; w: number; on: boolean }[] = [];
    let x = 0;
    let s = 7;
    while (x < width) {
      s = (s * 9301 + 49297) % 233280;
      const w = 1 + (s % 4);
      out.push({ x, w, on: x % 5 === 0 ? true : (s % 233280) / 233280 > 0.45 });
      x += w + 1;
    }
    return out;
  }, [width]);
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      {bars.map((b, i) => (b.on ? <rect key={i} x={b.x} y={0} width={b.w} height={height} fill={dark} /> : null))}
    </svg>
  );
}

// ── Ticket stub ──────────────────────────────────────────────────────────────
function TicketStub({ event, onBuy }: { event: EventRecord; onBuy: (e: EventRecord) => void }) {
  const [hover, setHover] = useState(false);
  const free = event.price === 0;
  const tear = hover ? 1 : 0;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Buy ticket for ${event.name}`}
      onClick={() => onBuy(event)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onBuy(event);
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="ma-ticket"
      style={{
        position: "relative",
        background: "#f0e6d2",
        color: "#0d0a07",
        fontFamily: SANS,
        display: "grid",
        gridTemplateColumns: "1fr 220px",
        alignItems: "stretch",
        boxShadow: hover
          ? "0 24px 60px rgba(0,0,0,0.7), 0 0 50px rgba(232,200,112,0.18), 0 6px 14px rgba(0,0,0,0.45)"
          : "0 14px 36px rgba(0,0,0,0.55), 0 4px 10px rgba(0,0,0,0.35)",
        transform: hover ? "translateY(-6px) rotate(-0.4deg)" : "translateY(0) rotate(0)",
        transition: "all 500ms cubic-bezier(0.16,1,0.3,1)",
        cursor: "pointer",
        overflow: "hidden",
        border: "1px solid #c9bd9c",
      }}
    >
      {/* MAIN HALF */}
      <div
        style={{
          position: "relative",
          padding: "22px 26px 22px 28px",
          background: `
            repeating-linear-gradient(135deg, transparent 0 18px, rgba(13,10,7,0.02) 18px 19px),
            #f0e6d2`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.22em",
            color: "#5a4f37",
            textTransform: "uppercase",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span>Ref · {event.ticketRef}</span>
          <span style={{ padding: "3px 9px", border: "1px solid #0d0a07", color: "#0d0a07", fontWeight: 700 }}>
            {event.status}
          </span>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "110px 1fr",
            gap: 22,
            alignItems: "center",
          }}
        >
          <div style={{ borderRight: "1px solid #0d0a07", paddingRight: 16, textAlign: "right" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.28em", color: "#5a4f37", textTransform: "uppercase" }}>
              {event.monthShort}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: 64,
                lineHeight: 0.85,
                letterSpacing: "-0.04em",
                marginTop: 6,
                color: "#0d0a07",
              }}
            >
              {String(event.day).padStart(2, "0")}
            </div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.2em", color: "#5a4f37", marginTop: 6 }}>
              {event.year}
            </div>
          </div>
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.28em",
                color: "#5a4f37",
                textTransform: "uppercase",
              }}
            >
              {event.typeFr} · {event.type}
            </div>
            <h3
              style={{
                margin: "6px 0 8px",
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: 28,
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                color: "#0d0a07",
              }}
            >
              {event.name}
            </h3>
            <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 500, color: "#0d0a07" }}>
              {event.venue} · <span style={{ color: "#5a4f37" }}>{event.city}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            paddingTop: 14,
            borderTop: "1px dashed #8a7b56",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12,
          }}
        >
          {[
            ["Doors", event.doors || "—"],
            ["Show", event.time],
            ["Section", "GA"],
            ["Cap.", String(event.capacity)],
          ].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.24em", color: "#5a4f37", textTransform: "uppercase" }}>
                {k}
              </div>
              <div style={{ fontFamily: SERIF, fontSize: 17, marginTop: 3, color: "#0d0a07", fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PERFORATION */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "calc(100% - 220px)",
          top: 0,
          bottom: 0,
          width: 1,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `repeating-linear-gradient(180deg, #0d0a07 0 6px, transparent 6px 12px)`,
            opacity: 0.4,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -8,
            left: -8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#050403",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -8,
            left: -8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#050403",
          }}
        />
      </div>

      {/* STUB HALF */}
      <div
        style={{
          position: "relative",
          padding: "18px 16px",
          background: "#e6dcc3",
          display: "flex",
          flexDirection: "column",
          transform: `translateX(${tear * 18}px) rotate(${tear * 2}deg)`,
          transition: "transform 500ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: hover ? "8px 0 18px rgba(0,0,0,0.25)" : "none",
        }}
      >
        <div
          style={{
            border: "2px solid #a47b3c",
            color: "#a47b3c",
            padding: "5px 10px",
            textAlign: "center",
            fontFamily: MONO,
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: "0.32em",
            transform: "rotate(-3deg)",
            alignSelf: "center",
            marginTop: 4,
          }}
        >
          ADMIT ONE
        </div>

        <div
          style={{
            marginTop: 14,
            fontFamily: MONO,
            fontSize: 9,
            letterSpacing: "0.22em",
            color: "#5a4f37",
            textTransform: "uppercase",
          }}
        >
          {event.ticketRef}
        </div>

        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 56,
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            color: "#0d0a07",
            marginTop: 8,
          }}
        >
          {String(event.day).padStart(2, "0")}
        </div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.26em",
            color: "#5a4f37",
            textTransform: "uppercase",
          }}
        >
          {event.monthShort} · {event.year}
        </div>

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.22em", color: "#5a4f37", textTransform: "uppercase" }}>
            Price
          </span>
          <span style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 600, color: "#0d0a07" }}>
            {free ? "Free" : `$${event.price}`}
          </span>
        </div>

        <div style={{ marginTop: 10 }}>
          <Barcode width={188} height={28} dark="#0d0a07" />
        </div>

        <div
          aria-hidden
          style={{
            position: "absolute",
            left: -10,
            top: "50%",
            transform: "translateY(-50%)",
            writingMode: "vertical-rl",
            fontFamily: MONO,
            fontSize: 8,
            letterSpacing: "0.32em",
            color: "#8a7b56",
            textTransform: "uppercase",
            opacity: hover ? 0 : 1,
            transition: "opacity 300ms",
          }}
        >
          · · · tear · · ·
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export function MarqueeAgenda() {
  const events = eventsCatalog;
  const [activeEvent, setActiveEvent] = useState<EventRecord | null>(null);

  return (
    <section
      aria-label="CBA Agenda"
      style={{
        minHeight: "100vh",
        background: `
          radial-gradient(ellipse 70% 50% at 50% 0%, rgba(232,200,112,0.10), transparent 65%),
          radial-gradient(ellipse 60% 30% at 50% 100%, rgba(106, 47, 23, 0.25), transparent 70%),
          linear-gradient(180deg, #0a0908 0%, #050403 100%)`,
        color: "#f7f0e3",
        fontFamily: SANS,
        position: "relative",
        overflow: "hidden",
        paddingBottom: 40,
      }}
    >
      {/* Curtain gradients on the sides */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 80,
          background: `linear-gradient(90deg, rgba(106,30,18,0.55) 0%, transparent 100%)`,
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          right: 0,
          width: 80,
          background: `linear-gradient(270deg, rgba(106,30,18,0.55) 0%, transparent 100%)`,
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      {/* Top bar */}
      <div
        className="ma-topbar"
        style={{
          position: "relative",
          zIndex: 2,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          padding: "32px 80px 0",
          gap: 12,
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.32em", color: "#cdbba0", textTransform: "uppercase" }}>
          ● Tonight in Montréal · Box office open
        </span>
        <span
          style={{
            justifySelf: "end",
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.32em",
            color: "#7c6f55",
            textTransform: "uppercase",
            textAlign: "right",
          }}
        >
          Spring season · 2026 · {events.length} dates
        </span>
      </div>

      {/* AGENDA marquee title */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "44px 0 0",
        }}
      >
        <MarqueeWord word="AGENDA" cell={22} letterGap={26} />
      </div>

      {/* Sub */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          marginTop: 30,
          padding: "0 24px",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontWeight: 400,
            fontSize: "clamp(1.1rem, 2.2vw, 1.6rem)",
            lineHeight: 1.3,
            color: "#cdbba0",
            letterSpacing: "0.01em",
          }}
        >
          Prochains rendez-vous — sessions d&apos;écoute, soirées DJ, portes ouvertes.
        </p>
      </div>

      {/* Divider with ticket nick */}
      <div
        className="ma-divider"
        style={{
          margin: "44px 80px 28px",
          height: 1,
          position: "relative",
          background: "rgba(232,200,112,0.18)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -10,
            transform: "translateX(-50%)",
            padding: "0 14px",
            background: "#050403",
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.4em",
            color: "#7c6f55",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          · On stage ·
        </div>
      </div>

      {/* Three ticket stubs */}
      <div
        className="ma-tickets"
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          gap: 18,
          padding: "0 80px 36px",
        }}
      >
        {events.map((e) => (
          <TicketStub key={e.id} event={e} onBuy={setActiveEvent} />
        ))}
      </div>

      {/* Footer */}
      <div
        className="ma-footer"
        style={{
          position: "relative",
          zIndex: 2,
          padding: "16px 80px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          flexWrap: "wrap",
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.28em",
          color: "#7c6f55",
          textTransform: "uppercase",
        }}
      >
        <span>● Will-call opens 1h before doors</span>
        <a
          href="#"
          style={{
            color: "#e8c870",
            borderBottom: "1px solid #e8c870",
            paddingBottom: 4,
            textDecoration: "none",
          }}
        >
          Tous les événements →
        </a>
      </div>

      <style jsx>{`
        @keyframes marquee-flicker {
          0%, 70%, 100% { opacity: 1; }
          72%, 76% { opacity: 0.55; }
          74% { opacity: 0.9; }
        }
        @media (max-width: 720px) {
          .ma-topbar {
            grid-template-columns: 1fr !important;
            padding: 28px 24px 0 !important;
          }
          .ma-divider {
            margin: 36px 24px 22px !important;
          }
          .ma-tickets {
            padding: 0 24px 28px !important;
          }
          .ma-footer {
            padding: 16px 24px 28px !important;
          }
          :global(.ma-ticket) {
            grid-template-columns: 1fr 160px !important;
          }
        }
        @media (max-width: 520px) {
          :global(.ma-ticket) {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {activeEvent && <BoxOfficeModal event={activeEvent} onClose={() => setActiveEvent(null)} />}
    </section>
  );
}
