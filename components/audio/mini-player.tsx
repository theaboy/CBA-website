"use client";

import Image from "next/image";
import { useAudioPlayer } from "@/lib/audio";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
}

export function MiniPlayer() {
  const { currentBeat, isPlaying, progress, duration, pauseBeat, resumeBeat } = useAudioPlayer();

  if (!currentBeat) return null;

  const width = duration ? Math.min((progress / duration) * 100, 100) : 0;

  return (
    <aside className="mini-player">
      <div className="mini-player-art">
        <Image src={currentBeat.artworkSrc} alt={currentBeat.title} width={84} height={84} />
      </div>
      <div className="mini-player-copy">
        <p className="eyebrow">Now Playing</p>
        <h3>{currentBeat.title}</h3>
        <p>{currentBeat.genre} / {currentBeat.mood} / {currentBeat.bpm} BPM</p>
        <div className="mini-player-progress">
          <div className="mini-player-progress-bar" style={{ width: `${width}%` }} />
        </div>
        <div className="mini-player-meta">
          <span>{formatTime(progress)}</span>
          <span>{currentBeat.duration}</span>
        </div>
      </div>
      <div className="mini-player-actions">
        <button
          type="button"
          className="solid-chip"
          onClick={() => {
            if (isPlaying) {
              pauseBeat();
              return;
            }
            void resumeBeat();
          }}
        >
          {isPlaying ? "Pause" : "Resume"}
        </button>
        <span className="ghost-chip">Inquiry Flow Next</span>
      </div>
    </aside>
  );
}
