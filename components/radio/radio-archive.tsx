"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import styles from "./radio-archive.module.css";
import { RadioKnob } from "@/components/radio/radio-knob";
import { radioEpisodes, formatDate, type RadioEpisode } from "@/lib/radio/catalog";

// Waveform bar heights — static to avoid hydration mismatch
const WAVE_BARS = [
  { h: 40, d: 1.1 }, { h: 75, d: 0.8 }, { h: 55, d: 1.5 }, { h: 88, d: 0.7 },
  { h: 48, d: 1.2 }, { h: 95, d: 0.9 }, { h: 62, d: 1.6 }, { h: 38, d: 1.0 },
  { h: 70, d: 0.6 }, { h: 52, d: 1.3 }, { h: 82, d: 0.8 }, { h: 44, d: 1.4 },
  { h: 66, d: 1.1 }, { h: 90, d: 0.7 }, { h: 58, d: 1.5 }, { h: 76, d: 0.9 },
  { h: 35, d: 1.2 }, { h: 85, d: 0.6 }, { h: 60, d: 1.7 }, { h: 72, d: 1.0 },
  { h: 45, d: 0.8 }, { h: 80, d: 1.3 }, { h: 50, d: 0.9 }, { h: 42, d: 1.1 },
  { h: 68, d: 1.4 }, { h: 55, d: 0.7 }, { h: 78, d: 1.2 }, { h: 38, d: 1.6 },
  { h: 92, d: 0.8 }, { h: 48, d: 1.0 }, { h: 65, d: 1.3 }, { h: 82, d: 0.9 },
  { h: 44, d: 1.5 }, { h: 71, d: 0.6 }, { h: 57, d: 1.1 }, { h: 88, d: 0.8 },
  { h: 40, d: 1.4 }, { h: 76, d: 1.0 }, { h: 63, d: 0.7 }, { h: 50, d: 1.2 },
  { h: 84, d: 0.9 }, { h: 46, d: 1.6 }, { h: 69, d: 1.1 }, { h: 55, d: 0.8 },
  { h: 74, d: 1.3 }, { h: 42, d: 0.7 }, { h: 88, d: 1.0 }, { h: 60, d: 1.5 },
];

type Props = {
  activeId: string | null;
  isPlaying: boolean;
  onSelect: (episode: RadioEpisode) => void;
};

export function RadioArchive({ activeId, isPlaying, onSelect }: Props) {
  return (
    <div className={styles.page}>
      {/* ── Station bar ── */}
      <div className={styles.stationBar}>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={11} /> CBA
        </Link>
        <div className={styles.onAir}>
          <span className={styles.onAirDot} aria-hidden />
          On Air
        </div>
        <span className={styles.freqTag}>Archives · Montréal</span>
      </div>

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>CBA Radio · La Fréquence</span>

          <h1 className={styles.heroTitle}>La Fréquence</h1>

          {/* Animated waveform */}
          <div className={styles.waveform} aria-hidden>
            {WAVE_BARS.map((bar, i) => (
              <div
                key={i}
                className={styles.waveBar}
                style={{
                  height: `${bar.h}%`,
                  "--wave-dur": `${bar.d}s`,
                  animationDelay: `${(i * 0.04).toFixed(2)}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <p className={styles.heroSub}>
            L&apos;archive sonore du collectif — émissions, sets et sessions
            enregistrés depuis le Plateau-Mont-Royal.
          </p>
        </div>
      </header>

      {/* ── Archive ── */}
      <div className={styles.archive}>
        <div className={styles.archiveHead}>
          <p className={styles.archiveHeadLabel}>Toutes les émissions</p>
          <span className={styles.archiveCount}>{radioEpisodes.length} épisodes</span>
        </div>

        {radioEpisodes.map((ep, i) => {
          const isActive = ep.id === activeId;
          return (
            <button
              key={ep.id}
              className={`${styles.row} ${isActive ? styles.active : ""}`}
              onClick={() => onSelect(ep)}
              aria-pressed={isActive}
              aria-label={`${isActive && isPlaying ? "Pause" : "Écouter"} — ${ep.title}`}
            >
              <span className={styles.rowNum}>{String(i + 1).padStart(2, "0")}</span>

              <div className={styles.rowMain}>
                <h2 className={styles.rowTitle}>{ep.title}</h2>
                <div className={styles.rowMeta}>
                  <span>{ep.host}</span>
                  <span className={styles.rowMetaSep}>·</span>
                  <span>{ep.genre}</span>
                </div>
              </div>

              <span className={styles.rowDate}>{formatDate(ep.date)}</span>
              <span className={styles.rowDur}>{ep.duration}</span>

              <RadioKnob
                isPlaying={isActive && isPlaying}
                size="sm"
                asDiv
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
