"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { ARCHIVE, FEATURED, applyFilters } from "@/lib/radio/archive";
import type { ArchiveItem, FeaturedItem, FilterState } from "@/lib/radio/archive";
import { fallbackRadioArchive, fetchRadioArchive } from "@/lib/radio/api";
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
  const fallback = useMemo(() => fallbackRadioArchive(), []);
  const [archive, setArchive] = useState<ArchiveItem[]>(fallback.episodes);
  const [featured, setFeatured] = useState<FeaturedItem>(fallback.featured ?? FEATURED);

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
    () => applyFilters(archive, filters, sortDial),
    [archive, filters, sortDial],
  );

  /* ── all items flat (archive + featured) ─────────────────── */
  const allItems = useMemo(
    () => [{ ...featured, variant: "portable" as const, moods: [], plays: 0 }, ...archive],
    [archive, featured],
  );

  useEffect(() => {
    let cancelled = false;

    fetchRadioArchive()
      .then((data) => {
        if (cancelled) return;
        setArchive(data.episodes.length ? data.episodes : ARCHIVE);
        setFeatured(data.featured ?? FEATURED);
      })
      .catch(() => {
        if (cancelled) return;
        setArchive(ARCHIVE);
        setFeatured(FEATURED);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
  const featuredPlaying = playingId === featured.id;

  return (
    <div className={styles.page}>
      <Hero
        onStartTuning={scrollToArchive}
        recordingCount={archive.length}
      />

      <Featured
        item={featured}
        isPlaying={featuredPlaying}
        onToggle={() => toggle(featured.id)}
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
