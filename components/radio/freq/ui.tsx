"use client";
// UI primitives — LED, Knob, Grill, FreqScale, Waveform, VUMeter, Display, PlayButton, TapeLabel, Screws, Tag

import React from "react";
import styles from "./fa.module.css";

/* ── LED ─────────────────────────────────────────────────────────── */

type LEDColor = "red" | "amber" | "green";

export function LED({
  color = "red",
  on = true,
  pulse = false,
  size = 10,
  label,
  style,
}: {
  color?: LEDColor;
  on?: boolean;
  pulse?: boolean;
  size?: number;
  label?: string;
  style?: React.CSSProperties;
}) {
  const colorCls = on
    ? color === "amber" ? styles.ledAmber : color === "green" ? styles.ledGreen : ""
    : styles.ledDim;

  const el = (
    <span
      className={`${styles.led} ${colorCls} ${pulse && on ? styles.ledPulse : ""}`}
      style={{ width: size, height: size, ...style }}
    />
  );
  if (!label) return el;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {el}
      <span className={styles.labelTech}>{label}</span>
    </span>
  );
}

/* ── Knob ────────────────────────────────────────────────────────── */

type KnobVariant = "brass" | "chrome" | "black" | "cream";

export function Knob({
  size = 56,
  variant = "brass",
  rotation = -45,
  label,
}: {
  size?: number;
  variant?: KnobVariant;
  rotation?: number;
  label?: string;
}) {
  const variantCls =
    variant === "chrome" ? styles.knobChrome
    : variant === "black" ? styles.knobBlack
    : variant === "cream" ? styles.knobCream
    : styles.knobBrass;

  return (
    <div className={styles.knobWrap} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div
        className={`${styles.knob} ${variantCls}`}
        style={{ width: size, height: size, ["--rot" as string]: `${rotation}deg` }}
      >
        <span className={styles.knobNotch} />
      </div>
      {label && <span className={styles.labelTech}>{label}</span>}
    </div>
  );
}

/* ── Grill ───────────────────────────────────────────────────────── */

type GrillVariant = "dots" | "dots-fine" | "mesh" | "cream-dots";

export function Grill({
  variant = "dots",
  height = 80,
  width = "100%",
  radius = 6,
  style,
  children,
  framed = true,
}: {
  variant?: GrillVariant;
  height?: number;
  width?: number | string;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  framed?: boolean;
}) {
  const cls =
    variant === "dots-fine" ? styles.grillDotsFine
    : variant === "mesh" ? styles.grillMesh
    : variant === "cream-dots" ? styles.grillCreamDots
    : styles.grillDots;

  return (
    <div
      className={cls}
      style={{
        width,
        height,
        borderRadius: radius,
        border: framed ? "1px solid rgba(0,0,0,0.5)" : "none",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── FreqScale ───────────────────────────────────────────────────── */

export function FreqScale({ count = 40, value = 0.62 }: { count?: number; value?: number }) {
  return (
    <div style={{ position: "relative" }}>
      <div className={styles.tickScale}>
        {Array.from({ length: count }, (_, i) => (
          <span
            key={i}
            className={i % 10 === 0 ? styles.tickMajor : i % 5 === 0 ? styles.tickMid : styles.tickMinor}
          />
        ))}
      </div>
      {/* needle */}
      <div
        className={styles.needleSway}
        style={{
          position: "absolute",
          top: -4,
          left: `calc(${value * 100}% - 1px)`,
          width: 2,
          height: 26,
          background: "oklch(64% 0.24 25)",
          boxShadow: "0 0 6px oklch(60% 0.22 25 / 0.8)",
          borderRadius: 1,
        }}
      />
    </div>
  );
}

/* ── Waveform ────────────────────────────────────────────────────── */

export function Waveform({
  width = 200,
  height = 28,
  variant = "bars",
  playing = false,
  color = "amber",
}: {
  width?: number;
  height?: number;
  variant?: "bars" | "path";
  playing?: boolean;
  color?: "amber" | "red" | "cream";
}) {
  const stroke =
    color === "amber" ? "oklch(80% 0.18 70)"
    : color === "red" ? "oklch(64% 0.24 25)"
    : "oklch(85% 0.05 75)";

  const animCls = playing ? styles.waveAnimFast : styles.waveAnim;

  if (variant === "path") {
    const pts: string[] = [];
    const seg = 80;
    for (let i = 0; i <= seg * 2; i++) {
      const x = (i / seg) * (width / 2);
      const y = height / 2 + Math.sin(i * 0.35) * (height / 2.6) + Math.sin(i * 0.83) * (height / 6);
      pts.push((i === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1));
    }
    return (
      <div style={{ width, height, overflow: "hidden", position: "relative" }}>
        <svg
          className={animCls}
          width={width * 2}
          height={height}
          viewBox={`0 0 ${width * 2} ${height}`}
          style={{ display: "block" }}
        >
          <path
            d={pts.join(" ")}
            stroke={stroke}
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${stroke})`, opacity: 0.9 }}
          />
        </svg>
      </div>
    );
  }

  // bars
  const N = Math.floor(width / 5);
  const seed = 17;
  const bars = Array.from({ length: N }, (_, i) => {
    const h = (Math.sin(i * 0.42 + seed) * 0.35 + Math.sin(i * 1.1 + seed * 2) * 0.25 + 0.55) * height;
    return (
      <div
        key={i}
        style={{
          width: 2,
          height: Math.max(2, h),
          background: stroke,
          boxShadow: `0 0 3px ${stroke}`,
          opacity: 0.75 + Math.sin(i * 0.3) * 0.2,
          borderRadius: 1,
        }}
      />
    );
  });

  return (
    <div style={{ width, height, overflow: "hidden", position: "relative" }}>
      <div
        className={animCls}
        style={{ display: "flex", alignItems: "center", gap: 3, height: "100%", width: width * 2 }}
      >
        {bars}
        {bars.map((b, i) => React.cloneElement(b, { key: `b${i}` }))}
      </div>
    </div>
  );
}

/* ── VU Meter ────────────────────────────────────────────────────── */

export function VUMeter({
  width = 110,
  height = 70,
  playing = false,
  label = "VU",
}: {
  width?: number | string;
  height?: number;
  playing?: boolean;
  label?: string;
}) {
  return (
    <div
      style={{
        width,
        height,
        padding: 6,
        background: "linear-gradient(180deg, oklch(92% 0.04 85), oklch(78% 0.06 80))",
        borderRadius: 4,
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.25), 0 1px 0 rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
        color: "oklch(25% 0.06 45)",
      }}
    >
      <svg viewBox="0 0 110 60" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <path d="M 12 56 A 43 43 0 0 1 98 56" fill="none" stroke="oklch(25% 0.06 45)" strokeWidth="1" />
        <path d="M 78 56 A 43 43 0 0 1 98 56" fill="none" stroke="oklch(55% 0.22 25)" strokeWidth="3" />
        {Array.from({ length: 9 }, (_, i) => {
          const a = (Math.PI * (i + 1)) / 10 + Math.PI;
          const r1 = 39, r2 = 43, cx = 55, cy = 56;
          return (
            <line
              key={i}
              x1={cx + Math.cos(a) * r1} y1={cy + Math.sin(a) * r1}
              x2={cx + Math.cos(a) * r2} y2={cy + Math.sin(a) * r2}
              stroke="oklch(25% 0.06 45)"
              strokeWidth={i === 8 ? 1.5 : 0.8}
            />
          );
        })}
        <g transform="translate(55, 56)">
          <g
            className={playing ? styles.vuNeedleAnim : ""}
            style={!playing ? { transform: "rotate(-30deg)" } : {}}
          >
            <line x1="0" y1="0" x2="0" y2="-40" stroke="oklch(15% 0.03 25)" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="0" cy="0" r="3" fill="oklch(45% 0.10 25)" />
          </g>
        </g>
        <text x="55" y="22" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="6" fill="oklch(35% 0.07 45)" letterSpacing="1.2">
          {label}
        </text>
      </svg>
    </div>
  );
}

/* ── Display screen ──────────────────────────────────────────────── */

export function Display({
  children,
  height = 56,
  style,
  glow = true,
}: {
  children: React.ReactNode;
  height?: number;
  style?: React.CSSProperties;
  glow?: boolean;
}) {
  return (
    <div
      className={styles.displayScreen}
      style={{ borderRadius: 4, padding: "6px 10px", minHeight: height, display: "flex", alignItems: "center", ...style }}
    >
      <div className={glow ? `${styles.amberGlow} ${styles.mono}` : styles.mono} style={{ width: "100%" }}>
        {children}
      </div>
    </div>
  );
}

/* ── Play button ─────────────────────────────────────────────────── */

export function PlayButton({
  size = 54,
  playing = false,
  onClick,
  variant = "cream",
}: {
  size?: number;
  playing?: boolean;
  onClick?: () => void;
  variant?: "cream" | "brass";
}) {
  return (
    <button
      className={`${styles.btnPlay} ${variant === "brass" ? styles.btnPlayBrass : ""}`}
      style={{ width: size, height: size }}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      aria-label={playing ? "Pause" : "Play"}
    >
      {playing ? (
        <svg width={size * 0.36} height={size * 0.36} viewBox="0 0 16 16" fill="currentColor">
          <rect x="3" y="2" width="4" height="12" rx="1" />
          <rect x="9" y="2" width="4" height="12" rx="1" />
        </svg>
      ) : (
        <svg width={size * 0.36} height={size * 0.36} viewBox="0 0 16 16" fill="currentColor">
          <path d="M4 2.5v11l10-5.5z" />
        </svg>
      )}
    </button>
  );
}

/* ── Tape label ──────────────────────────────────────────────────── */

export function TapeLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return <div className={styles.tapeLabel} style={style}>{children}</div>;
}

/* ── Corner screws ───────────────────────────────────────────────── */

type ScrewPos = "tl" | "tr" | "bl" | "br";
const SCREW_POS: Record<ScrewPos, React.CSSProperties> = {
  tl: { top: 6, left: 6 },
  tr: { top: 6, right: 6 },
  bl: { bottom: 6, left: 6 },
  br: { bottom: 6, right: 6 },
};

export function Screws({ positions = ["tl", "tr", "bl", "br"] as ScrewPos[] }) {
  return (
    <>
      {positions.map((p) => (
        <span key={p} className={styles.screw} style={SCREW_POS[p]} />
      ))}
    </>
  );
}
