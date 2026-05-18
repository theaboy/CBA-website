// components/radio/radio-player-bar.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, X } from "lucide-react";
import styles from "./radio-player-bar.module.css";
import { RadioKnob } from "@/components/radio/radio-knob";
import type { RadioEpisode } from "@/lib/radio/catalog";

type Props = {
  episode: RadioEpisode;
  onClose: () => void;
};

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function RadioPlayerBar({ episode, onClose }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(episode.durationSeconds);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const audio = new Audio(episode.audioSrc);
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("timeupdate", () => setCurrent(audio.currentTime));
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", () => setIsPlaying(false));

    audio.play().then(() => setIsPlaying(true)).catch(() => {});

    return () => {
      audio.pause();
      audio.src = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episode.id]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); }
    else { audio.play(); setIsPlaying(true); }
  }

  function handleScrubClick(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrent(ratio * duration);
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className={styles.bar} role="region" aria-label="Lecteur radio">
      {/* Episode info */}
      <div className={styles.episodeInfo}>
        <p className={styles.episodeTitle}>{episode.title}</p>
        <p className={styles.episodeHost}>{episode.host}</p>
      </div>

      {/* Play / Pause knob */}
      <RadioKnob
        isPlaying={isPlaying}
        onClick={togglePlay}
        size="md"
      />

      {/* Scrub bar */}
      <div className={styles.scrubArea}>
        <span className={styles.time}>{formatTime(current)}</span>
        <div
          className={styles.scrubTrack}
          onClick={handleScrubClick}
          role="slider"
          aria-label="Progression"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.scrubFill} style={{ width: `${progress}%` }} />
          <div className={styles.scrubThumb} style={{ left: `${progress}%` }} />
        </div>
        <span className={`${styles.time} ${styles.right}`}>{formatTime(duration)}</span>
      </div>

      {/* Volume */}
      <div className={styles.volumeArea}>
        <Volume2 size={14} className={styles.volumeIcon} />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={handleVolume}
          className={styles.volumeSlider}
          aria-label="Volume"
        />
      </div>

      {/* Close */}
      <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer le lecteur">
        <X size={14} />
      </button>
    </div>
  );
}
