"use client";
// 7 horizontal radio row variants + RadioCard picker

import styles from "./fa.module.css";
import { Knob, Grill, FreqScale, Waveform, VUMeter, Display, PlayButton, Screws, LED } from "./ui";
import type { ArchiveItem } from "@/lib/radio/archive";

/* ── Cassette reel ───────────────────────────────────────────────── */

function CassetteReel({ size = 56, spinning = false, reverse = false }: { size?: number; spinning?: boolean; reverse?: boolean }) {
  return (
    <div
      className={spinning ? (reverse ? styles.reelSpinningReverse : styles.reelSpinning) : ""}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: "radial-gradient(circle at 50% 50%, oklch(35% 0.03 60) 0%, oklch(35% 0.03 60) 30%, oklch(15% 0.01 50) 32%, oklch(15% 0.01 50) 100%)",
        position: "relative",
        boxShadow: "inset 0 0 4px rgba(0,0,0,0.8), 0 1px 0 rgba(255,255,255,0.06)",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={50 + Math.cos(a) * 12} y1={50 + Math.sin(a) * 12}
              x2={50 + Math.cos(a) * 32} y2={50 + Math.sin(a) * 32}
              stroke="oklch(45% 0.04 60)" strokeWidth="2" strokeLinecap="round"
            />
          );
        })}
        <circle cx="50" cy="50" r="6" fill="oklch(25% 0.02 50)" stroke="oklch(55% 0.04 60)" strokeWidth="1" />
      </svg>
    </div>
  );
}

/* ── Left visuals ────────────────────────────────────────────────── */

function LeftPortable({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 12, height: 110 }}>
      <Grill variant="dots-fine" height={110} radius={4} style={{ flex: 1 }} />
      <Knob size={48} variant="chrome" rotation={isPlaying ? 30 : -45} />
    </div>
  );
}

function LeftWoodSquare({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, oklch(92% 0.035 85), oklch(80% 0.06 75))",
      padding: "14px 14px 10px",
      borderRadius: 4,
      height: 110,
      boxShadow: "inset 0 2px 5px rgba(0,0,0,0.25), 0 1px 0 rgba(0,0,0,0.3)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      position: "relative",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "oklch(25% 0.05 45)", letterSpacing: "0.18em" }}>87.5</span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "oklch(25% 0.05 45)", letterSpacing: "0.18em" }}>108.0</span>
      </div>
      <div style={{ position: "relative" }}>
        <div className={styles.tickScale} style={{ height: 22 }}>
          {Array.from({ length: 28 }, (_, i) => (
            <span
              key={i}
              className={i % 7 === 0 ? styles.tickMajor : i % 3 === 0 ? styles.tickMid : styles.tickMinor}
              style={{ background: i % 7 === 0 ? "oklch(22% 0.05 45)" : "oklch(40% 0.05 45)" }}
            />
          ))}
        </div>
        <div style={{
          position: "absolute",
          top: -3, left: isPlaying ? "64%" : "36%",
          width: 2, height: 28,
          background: "oklch(50% 0.20 25)",
          boxShadow: "0 0 4px oklch(60% 0.22 25 / 0.6)",
          transition: "left 0.6s ease",
        }} />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Knob size={26} variant="brass" rotation={isPlaying ? 20 : -40} />
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 8, color: "oklch(30% 0.04 45)", letterSpacing: "0.2em" }}>TUNE</span>
      </div>
    </div>
  );
}

function LeftCassette({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{
      background: "linear-gradient(180deg, oklch(15% 0.02 50), oklch(8% 0.01 50))",
      borderRadius: 4,
      padding: "14px 18px",
      height: 110,
      boxShadow: "inset 0 2px 8px rgba(0,0,0,0.7)",
      border: "1px solid oklch(20% 0.02 60)",
      display: "flex", alignItems: "center", justifyContent: "space-around", gap: 12,
    }}>
      <CassetteReel size={62} spinning={isPlaying} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        <span className={`${styles.labelTech} ${styles.amberGlow}`} style={{ fontSize: 8, letterSpacing: "0.22em" }}>TAPE</span>
        <span className={`${styles.mono} ${styles.amberGlow}`} style={{ fontSize: 14, letterSpacing: "0.18em" }}>A·07</span>
      </div>
      <CassetteReel size={62} spinning={isPlaying} reverse />
    </div>
  );
}

function LeftMini({ isPlaying }: { isPlaying: boolean }) {
  const ang = (isPlaying ? 0.6 : -0.4) * Math.PI - Math.PI / 2;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 110 }}>
      <div style={{
        width: 100, height: 100, borderRadius: "50%",
        background: "radial-gradient(circle at 35% 30%, oklch(92% 0.035 85), oklch(78% 0.05 78))",
        position: "relative",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15), inset 0 -2px 4px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.4)",
        flexShrink: 0,
      }}>
        <svg viewBox="0 0 100 100" width="100" height="100" style={{ position: "absolute", inset: 0 }}>
          {Array.from({ length: 24 }, (_, i) => {
            const a = ((i - 6) * Math.PI) / 12;
            const r1 = i % 6 === 0 ? 36 : 40, r2 = 46;
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1}
                x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2}
                stroke="oklch(22% 0.05 45)"
                strokeWidth={i % 6 === 0 ? 1.6 : 0.8}
              />
            );
          })}
          <line
            x1="50" y1="50"
            x2={50 + Math.cos(ang) * 42} y2={50 + Math.sin(ang) * 42}
            stroke="oklch(50% 0.20 25)" strokeWidth="1.6" strokeLinecap="round"
            style={{ transition: "all 0.6s ease" }}
          />
          <circle cx="50" cy="50" r="6" fill="oklch(60% 0.10 78)" stroke="oklch(30% 0.04 60)" strokeWidth="0.8" />
        </svg>
      </div>
    </div>
  );
}

function LeftCarDash({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, height: 110 }}>
      <Knob size={42} variant="black" rotation={isPlaying ? 20 : -40} />
      <div className={styles.displayScreen} style={{ flex: 1, borderRadius: 4, padding: "14px 14px", height: 90, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <span className={`${styles.amberGlow} ${styles.mono} ${styles.faded}`} style={{ fontSize: 9, letterSpacing: "0.22em" }}>STEREO · FM</span>
        <FreqScale count={22} value={0.58} />
        <Waveform width={130} height={14} variant="path" playing={isPlaying} />
      </div>
      <Knob size={42} variant="black" rotation={isPlaying ? -20 : -70} />
    </div>
  );
}

function LeftStudio({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div style={{ height: 110, display: "flex", alignItems: "center" }}>
      <VUMeter width="100%" height={102} playing={isPlaying} label="OUTPUT" />
    </div>
  );
}

function LeftWoodMesh() {
  return (
    <div style={{ height: 110 }}>
      <Grill variant="mesh" height={110} radius={4} style={{ border: "3px solid oklch(48% 0.10 75)" }}>
        <div style={{
          position: "absolute", left: "50%", top: "50%",
          transform: "translate(-50%, -50%)",
          padding: "6px 12px",
          background: "linear-gradient(180deg, oklch(48% 0.10 75), oklch(35% 0.08 70))",
          color: "oklch(15% 0.02 50)",
          fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 800, letterSpacing: "0.22em",
          borderRadius: 2,
          boxShadow: "inset 0 1px 0 rgba(255,230,180,0.4), 0 2px 4px rgba(0,0,0,0.5)",
        }}>CBA</div>
      </Grill>
    </div>
  );
}

/* ── Generic horizontal row ──────────────────────────────────────── */

function HorizontalRow({
  item,
  isPlaying,
  onToggle,
  surfaceClass,
  leftVisual,
  lightText = false,
}: {
  item: ArchiveItem;
  isPlaying: boolean;
  onToggle: () => void;
  surfaceClass: string;
  leftVisual: React.ReactNode;
  lightText?: boolean;
}) {
  const titleColor = lightText ? "oklch(15% 0.02 50)" : "oklch(92% 0.035 85)";
  const metaColor  = lightText ? "oklch(35% 0.04 60)" : "oklch(62% 0.04 70)";

  return (
    <div
      className={`${styles.radio} ${styles.radioHoriz} ${surfaceClass} ${isPlaying ? styles.radioPlaying : ""}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-pressed={isPlaying}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
    >
      <Screws />
      <div className={styles.horizGrid}>

        {/* LEFT visual */}
        {leftVisual}

        {/* MIDDLE: tag + title + meta */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className={styles.typeEyebrow}>{item.type}</span>
            <LED color="red" pulse={isPlaying} on={isPlaying} size={8} />
            {isPlaying && (
              <span className={styles.mono} style={{ fontSize: 10, letterSpacing: "0.2em", color: "oklch(72% 0.20 25)", textShadow: "0 0 8px oklch(60% 0.22 25 / 0.6)" }}>
                NOW PLAYING
              </span>
            )}
          </div>
          <h3 className={styles.titleBig} style={{ color: titleColor }}>{item.title}</h3>
          <span className={styles.mono} style={{ fontSize: 11, color: metaColor, letterSpacing: "0.08em" }}>
            {item.source} · {item.date}
          </span>
        </div>

        {/* RIGHT: duration + play */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <Display height={48} style={{ borderRadius: 4 }}>
            <div className={`${styles.durScreen} ${styles.amberGlow}`}>
              <span className={styles.durNum}>{item.duration}</span>
              <span className={styles.durUnit}>MIN · SEC</span>
            </div>
          </Display>
          <PlayButton size={56} playing={isPlaying} onClick={onToggle} variant="brass" />
        </div>

      </div>
    </div>
  );
}

/* ── Per-variant wrappers ────────────────────────────────────────── */

type CardProps = { item: ArchiveItem; isPlaying: boolean; onToggle: () => void };

const SURFACE: Record<ArchiveItem["variant"], string> = {
  "portable":    styles.brushed,
  "wood-square": styles.woodPanel,
  "cassette":    styles.matteBlack,
  "mini":        styles.creamPlastic,
  "car-dash":    styles.brushed,
  "studio":      styles.matteBlack,
  "wood-mesh":   styles.woodPanel,
};

export function RadioCard({ item, isPlaying, onToggle }: CardProps) {
  const surface   = SURFACE[item.variant] ?? styles.brushed;
  const lightText = item.variant === "mini";

  const leftVisual =
    item.variant === "wood-square" ? <LeftWoodSquare isPlaying={isPlaying} />
    : item.variant === "cassette"  ? <LeftCassette isPlaying={isPlaying} />
    : item.variant === "mini"      ? <LeftMini isPlaying={isPlaying} />
    : item.variant === "car-dash"  ? <LeftCarDash isPlaying={isPlaying} />
    : item.variant === "studio"    ? <LeftStudio isPlaying={isPlaying} />
    : item.variant === "wood-mesh" ? <LeftWoodMesh />
    : <LeftPortable isPlaying={isPlaying} />;

  return (
    <HorizontalRow
      item={item}
      isPlaying={isPlaying}
      onToggle={onToggle}
      surfaceClass={surface}
      leftVisual={leftVisual}
      lightText={lightText}
    />
  );
}
