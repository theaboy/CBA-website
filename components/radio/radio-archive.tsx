// components/radio/radio-archive.tsx
"use client";

import { Play, Pause } from "lucide-react";
import styles from "./radio-archive.module.css";
import { radioEpisodes, formatDate, type RadioEpisode } from "@/lib/radio/catalog";

type Props = {
  activeId: string | null;
  isPlaying: boolean;
  onSelect: (episode: RadioEpisode) => void;
};

export function RadioArchive({ activeId, isPlaying, onSelect }: Props) {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroDot} aria-hidden />
            CBA Radio · Archives
          </p>
          <h1 className={styles.heroTitle}>La Fréquence</h1>
          <p className={styles.heroSub}>
            L&apos;archive sonore du collectif CBA — émissions, sets et sessions enregistrés depuis le Plateau-Mont-Royal.
          </p>
        </div>
      </header>

      {/* Archive */}
      <div className={styles.body}>
        <div className={styles.archiveHeader}>
          <p className={styles.archiveLabel}>Toutes les émissions</p>
          <span className={styles.count}>{radioEpisodes.length} épisodes</span>
        </div>

        <div className={styles.grid}>
          {radioEpisodes.map((ep) => {
            const isActive = ep.id === activeId;
            return (
              <button
                key={ep.id}
                className={`${styles.card} ${isActive ? styles.active : ""}`}
                onClick={() => onSelect(ep)}
                aria-pressed={isActive}
                aria-label={`${isActive && isPlaying ? "Pause" : "Écouter"} — ${ep.title}`}
              >
                <div className={styles.cardMeta}>
                  <span className={styles.cardGenre}>{ep.genre}</span>
                  <span className={styles.cardDate}>{formatDate(ep.date)}</span>
                </div>

                <h2 className={styles.cardTitle}>{ep.title}</h2>
                <p className={styles.cardHost}>{ep.host}</p>
                <p className={styles.cardDesc}>{ep.description}</p>

                <div className={styles.cardFooter}>
                  <span className={styles.cardDur}>{ep.duration}</span>
                  <span className={styles.playIndicator} aria-hidden>
                    {isActive && isPlaying ? <Pause size={12} /> : <Play size={12} />}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
