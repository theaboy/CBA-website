"use client";
// Five sections: Hero, Featured, FilterPanel, SignalNotes, MiniPlayer

import styles from "./fa.module.css";
import {
  LED, Knob, Grill, FreqScale, Waveform, Display,
  PlayButton, TapeLabel, Screws,
} from "./ui";
import { RadioCard } from "./radios";
import type { ArchiveItem, FeaturedItem, FilterState } from "@/lib/radio/archive";
import { applyFilters, fmtTime, parseDuration } from "@/lib/radio/archive";

/* ══════════════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════════════ */

export function Hero({
  onStartTuning: _onStartTuning,
  recordingCount: _recordingCount,
}: {
  onStartTuning: () => void;
  recordingCount: number;
}) {
  return (
    <section style={{ height: "52vh", minHeight: 260, display: "flex", alignItems: "center" }}>
      <div className={styles.wrap} style={{ width: "100%" }}>
        <h1
          className={`${styles.display} ${styles.amberGlow}`}
          style={{ fontSize: "clamp(72px, 18vw, 220px)", margin: 0, lineHeight: 0.88, letterSpacing: "-0.02em" }}
        >
          RADIO
        </h1>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   EN VEDETTE
══════════════════════════════════════════════════════════════════ */

export function Featured({
  item,
  isPlaying,
  onToggle,
}: {
  item: FeaturedItem;
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <section style={{ padding: "32px 0 40px" }}>
      <div className={styles.wrap}>
        <div className={styles.sectionHead}>
          <h2>En vedette</h2>
          <span className={styles.sectionMarker}>/ 01 · EN TÊTE D&apos;ARCHIVE</span>
        </div>

        <div
          className={`${styles.radio} ${styles.woodPanel} ${isPlaying ? styles.radioPlaying : ""}`}
          onClick={onToggle}
          role="button"
          tabIndex={0}
          aria-pressed={isPlaying}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
          style={{ cursor: "pointer", padding: "clamp(20px, 3vw, 32px)" }}
        >
          <Screws />

          <div style={{ display: "flex", gap: 20, alignItems: "stretch", flexWrap: "wrap" }}>

            {/* Gauche : grande grille de haut-parleur */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: "1 1 280px", minWidth: 260 }}>
              <Grill variant="dots" height={320} radius={6} style={{ border: "3px solid oklch(48% 0.10 75)", flex: "1 1 auto" }}>
                <div style={{
                  position: "absolute", left: "50%", top: "50%",
                  transform: "translate(-50%, -50%)",
                  padding: "8px 16px",
                  background: "linear-gradient(180deg, oklch(48% 0.10 75), oklch(35% 0.08 70))",
                  color: "oklch(15% 0.02 50)",
                  fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 800, letterSpacing: "0.22em",
                  borderRadius: 2,
                  boxShadow: "inset 0 1px 0 rgba(255,230,180,0.4)",
                }}>CBA · MTL</div>
              </Grill>
            </div>

            {/* Droite : infos + contrôles */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: "1 1 360px", minWidth: 300 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={styles.typeEyebrow}>En vedette · {item.type}</span>
                <LED color="red" pulse={isPlaying} on={isPlaying} label={isPlaying ? "EN COURS" : "EN ATTENTE"} />
              </div>

              <h3 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(32px, 4vw, 48px)",
                margin: 0, lineHeight: 0.95,
                textTransform: "uppercase",
                color: "oklch(92% 0.035 85)",
                letterSpacing: "-0.005em",
              }}>{item.title}</h3>

              <div className={styles.mono} style={{ fontSize: 12, color: "oklch(62% 0.04 70)", letterSpacing: "0.08em" }}>
                {item.source} · {item.date}
              </div>

              <Display height={84} style={{ padding: "14px 18px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: "0.04em" }}>{item.duration}</span>
                    <span className={styles.faded} style={{ fontSize: 11, letterSpacing: "0.22em" }}>MIN · SEC</span>
                  </div>
                  <Waveform width={300} height={22} variant="path" playing={isPlaying} />
                </div>
              </Display>

              {/* Rangée lecture */}
              <div
                onClick={(e) => { e.stopPropagation(); onToggle(); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
                style={{
                  display: "flex", alignItems: "center", gap: 16,
                  padding: "14px 20px",
                  background: "linear-gradient(180deg, oklch(48% 0.10 75), oklch(34% 0.08 70))",
                  border: "1px solid oklch(55% 0.10 75)",
                  borderRadius: 6,
                  cursor: "pointer",
                  color: "oklch(12% 0.02 50)",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,230,180,0.4), inset 0 -2px 4px rgba(0,0,0,0.2)",
                  marginTop: 4,
                }}
              >
                <PlayButton playing={isPlaying} onClick={onToggle} size={56} variant="cream" />
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>
                    {isPlaying ? "En lecture" : "Écouter"}
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.12em", opacity: 0.7 }}>
                    Face A · 00:00 / {item.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   PANNEAU DE FILTRES
══════════════════════════════════════════════════════════════════ */

const CATEGORIES = ["Tout", "Entrevues", "DJ Sets", "Sessions live", "Passages radio"];
const MOODS      = ["Late Night", "Montréal", "Studio", "Underground", "Raw Tape"];
const SORTS      = ["Récent", "Plus long", "Plus écouté"];

export function FilterPanel({
  filters,
  setFilters,
  sortDial,
  setSortDial,
}: {
  filters: FilterState;
  setFilters: (f: FilterState) => void;
  sortDial: string;
  setSortDial: (s: string) => void;
}) {
  const sortAngle = SORTS.indexOf(sortDial) * 60 - 60;

  return (
    <section style={{ padding: "24px 0" }}>
      <div className={styles.wrap}>
        <div className={styles.sectionHead}>
          <h2>Filtres</h2>
          <span className={styles.sectionMarker}>/ AFFINE TA RECHERCHE</span>
        </div>

        <div style={{
          background: "linear-gradient(180deg, oklch(22% 0.025 55), oklch(14% 0.015 50))",
          border: "1px solid oklch(30% 0.03 55)",
          borderRadius: 12,
          padding: "clamp(18px, 2.5vw, 28px)",
          boxShadow: "0 12px 28px -8px rgba(0,0,0,0.55), 0 4px 10px -2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,230,180,0.05)",
        }}>

          {/* Catégories */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
            <span className={styles.labelTech}>CATÉGORIE</span>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`${styles.presetBtn} ${filters.category === c ? styles.presetBtnActive : ""}`}
                  onClick={() => setFilters({ ...filters, category: c })}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Ambiance + tri */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap", marginBottom: 22 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: "1 1 320px", minWidth: 280 }}>
              <span className={styles.labelTech}>AMBIANCE</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MOODS.map((m) => {
                  const active = filters.moods.includes(m);
                  return (
                    <button
                      key={m}
                      className={`${styles.pill} ${active ? styles.pillActive : ""}`}
                      onClick={() => setFilters({
                        ...filters,
                        moods: active
                          ? filters.moods.filter((x) => x !== m)
                          : [...filters.moods, m],
                      })}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bouton de tri */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <span className={styles.labelTech}>TRIER PAR</span>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  className={styles.knobWrap}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const idx = SORTS.indexOf(sortDial);
                    setSortDial(SORTS[(idx + 1) % SORTS.length]);
                  }}
                >
                  <Knob size={56} variant="brass" rotation={sortAngle} />
                </div>
                <span className={styles.mono} style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "oklch(80% 0.18 70)", textShadow: "0 0 8px oklch(70% 0.18 65 / 0.6)" }}>
                  {sortDial}
                </span>
              </div>
            </div>
          </div>

          {/* Recherche */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <span className={styles.labelTech}>RECHERCHE PAR MOT-CLÉ</span>
            <div
              className={styles.displayScreen}
              style={{ borderRadius: 6, padding: "12px 18px", display: "flex", alignItems: "center", gap: 14 }}
            >
              <span className={`${styles.mono} ${styles.amberGlow} ${styles.faded}`} style={{ fontSize: 11, letterSpacing: "0.2em" }}>FRÉQ &gt;</span>
              <input
                className={styles.freqInput}
                placeholder="Cherche une émission..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
              <span className={`${styles.mono} ${styles.amberGlow} ${styles.faded}`} style={{ fontSize: 10, letterSpacing: "0.2em" }}>MHz</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   LISTE D'ARCHIVES
══════════════════════════════════════════════════════════════════ */

export function ArchiveList({
  items,
  playingId,
  onToggle,
  archiveRef,
}: {
  items: ArchiveItem[];
  playingId: string | null;
  onToggle: (id: string) => void;
  archiveRef: React.RefObject<HTMLElement | null>;
}) {
  return (
    <section ref={archiveRef} style={{ padding: "32px 0 80px" }}>
      <div className={styles.wrap}>
        <div className={styles.sectionHead}>
          <h2>Toutes les émissions</h2>
          <span className={styles.sectionMarker}>/ {String(items.length).padStart(2, "0")} · ÉMISSIONS</span>
        </div>

        {items.length === 0 ? (
          <div className={styles.noSignal}>── AUCUN SIGNAL SUR CETTE FRÉQUENCE ──</div>
        ) : (
          <div className={styles.archiveGrid}>
            {items.map((item) => (
              <RadioCard
                key={item.id}
                item={item}
                isPlaying={playingId === item.id}
                onToggle={() => onToggle(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   EN TERMINANT
══════════════════════════════════════════════════════════════════ */

export function SignalNotes() {
  return (
    <section style={{ padding: "60px 0 40px" }}>
      <div className={styles.wrap}>
        <div className={styles.sectionHead}>
          <h2>En terminant</h2>
          <span className={styles.sectionMarker}>/ FIN DE L&apos;ARCHIVE</span>
        </div>

        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "stretch" }}>

          {/* Gauche — texte */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: "1 1 360px", minWidth: 280 }}>
            <p style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(22px, 2.5vw, 30px)",
              fontWeight: 600,
              lineHeight: 1.2,
              color: "oklch(92% 0.035 85)",
              margin: 0,
              maxWidth: 540,
            }}>
              Chaque réécoute, c&apos;est un signal préservé du parcours CBA — passages radio, conversations, DJ sets et moments live captés aux quatre coins de Montréal.
            </p>
            <TapeLabel style={{ marginTop: 12, maxWidth: 320, transform: "rotate(-1deg)" }}>
              <span className={styles.mono} style={{ fontSize: 11, color: "oklch(20% 0.04 45)", letterSpacing: "0.1em" }}>
                CASSETTE 07 · CBA RADIO
              </span>
            </TapeLabel>
          </div>

          {/* Droite — panneau de lecture */}
          <div style={{
            flex: "1 1 420px",
            background: "linear-gradient(180deg, oklch(22% 0.025 55), oklch(13% 0.015 50))",
            border: "1px solid oklch(30% 0.03 55)",
            borderRadius: 14,
            padding: 28,
            boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7), 0 12px 30px -10px rgba(0,0,0,0.5)",
            position: "relative",
            minWidth: 320,
          }}>
            <Screws />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "center" }}>
              <span className={styles.labelTech}>LECTURE FINALE</span>
              <LED color="red" pulse size={9} />
            </div>

            <div className={styles.displayScreen} style={{ borderRadius: 6, padding: "clamp(20px, 3vw, 32px)", minHeight: 200, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 16 }}>
              <span className={`${styles.mono} ${styles.amberGlow} ${styles.faded}`} style={{ fontSize: 11, letterSpacing: "0.3em" }}>// 088.7 MHz · CBA //</span>
              <h3 className={`${styles.display} ${styles.amberGlow}`} style={{ fontSize: "clamp(28px, 4vw, 52px)", margin: 0, textAlign: "center", lineHeight: 0.92 }}>
                FIN DE<br />TRANSMISSION
              </h3>
              <FreqScale count={36} value={1} />
              <span className={`${styles.mono} ${styles.amberGlow}`} style={{ fontSize: 11, letterSpacing: "0.3em" }}>· RESTE À L&apos;ÉCOUTE ·</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
              <Knob size={36} variant="brass" rotation={45} />
              <Knob size={36} variant="brass" rotation={-30} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MINI LECTEUR — sticky
══════════════════════════════════════════════════════════════════ */

export function MiniPlayer({
  item,
  isPlaying,
  onToggle,
  onClose,
  progress = 0.18,
}: {
  item: FeaturedItem | ArchiveItem;
  isPlaying: boolean;
  onToggle: () => void;
  onClose: () => void;
  progress: number;
}) {
  const totalSec = parseDuration(item.duration);

  return (
    <div className={styles.miniPlayer}>

      {/* Gauche : lecture + LED */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <PlayButton playing={isPlaying} onClick={onToggle} size={36} variant="brass" />
        <LED color="red" pulse={isPlaying} on={isPlaying} size={7} />
      </div>

      {/* Centre : infos + progression */}
      <div className={styles.mpTrack} style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
            <span className={styles.labelTech} style={{ color: "oklch(65% 0.12 50)", whiteSpace: "nowrap" }}>CBA · ARCHIVE</span>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: 14, textTransform: "uppercase", color: "oklch(92% 0.035 85)",
              letterSpacing: "0.02em",
              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              minWidth: 0,
            }}>{item.title}</span>
          </div>
          <span className={styles.mono} style={{ fontSize: 10, color: "oklch(62% 0.04 70)", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
            {fmtTime(Math.round(totalSec * progress))} / {item.duration}
          </span>
        </div>

        {/* Barre de progression en fréquence */}
        <div style={{ position: "relative", height: 12, display: "flex", alignItems: "center" }}>
          <div className={styles.tickScale} style={{ height: 10, width: "100%" }}>
            {Array.from({ length: 60 }, (_, i) => (
              <span
                key={i}
                className={i % 10 === 0 ? styles.tickMajor : i % 5 === 0 ? styles.tickMid : styles.tickMinor}
                style={{
                  background: i / 60 < progress ? "oklch(80% 0.18 70)" : "oklch(40% 0.05 60)",
                  opacity: i / 60 < progress ? 0.95 : 0.6,
                }}
              />
            ))}
          </div>
          {/* Aiguille rouge */}
          <div style={{
            position: "absolute",
            top: -2, left: `calc(${progress * 100}% - 1px)`,
            width: 2, height: 16,
            background: "oklch(64% 0.24 25)",
            boxShadow: "0 0 6px oklch(60% 0.22 25 / 0.9)",
          }} />
        </div>
      </div>

      {/* Droite : volume + fermer */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="oklch(62% 0.04 70)">
          <path d="M3 6v4h2.5L9 13V3L5.5 6H3z" />
          <path d="M11 5c1 1 1 5 0 6" stroke="oklch(62% 0.04 70)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M12.5 3.5c2 2 2 7 0 9" stroke="oklch(62% 0.04 70)" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </svg>
        <Knob size={26} variant="chrome" rotation={isPlaying ? 10 : -40} />
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          style={{ background: "transparent", border: "none", color: "oklch(62% 0.04 70)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 14, padding: 4 }}
          aria-label="Fermer le lecteur"
        >×</button>
      </div>
    </div>
  );
}
