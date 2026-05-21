"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ARCHIVE, FEATURED, applyFilters } from "@/lib/radio/archive";
import type { FilterState } from "@/lib/radio/archive";
import {
  Hero,
  Featured,
  FilterPanel,
  ArchiveList,
  SignalNotes,
  MiniPlayer,
} from "@/components/radio/freq/sections";
import styles from "@/components/radio/freq/fa.module.css";

const SORT_DEFAULT = "Récent";

export default function FrequencyArchivePage() {
  /* ── playback state ─────────────────────────────────────── */
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress]   = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /* ── filter / sort state ────────────────────────────────── */
  const [filters, setFilters] = useState<FilterState>({
    category: "All",
    moods: [],
    search: "",
  });
  const [sortDial, setSortDial] = useState(SORT_DEFAULT);

  /* ── archive scroll target ─────────────────────────────── */
  const archiveRef = useRef<HTMLElement | null>(null);

  /* ── derived filtered list ──────────────────────────────── */
  const filtered = useMemo(
    () => applyFilters(ARCHIVE, filters, sortDial),
    [filters, sortDial],
  );

  /* ── all items flat (archive + featured) ─────────────────── */
  const allItems = useMemo(
    () => [{ ...FEATURED, variant: "portable" as const, moods: [], plays: 0 }, ...ARCHIVE],
    [],
  );

  function findItem(id: string) {
    return allItems.find((i) => i.id === id) ?? null;
  }

  /* ── toggle playback (single-track enforcement) ─────────── */
  const toggle = useCallback((id: string) => {
    setPlayingId((prev) => {
      if (prev === id) {
        audioRef.current?.pause();
        return null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
      return id;
    });
  }, []);

  /* ── real <audio> wiring ─────────────────────────────────── */
  useEffect(() => {
    if (!playingId) {
      setProgress(0);
      return;
    }

    const item  = findItem(playingId);
    const src   = item ? (item as { audioSrc?: string }).audioSrc : undefined;
    if (!src) return;

    const audio = new Audio(src);
    audioRef.current = audio;
    audio.play().catch(() => {/* autoplay policy — silent */});

    function onTimeUpdate() {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    }
    function onEnded() {
      setPlayingId(null);
      setProgress(0);
    }

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended",      onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended",      onEnded);
      audio.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingId]);

  /* ── scroll CTA ─────────────────────────────────────────── */
  function scrollToArchive() {
    archiveRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ── close mini-player ───────────────────────────────────── */
  function closePlayer() {
    audioRef.current?.pause();
    setPlayingId(null);
    setProgress(0);
  }

  const activeItem     = playingId ? findItem(playingId) : null;
  const featuredPlaying = playingId === FEATURED.id;

  return (
    <div className={styles.page}>
      <Hero
        onStartTuning={scrollToArchive}
        recordingCount={ARCHIVE.length}
      />

      <Featured
        item={FEATURED}
        isPlaying={featuredPlaying}
        onToggle={() => toggle(FEATURED.id)}
      />

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        sortDial={sortDial}
        setSortDial={setSortDial}
      />

      <ArchiveList
        items={filtered}
        playingId={playingId}
        onToggle={toggle}
        archiveRef={archiveRef}
      />

      <SignalNotes />

      {activeItem && (
        <MiniPlayer
          item={activeItem}
          isPlaying={!!playingId}
          onToggle={() => toggle(playingId!)}
          onClose={closePlayer}
          progress={progress}
        />
      )}
    </div>
  );
}
