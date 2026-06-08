"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
  startTransition
} from "react";
import { Beat } from "@/lib/beats";

type AudioContextValue = {
  currentBeat: Beat | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  playBeat: (beat: Beat) => Promise<void>;
  pauseBeat: () => void;
  resumeBeat: () => Promise<void>;
  toggleBeat: (beat: Beat) => Promise<void>;
};

const PlaybackContext = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      startTransition(() => {
        setProgress(audio.currentTime);
      });
    };

    const handleLoadedMetadata = () => {
      startTransition(() => {
        setDuration(audio.duration || 0);
      });
    };

    const handleEnded = () => {
      startTransition(() => {
        setIsPlaying(false);
        setProgress(0);
      });
      audio.currentTime = 0;
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  async function playBeat(beat: Beat) {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.src !== new URL(beat.audio_src, window.location.origin).toString()) {
      audio.src = beat.audio_src;
      audio.currentTime = 0;
      setCurrentBeat(beat);
      setProgress(0);
      // Duration will be set by the loadedmetadata event handler
    }

    await audio.play();
    setCurrentBeat(beat);
    setIsPlaying(true);
  }

  function pauseBeat() {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }

  async function resumeBeat() {
    const audio = audioRef.current;
    if (!audio || !currentBeat) return;
    await audio.play();
    setIsPlaying(true);
  }

  async function toggleBeat(beat: Beat) {
    if (currentBeat?.id === beat.id && isPlaying) {
      pauseBeat();
      return;
    }

    if (currentBeat?.id === beat.id && !isPlaying) {
      await resumeBeat();
      return;
    }

    await playBeat(beat);
  }

  return (
    <PlaybackContext.Provider
      value={{
        currentBeat,
        isPlaying,
        progress,
        duration,
        playBeat,
        pauseBeat,
        resumeBeat,
        toggleBeat
      }}
    >
      {children}
    </PlaybackContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(PlaybackContext);

  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioProvider");
  }

  return context;
}
