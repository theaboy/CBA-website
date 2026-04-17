import { useId } from "react";
import type { CSSProperties } from "react";

interface HeroDividerProps {
  /** Delay in ms before the line begins drawing (default: 1300) */
  delay?: number;
  /** Duration in ms of the draw animation (default: 1800) */
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export function HeroDivider({
  delay = 1300,
  duration = 1800,
  className,
  style,
}: HeroDividerProps) {
  const uid = useId();
  const filterId = `hd${uid.replace(/:/g, "")}`;

  // Shared animation style for both SVG path layers
  const drawStyle: CSSProperties = {
    strokeDasharray: 1,
    strokeDashoffset: 1,
    animation: `heroDividerDraw ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}ms forwards`,
  };

  // Subtle organic path — barely perceptible S-curve feels hand-drawn, not mechanical
  const d = "M 4,5 C 180,4.1 360,5.9 540,4.7 720,3.6 870,5.4 996,5";

  return (
    <div className={className} style={style}>
      {/*
       * SVG pen-stroke divider.
       * Two layers:
       *  1. Wide, very-low-opacity glow → mimics ink bleed / soft halo around a real pen stroke
       *  2. Narrow main stroke with feTurbulence → feathered, organic pencil edges
       * Both use pathLength="1" so stroke-dashoffset animates 0–1 regardless of geometry.
       * vectorEffect="non-scaling-stroke" keeps stroke width pixel-consistent on any screen width.
       */}
      <svg
        width="100%"
        height="12"
        viewBox="0 0 1000 12"
        preserveAspectRatio="none"
        aria-hidden
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <filter
            id={filterId}
            x="-2%"
            y="-300%"
            width="104%"
            height="700%"
          >
            {/* Fractal noise → rough, fibrous edge displacement */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018 0.72"
              numOctaves="5"
              seed="11"
              result="noise"
            />
            {/*
             * DisplacementMap: xChannel mild, yChannel strong →
             * the stroke stays roughly horizontal but the edges fray vertically,
             * exactly like pencil graphite or a dry ink nib on textured paper
             */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.4"
              xChannelSelector="G"
              yChannelSelector="R"
              result="displaced"
            />
            {/* Slight gaussian blur → softens the displaced edges to a feather */}
            <feGaussianBlur stdDeviation="0.45" />
          </filter>
        </defs>

        {/* Layer 1 — ink halo / glow (no filter, wide + transparent) */}
        <path
          d={d}
          stroke="rgba(247,235,215,0.13)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={drawStyle}
        />

        {/* Layer 2 — feathered main stroke */}
        <path
          d={d}
          stroke="rgba(247,235,215,0.70)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          vectorEffect="non-scaling-stroke"
          filter={`url(#${filterId})`}
          pathLength={1}
          style={drawStyle}
        />
      </svg>
    </div>
  );
}
