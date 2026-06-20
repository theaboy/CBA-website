"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { Beat } from "@/lib/beats";
import { useAudioPlayer } from "@/lib/audio";
import { useIsMobile } from "@/components/ui/use-is-mobile";
import { BeatBuyForm } from "@/components/beats/beat-buy-form";
import {
  PAPER,
  PAPER_DEEP,
  INK,
  INK_SOFT,
  INK_MUTE,
  INK_FAINT,
  GOLD,
  LINE_LT,
  LINE_MED,
  SERIF,
  SANS,
  MONO,
} from "@/lib/beats/light-theme";

// Deterministic waveform peaks from a seed (no effects, SSR-stable).
function makePeaks(seed: number, count = 64): number[] {
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

export function BeatPurchase({ beat }: { beat: Beat }) {
  const isMobile = useIsMobile();
  const { currentBeat, isPlaying, toggleBeat } = useAudioPlayer();
  const playing = currentBeat?.id === beat.id && isPlaying;
  const wave = useMemo(() => makePeaks(beat.bpm + 11), [beat.bpm]);

  const chips = [beat.genre, beat.mood, ...beat.tags];

  return (
    <section
      style={{
        background: PAPER,
        color: INK,
        fontFamily: SANS,
        position: "relative",
        overflow: "hidden",
        minHeight: "100%",
        padding: isMobile ? "32px 0 64px" : "48px 0 88px",
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

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: isMobile ? "0 20px" : "0 60px",
        }}
      >
        {/* Breadcrumb */}
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.26em",
            textTransform: "uppercase",
            color: INK_MUTE,
            display: "flex",
            gap: 10,
            alignItems: "center",
          }}
        >
          <Link href="/beats" style={{ color: GOLD, textDecoration: "none" }}>
            Beats
          </Link>
          <span aria-hidden>/</span>
          <span>{beat.title}</span>
        </div>

        {/* Main two-column */}
        <div
          style={{
            marginTop: isMobile ? 24 : 40,
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 0.9fr) minmax(0, 1.1fr)",
            gap: isMobile ? 32 : 56,
            alignItems: "start",
          }}
        >
          {/* Left — artwork + play + waveform */}
          <div>
            <div
              style={{
                position: "relative",
                border: `1px solid ${LINE_MED}`,
                background: PAPER_DEEP,
                padding: 12,
                borderRadius: 2,
              }}
            >
              <div style={{ position: "relative", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: 1 }}>
                <Image
                  src={beat.artwork_url}
                  alt={beat.title}
                  width={960}
                  height={960}
                  priority
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                {/* Play control overlay */}
                <button
                  type="button"
                  onClick={() => void toggleBeat(beat)}
                  aria-label={`${playing ? "Pause" : "Play"} ${beat.title}`}
                  style={{
                    position: "absolute",
                    left: 14,
                    bottom: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 18px 11px 14px",
                    background: playing ? GOLD : INK,
                    color: PAPER,
                    border: "none",
                    borderRadius: 999,
                    cursor: "pointer",
                    fontFamily: SANS,
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    boxShadow: "0 10px 26px rgba(13,12,10,0.3)",
                  }}
                >
                  <span aria-hidden style={{ display: "grid", placeItems: "center", width: 16, height: 16 }}>
                    {playing ? (
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700 }}>❚❚</span>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </span>
                  {playing ? "Pause" : "Play"}
                </button>
              </div>
            </div>

            {/* Waveform */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 52 }}>
                {wave.map((v, i) => {
                  const on = playing && i / wave.length < 0.4;
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
                <span>Preview</span>
                <span>{beat.bpm} BPM</span>
              </div>
            </div>
          </div>

          {/* Right — info + buy */}
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
              {beat.genre} / {beat.mood}
            </div>

            <h1
              style={{
                margin: "14px 0 0",
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: "clamp(2.4rem, 5vw, 3.6rem)",
                lineHeight: 0.96,
                letterSpacing: "-0.02em",
                color: INK,
              }}
            >
              {beat.title}
            </h1>

            {beat.tagline ? (
              <p
                style={{
                  margin: "16px 0 0",
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 17,
                  lineHeight: 1.5,
                  color: INK_SOFT,
                  maxWidth: 460,
                }}
              >
                {beat.tagline}
              </p>
            ) : null}

            {/* Spec strip — BPM + Key */}
            <div
              style={{
                marginTop: 24,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                border: `1px solid ${LINE_MED}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              {[
                ["BPM", String(beat.bpm)],
                ["Key", beat.musical_key],
              ].map(([k, v], i) => (
                <div key={k} style={{ padding: "14px 16px", borderLeft: i ? `1px solid ${LINE_LT}` : "none" }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.24em",
                      textTransform: "uppercase",
                      color: INK_MUTE,
                    }}
                  >
                    {k}
                  </div>
                  <div style={{ marginTop: 4, fontFamily: SERIF, fontSize: 24, fontWeight: 500, color: INK }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            {chips.length > 0 ? (
              <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {chips.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: INK_SOFT,
                      border: `1px solid ${INK_FAINT}`,
                      borderRadius: 999,
                      padding: "6px 12px",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Price */}
            <div
              style={{
                marginTop: 28,
                paddingTop: 24,
                borderTop: `1px solid ${LINE_MED}`,
                display: "flex",
                alignItems: "baseline",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: INK_MUTE,
                }}
              >
                Price
              </span>
              <span style={{ fontFamily: SERIF, fontSize: 44, fontWeight: 500, color: INK, lineHeight: 1 }}>
                ${beat.price_basic}
              </span>
            </div>

            {/* Buy form */}
            <div style={{ marginTop: 28 }}>
              <BeatBuyForm beat={beat} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
