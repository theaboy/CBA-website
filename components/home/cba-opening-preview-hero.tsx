"use client";

import { gsap } from "gsap";
import { CSSProperties, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import styles from "./cba-opening-preview-hero.module.css";

type LetterSpec = {
  id: string;
  char: "C" | "B" | "A";
  desktop: { x: string; y: string; scale: number };
  mobile: { x: string; y: string; scale: number };
  revealFrom: string;
  entry: { x: number; y: number; rotate: number; scale: number };
};

const OPENING_PREVIEW_CONFIG = {
  // Single source of truth for art direction tuning before homepage integration.
  backgroundImagePath: "/cba/home-reference.png",
  timings: {
    background: 1.2,
    matte: 0.9,
    letterStart: 0.1,
    stagger: 0.21,
    letterReveal: 0.88,
    maskReveal: 0.76,
    settle: 0.26,
    hold: 0.4
  },
  easing: {
    primary: "power4.out",
    mask: "power3.out",
    settle: "power2.out"
  },
  palette: {
    charcoal: "#080706",
    brownShadow: "rgba(33, 24, 18, 0.46)",
    greenShadow: "rgba(15, 52, 35, 0.32)",
    warmGold: "#e8c870",
    champagne: "#e7d6b9",
    ivory: "#f3ebde"
  }
} as const;

const LETTERS: LetterSpec[] = [
  {
    id: "c",
    char: "C",
    desktop: { x: "-28vw", y: "-6vh", scale: 1.16 },
    mobile: { x: "-27vw", y: "-9vh", scale: 0.98 },
    revealFrom: "inset(0% 100% 0% 0%)",
    entry: { x: -86, y: 10, rotate: -1.6, scale: 1.04 }
  },
  {
    id: "b",
    char: "B",
    desktop: { x: "1vw", y: "0vh", scale: 1.25 },
    mobile: { x: "1vw", y: "0vh", scale: 1.04 },
    revealFrom: "inset(0% 0% 0% 100%)",
    entry: { x: 0, y: 62, rotate: -0.7, scale: 1.03 }
  },
  {
    id: "a",
    char: "A",
    desktop: { x: "27vw", y: "8vh", scale: 1.15 },
    mobile: { x: "25vw", y: "8vh", scale: 0.98 },
    revealFrom: "inset(0% 0% 100% 0%)",
    entry: { x: 74, y: -18, rotate: 1.3, scale: 1.04 }
  }
];

export function CbaOpeningPreviewHero() {
  const sceneRef = useRef<HTMLElement | null>(null);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const titleMatteRef = useRef<HTMLDivElement | null>(null);
  const motionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const maskRefs = useRef<Array<HTMLDivElement | null>>([]);

  const setMotionRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      motionRefs.current[index] = node;
    },
    []
  );

  const setMaskRef = useCallback(
    (index: number) => (node: HTMLDivElement | null) => {
      maskRefs.current[index] = node;
    },
    []
  );

  useLayoutEffect(() => {
    const context = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        gsap.set(backgroundRef.current, { opacity: 1, scale: 1 });
        gsap.set(titleMatteRef.current, { opacity: 1 });
        motionRefs.current.forEach((node) => {
          if (node) gsap.set(node, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1, filter: "blur(0px)" });
        });
        maskRefs.current.forEach((node) => {
          if (node) gsap.set(node, { clipPath: "inset(0% 0% 0% 0%)" });
        });
        return;
      }

      const timeline = gsap.timeline({ defaults: { ease: OPENING_PREVIEW_CONFIG.easing.primary } });

      // Phase 1: subtle background settle so the stage already exists before lettering enters.
      timeline.fromTo(
        backgroundRef.current,
        { scale: 1.06, opacity: 0.84 },
        { scale: 1, opacity: 1, duration: OPENING_PREVIEW_CONFIG.timings.background },
        0
      );

      timeline.fromTo(
        titleMatteRef.current,
        { opacity: 0.2 },
        { opacity: 1, duration: OPENING_PREVIEW_CONFIG.timings.matte, ease: "power2.out" },
        0.1
      );

      LETTERS.forEach((letter, index) => {
        const motionNode = motionRefs.current[index];
        const maskNode = maskRefs.current[index];
        if (!motionNode || !maskNode) return;

        const offset = OPENING_PREVIEW_CONFIG.timings.letterStart + index * OPENING_PREVIEW_CONFIG.timings.stagger;

        // Phase 2: per-letter cinematic reveal (movement + mask + micro stabilization).
        timeline.fromTo(
          motionNode,
          {
            x: letter.entry.x,
            y: letter.entry.y,
            rotate: letter.entry.rotate,
            scale: letter.entry.scale,
            opacity: 0,
            filter: "blur(1.2px)"
          },
          {
            x: 0,
            y: 0,
            rotate: 0,
            scale: 1,
            opacity: 1,
            filter: "blur(0px)",
            duration: OPENING_PREVIEW_CONFIG.timings.letterReveal
          },
          offset
        );

        timeline.fromTo(
          maskNode,
          { clipPath: letter.revealFrom },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: OPENING_PREVIEW_CONFIG.timings.maskReveal,
            ease: OPENING_PREVIEW_CONFIG.easing.mask
          },
          offset + 0.02
        );

        timeline.to(
          motionNode,
          {
            scale: 1,
            duration: OPENING_PREVIEW_CONFIG.timings.settle,
            ease: OPENING_PREVIEW_CONFIG.easing.settle
          },
          offset + OPENING_PREVIEW_CONFIG.timings.letterReveal - 0.08
        );
      });

      timeline.to(
        {},
        { duration: OPENING_PREVIEW_CONFIG.timings.hold },
        OPENING_PREVIEW_CONFIG.timings.letterStart +
          OPENING_PREVIEW_CONFIG.timings.stagger * 2 +
          OPENING_PREVIEW_CONFIG.timings.letterReveal
      );
    }, sceneRef);

    return () => {
      context.revert();
    };
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (window.matchMedia("(max-width: 900px)").matches) return;
    const node = sceneRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;

    gsap.to(node, {
      "--mx": relX.toFixed(3),
      "--my": relY.toFixed(3),
      duration: 0.45,
      ease: "power2.out"
    });
  }, []);

  const handlePointerLeave = useCallback(() => {
    const node = sceneRef.current;
    if (!node) return;
    gsap.to(node, {
      "--mx": 0,
      "--my": 0,
      duration: 0.55,
      ease: "power2.out"
    });
  }, []);

  const sceneStyle = useMemo(
    () =>
      ({
        "--opening-bg-image": `url('${OPENING_PREVIEW_CONFIG.backgroundImagePath}')`,
        "--opening-charcoal": OPENING_PREVIEW_CONFIG.palette.charcoal,
        "--opening-brown-shadow": OPENING_PREVIEW_CONFIG.palette.brownShadow,
        "--opening-green-shadow": OPENING_PREVIEW_CONFIG.palette.greenShadow,
        "--opening-gold": OPENING_PREVIEW_CONFIG.palette.warmGold,
        "--opening-champagne": OPENING_PREVIEW_CONFIG.palette.champagne,
        "--opening-ivory": OPENING_PREVIEW_CONFIG.palette.ivory
      }) as CSSProperties,
    []
  );

  return (
    <section
      className={styles.scene}
      ref={sceneRef}
      style={sceneStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="CBA opening animation preview"
    >
      <div className={styles.background} ref={backgroundRef} />
      <div className={styles.earthGradient} />
      <div className={styles.titleMatte} ref={titleMatteRef} />
      <div className={styles.vignette} />
      <div className={styles.grain} />

      <p className={styles.previewBadge}>CBA Opening Preview</p>

      <div className={styles.letterStage} role="img" aria-label="CBA">
        {LETTERS.map((letter, index) => {
          const frameStyle = {
            "--letter-x": letter.desktop.x,
            "--letter-y": letter.desktop.y,
            "--letter-scale": `${letter.desktop.scale}`,
            "--letter-x-mobile": letter.mobile.x,
            "--letter-y-mobile": letter.mobile.y,
            "--letter-scale-mobile": `${letter.mobile.scale}`
          } as CSSProperties;

          return (
            <div key={letter.id} className={styles.letterFrame} style={frameStyle}>
              <div className={styles.letterMotion} ref={setMotionRef(index)}>
                <div className={styles.letterMask} ref={setMaskRef(index)}>
                  <span className={`${styles.glyphLayer} ${styles.glyphShadow}`} aria-hidden="true">
                    {letter.char}
                  </span>
                  <span className={`${styles.glyphLayer} ${styles.glyphFace}`}>{letter.char}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
