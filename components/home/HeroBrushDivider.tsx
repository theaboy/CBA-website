"use client";

import { useId } from "react";
import type { CSSProperties } from "react";

interface HeroBrushDividerProps {
  delay?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * HeroBrushDivider — a three-layer calligraphy brush stroke drawn live.
 *
 * Layer 1: wide bleed base  — ink spread / halo, no filter
 * Layer 2: mid stroke       — body depth, no filter
 * Layer 3: main stroke      — finest line with turbulence filter for organic edges
 *
 * Path uses subtle bezier waviness (±3px vertical) across the 600-unit viewBox.
 * stroke-dashoffset animation via CSS keyframe `heroDividerDraw` (defined in globals.css).
 */
export function HeroBrushDivider({
  delay = 1200,
  duration = 2200,
  className,
  style,
}: HeroBrushDividerProps) {
  const filterId = useId().replace(/:/g, "");

  // Organic wavy path — center Y=10, subtle ±3px vertical drift via cubic beziers
  const d =
    "M 3,10 C 50,7.5 90,12.5 135,9.2 C 175,6.2 215,11.8 260,9.8 C 300,7.8 340,12.2 385,10.2 C 420,8.4 460,11.6 500,9.5 C 530,8.2 560,10.8 597,10.2";
  // Ghost offset path — same waviness shifted down 1.5px for calligraphy double-stroke character
  const dGhost =
    "M 3,11.5 C 50,9.0 90,14.0 135,10.7 C 175,7.7 215,13.3 260,11.3 C 300,9.3 340,13.7 385,11.7 C 420,9.9 460,13.1 500,11.0 C 530,9.7 560,12.3 597,11.7";

  const animStyle = (extraDelay = 0): CSSProperties => ({
    strokeDasharray: 1,
    strokeDashoffset: 1,
    animation: `heroDividerDraw ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay + extraDelay}ms both`,
  });

  return (
    <div className={className} style={style} aria-hidden>
      <svg
        width="100%"
        height="20"
        viewBox="0 0 600 20"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <filter
            id={`brush-${filterId}`}
            x="-2%"
            y="-60%"
            width="104%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            {/* fractalNoise: low x-freq = smooth along stroke; high y-freq = fibrous perpendicular texture */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.025 0.85"
              numOctaves="5"
              seed="9"
              result="noise"
            />
            {/* scale="4.5": moderate-high edge roughness for visible frayed ink fibers */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* Layer 1 — wide ink bleed base: 11px, 13% opacity, no filter */}
        <path
          d={d}
          fill="none"
          stroke="rgba(247,235,215,0.13)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
          style={animStyle(0)}
        />

        {/* Layer 2 — mid-depth body: 4.5px, 28% opacity, no filter */}
        <path
          d={d}
          fill="none"
          stroke="rgba(247,235,215,0.28)"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
          style={animStyle(0)}
        />

        {/* Layer 3 — main fine stroke: 2px, 82% opacity, turbulence filter for organic edges */}
        <path
          d={d}
          fill="none"
          stroke="rgba(247,235,215,0.82)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
          filter={`url(#brush-${filterId})`}
          style={animStyle(0)}
        />

        {/* Layer 4 — ghost calligraphy shadow stroke: 0.8px offset down 1.5px, 35% opacity */}
        <path
          d={dGhost}
          fill="none"
          stroke="rgba(247,235,215,0.35)"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          vectorEffect="non-scaling-stroke"
          filter={`url(#brush-${filterId})`}
          style={animStyle(0)}
        />
      </svg>
    </div>
  );
}
