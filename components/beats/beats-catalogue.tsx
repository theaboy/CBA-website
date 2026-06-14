"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  type Beat,
  type BeatGenre,
  type BeatMood,
  type BeatSort,
  beatGenres,
  beatMoods,
} from "@/lib/beats";

// ── Paper palette (shared with the /beats showcase) ───────────────────────────
const PAPER       = "#f5f1e8";
const INK         = "#0d0c0a";
const INK_MUTE    = "#8a8580";
const GOLD        = "#a47b3c";
const GOLD_BRIGHT = "#c9a961";

const SERIF = `"Cinzel", "Cormorant Garamond", Georgia, serif`;
const SANS  = `"Space Grotesk", "Inter Tight", "Helvetica Neue", Arial, sans-serif`;
const MONO  = `"JetBrains Mono", ui-monospace, monospace`;

const indexLabel = (i: number) => String(i + 1).padStart(2, "0");

type GenreFilter = BeatGenre | "All";
type MoodFilter = BeatMood | "All";

const SORT_OPTIONS: { value: BeatSort; label: string }[] = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "price-low", label: "Price ↑" },
  { value: "price-high", label: "Price ↓" },
  { value: "bpm-low", label: "BPM ↑" },
  { value: "bpm-high", label: "BPM ↓" },
];

function sortBeats(beats: Beat[], sort: BeatSort): Beat[] {
  const sorted = [...beats];
  switch (sort) {
    case "price-low":  return sorted.sort((a, b) => a.price_basic - b.price_basic);
    case "price-high": return sorted.sort((a, b) => b.price_basic - a.price_basic);
    case "popular":    return sorted.sort((a, b) => b.play_count - a.play_count);
    case "bpm-low":    return sorted.sort((a, b) => a.bpm - b.bpm);
    case "bpm-high":   return sorted.sort((a, b) => b.bpm - a.bpm);
    case "latest":
    default:
      return sorted.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }
}

export function BeatsCatalogue({ beats }: { beats: Beat[] }) {
  const [genre, setGenre] = useState<GenreFilter>("All");
  const [mood, setMood] = useState<MoodFilter>("All");
  const [sort, setSort] = useState<BeatSort>("latest");

  const filtered = useMemo(() => {
    const matched = beats.filter((b) => {
      if (genre !== "All" && b.genre !== genre) return false;
      if (mood !== "All" && b.mood !== mood) return false;
      return true;
    });
    return sortBeats(matched, sort);
  }, [beats, genre, mood, sort]);

  return (
    <section style={{ background: PAPER, color: INK, fontFamily: SANS, minHeight: "100vh", padding: "80px 60px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ marginBottom: 40 }}>
          <Link
            href="/beats"
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.32em", color: GOLD, textTransform: "uppercase", textDecoration: "none" }}
          >
            ← Back to showcase
          </Link>
          <h1 style={{ margin: "16px 0 0", fontFamily: SERIF, fontWeight: 500, fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1, letterSpacing: "-0.01em", color: INK }}>
            Full catalogue
          </h1>
          <p style={{ margin: "14px 0 0", maxWidth: 520, fontFamily: SANS, fontSize: 15, lineHeight: 1.5, color: INK_MUTE }}>
            Every instrumental in rotation. Filter by genre, mood, and order — tap a sleeve for licensing and stems.
          </p>
        </div>

        {/* ── Filters ────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between", borderTop: `1px solid ${INK}`, borderBottom: `1px solid rgba(13,12,10,0.18)`, padding: "18px 0", marginBottom: 36 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
            <PaperSelect label="Genre" value={genre} onChange={(v) => setGenre(v as GenreFilter)} options={["All", ...beatGenres]} />
            <PaperSelect label="Mood" value={mood} onChange={(v) => setMood(v as MoodFilter)} options={["All", ...beatMoods]} />
            <PaperSelect label="Order" value={sort} onChange={(v) => setSort(v as BeatSort)} options={SORT_OPTIONS} />
          </div>
          <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.24em", color: INK_MUTE, textTransform: "uppercase" }}>
            {indexLabel(filtered.length - 1)} {filtered.length === 1 ? "record" : "records"}
          </span>
        </div>

        {/* ── Grid ───────────────────────────────────────────────── */}
        {filtered.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 28 }}>
            {filtered.map((b, i) => (
              <CatalogueCard key={b.id} beat={b} index={i} />
            ))}
          </div>
        ) : (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.32em", color: GOLD, textTransform: "uppercase" }}>No matches</div>
            <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 500, fontSize: 28, color: INK }}>
              Shift the filters and the catalogue opens back up.
            </h3>
          </div>
        )}
      </div>
    </section>
  );
}

/* ── Paper-styled select ───────────────────────────────────────────────────── */
function PaperSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[];
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: "0.28em", color: INK_MUTE, textTransform: "uppercase" }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          appearance: "none",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${INK}`,
          color: INK,
          fontFamily: SANS,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.04em",
          padding: "4px 24px 6px 0",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {opts.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

/* ── Catalogue card (paper sleeve → beat detail) ───────────────────────────── */
function CatalogueCard({ beat, index }: { beat: Beat; index: number }) {
  const [hover, setHover] = useState(false);
  const num = String(index + 1).padStart(2, "0");

  return (
    <Link
      href={`/beats/${beat.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ textDecoration: "none", color: "inherit", display: "block", transform: hover ? "translateY(-6px)" : "translateY(0)", transition: "transform 500ms cubic-bezier(0.16,1,0.3,1)" }}
    >
      <div
        style={{
          position: "relative",
          aspectRatio: "1 / 1",
          width: "100%",
          background: `url('${beat.artwork_url}') center/cover`,
          boxShadow: hover ? "0 24px 40px rgba(13,12,10,0.25)" : "0 8px 18px rgba(13,12,10,0.12)",
          transition: "box-shadow 400ms",
          outline: hover ? `1px solid ${GOLD_BRIGHT}` : "1px solid rgba(13,12,10,0.06)",
        }}
      >
        <div style={{ position: "absolute", top: 10, left: 10, fontFamily: MONO, fontSize: 9, letterSpacing: "0.22em", background: PAPER, color: INK, padding: "3px 7px", fontWeight: 600 }}>
          {num}
        </div>
        <div style={{ position: "absolute", inset: 0, background: hover ? "rgba(13,12,10,0.30)" : "transparent", transition: "background 300ms", display: "grid", placeItems: "center" }}>
          <div
            style={{
              width: 52, height: 52, borderRadius: "50%", background: GOLD, color: PAPER,
              display: "grid", placeItems: "center",
              opacity: hover ? 1 : 0, transform: hover ? "scale(1)" : "scale(0.7)",
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
        <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: INK, lineHeight: 1.2 }}>
          {beat.title} <span style={{ color: INK_MUTE, fontWeight: 400 }}>/ {beat.bpm}</span>
        </div>
        <div style={{ marginTop: 4, display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, color: INK_MUTE, lineHeight: 1.3 }}>
          <span>{beat.mood} · {beat.genre}</span>
          <span style={{ color: INK, fontWeight: 600 }}>${beat.price_basic}</span>
        </div>
      </div>
    </Link>
  );
}
