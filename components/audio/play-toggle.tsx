"use client";

import { Beat } from "@/lib/beats";
import { useAudioPlayer } from "@/lib/audio";

export function PlayToggle({ beat }: { beat: Beat }) {
  const { currentBeat, isPlaying, toggleBeat } = useAudioPlayer();
  const isCurrent = currentBeat?.id === beat.id;

  return (
    <button
      type="button"
      className={`play-toggle ${isCurrent && isPlaying ? "active" : ""}`}
      onClick={() => {
        void toggleBeat(beat);
      }}
      aria-label={`${isCurrent && isPlaying ? "Pause" : "Play"} ${beat.title}`}
    >
      <span>{isCurrent && isPlaying ? "Pause" : "Play"}</span>
    </button>
  );
}
