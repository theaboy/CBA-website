"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { gsap } from "gsap";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./radio-archive.module.css";
import { radioEpisodes, formatDate, type RadioEpisode } from "@/lib/radio/catalog";

/* Stable waveform heights for rack units */
const BARS = [
  38, 64, 48, 82, 33, 71, 55, 90, 42, 65, 50, 79, 36, 76, 58, 88,
  40, 68, 52, 84, 31, 72, 46, 80, 44, 74, 45, 91, 35, 63,
];

/* 80 deterministic bar heights */
const HERO_BARS = Array.from({ length: 80 }, (_, i) =>
  30 + Math.round(Math.abs(Math.sin(i * 0.37 + 0.5) * 62))
);

/* Knob with SVG tick ring */
function Knob({ label, size = "md" }: { label?: string; size?: "sm" | "md" | "lg" }) {
  const N = 11;
  const ticks = Array.from({ length: N }, (_, i) => {
    const deg = -135 + i * 27;
    const rad = (deg * Math.PI) / 180;
    const isMid = i === 5;
    const r1 = 46, r2 = isMid ? 38 : 40;
    return {
      x1: 50 + r1 * Math.sin(rad), y1: 50 - r1 * Math.cos(rad),
      x2: 50 + r2 * Math.sin(rad), y2: 50 - r2 * Math.cos(rad),
      isMid,
    };
  });

  return (
    <div className={styles.knobWrap}>
      <div className={`${styles.knobContainer} ${styles[`knob${size.charAt(0).toUpperCase()}${size.slice(1)}`]}`}>
        <svg className={styles.knobTickSvg} viewBox="0 0 100 100" aria-hidden>
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke={t.isMid ? "rgba(220,170,60,0.9)" : "rgba(90,78,55,0.65)"}
              strokeWidth={t.isMid ? "3.5" : "2"}
              strokeLinecap="round"
            />
          ))}
        </svg>
        <div className={styles.knobSocket}>
          <div className={styles.knobDome}>
            <div className={styles.knobPointer} />
          </div>
        </div>
      </div>
      {label && <span className={styles.knobLabel}>{label}</span>}
    </div>
  );
}

function Screw({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  return <div className={`${styles.screw} ${styles[`screw_${pos}`]}`} />;
}

/* Hero title — CSS wave pulse, then GSAP collapse + letter reveal */
const HERO_TITLE = "RADIO STATION ARCHIVES";

function RadioHeroTitle() {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root  = rootRef.current;
    const bWrap = barsRef.current;
    if (!root || !bWrap) return;

    const bars  = Array.from(bWrap.children) as HTMLElement[];
    const spans = Array.from(root.querySelectorAll("[data-letter]")) as HTMLElement[];

    /* Kill any stale tweens from a previous effect run */
    gsap.killTweensOf([...bars, ...spans]);
    gsap.set(spans, { scaleY: 0, opacity: 0, transformOrigin: "50% 100%" });

    if (reduced) {
      gsap.set(bars,  { scaleY: 0 });
      gsap.set(spans, { scaleY: 1, opacity: 1 });
      return;
    }

    /* CSS handles the wave pulse; after 1.5s collapse bars then reveal letters */
    const mid = (bars.length - 1) / 2;
    const timer = window.setTimeout(() => {
      /* Stop CSS wave animation, then collapse via CSS transition */
      bars.forEach((b, i) => {
        const dist  = Math.abs(i - mid) / mid;          // 0 = center, 1 = edge
        const delay = (1 - dist) * 0.22;                 // center collapses last
        b.style.animation  = "none";
        b.style.transition = `transform 0.38s cubic-bezier(0.55,0,1,0.45) ${delay.toFixed(3)}s`;
        b.style.transform  = "scaleY(0)";
      });

      /* After bars finish (max delay 0.22 + 0.38 = 0.6s), spring letters up with GSAP */
      window.setTimeout(() => {
        gsap.to(spans, {
          scaleY: 1,
          opacity: 1,
          transformOrigin: "50% 100%",
          duration: 0.52,
          ease: "back.out(1.5)",
          stagger: { each: 0.028 },
        });
      }, 560);
    }, 1500);

    return () => {
      window.clearTimeout(timer);
      gsap.killTweensOf([...bars, ...spans]);
    };
  }, [reduced]);

  return (
    <div className={styles.heroFloat}>
      <div ref={rootRef} className={styles.heroInner}>
        <div ref={barsRef} className={styles.heroBarsWrap} aria-hidden>
          {HERO_BARS.map((h, i) => (
            <div
              key={i}
              className={styles.heroBarEl}
              style={{
                height: `${h}%`,
                animationDelay: `${((i * 0.018) % 0.9).toFixed(3)}s`,
              }}
            />
          ))}
        </div>
        <h1 className={styles.heroH1} aria-label={HERO_TITLE}>
          {HERO_TITLE.split("").map((char, i) => (
            <span key={i} data-letter={i} className={styles.heroLetter}>
              {char === " " ? " " : char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
}

/* Main component */
type Props = {
  activeId: string | null;
  isPlaying: boolean;
  onSelect: (episode: RadioEpisode) => void;
};

export function RadioArchive({ activeId, isPlaying, onSelect }: Props) {
  const reduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: reduced ? 0 : 0.07 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
  };

  return (
    <div className={styles.page}>

      {/* Header */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={10} strokeWidth={2.5} /> CBA
        </Link>
        <p className={styles.pageTitle}>Radio Station Archives</p>
        <p className={styles.pageHome}>Home</p>
      </motion.header>

      {/* Hero title */}
      <RadioHeroTitle />

      {/* Section divider */}
      <motion.div
        className={styles.sectionDivider}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <span className={styles.sectionLabel}>Archive — {radioEpisodes.length} sessions</span>
        <div className={styles.sectionLine} />
      </motion.div>

      {/* Episode rack */}
      <motion.ul
        className={styles.rack}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {radioEpisodes.map((ep, idx) => {
          const isActive = ep.id === activeId;
          const playing  = isActive && isPlaying;

          return (
            <motion.li key={ep.id} variants={rowVariants}>
              <motion.button
                className={`${styles.rackUnit} ${isActive ? styles.active : ""}`}
                onClick={() => onSelect(ep)}
                aria-pressed={isActive}
                aria-label={`${playing ? "Pause" : "Ecouter"} — ${ep.title}`}
                whileHover={{ filter: "brightness(1.09)", transition: { duration: 0.18 } }}
                whileTap={{ scale: 0.992, transition: { duration: 0.08 } }}
              >
                <Screw pos="tl" /><Screw pos="tr" /><Screw pos="bl" /><Screw pos="br" />

                {/* Play / Pause dome */}
                <div className={`${styles.playMount} ${playing ? styles.playMountActive : ""}`}>
                  <div className={styles.playSocket}>
                    <div className={`${styles.playDome} ${playing ? styles.playDomeActive : ""}`}>
                      {playing
                        ? <><span className={styles.pauseBar} /><span className={styles.pauseBar} /></>
                        : <span className={styles.playTriangle} />
                      }
                    </div>
                  </div>
                </div>

                {/* Episode info */}
                <div className={styles.epMeta}>
                  <span className={styles.epTitle}>{ep.title}</span>
                  <span className={styles.epSub}>{formatDate(ep.date)}&nbsp;&nbsp;{ep.duration}</span>
                </div>

                {/* VU Waveform display */}
                <div className={`${styles.display} ${playing ? styles.displayActive : ""}`}>
                  <span className={styles.displayBadge}>
                    CBA&nbsp;{String(idx + 1).padStart(2, "0")}
                  </span>
                  <div className={styles.waveform} aria-hidden>
                    {BARS.map((h, i) => (
                      <div
                        key={i}
                        className={`${styles.waveBar} ${playing ? styles.waveBarLive : ""}`}
                        style={{
                          height: `${h}%`,
                          animationDelay: `${(i * 0.06).toFixed(2)}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Hardware knobs */}
                <Knob label="GAIN" size="sm" />
                <Knob label="TONE" size="sm" />
              </motion.button>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
