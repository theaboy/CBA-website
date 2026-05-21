"use client";

import { useEffect, useRef } from "react";
import styles from "./scroll-hero.module.css";

const SCROLL_HEIGHT  = "300vh";
const SPLIT_END      = 0.4;  // curtain finishes opening at 40 % of scroll progress

// ── Hero ──────────────────────────────────────────────────────────────────────
export function ScrollHero() {
  const sectionRef      = useRef<HTMLElement>(null);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const leftHalfRef     = useRef<HTMLDivElement>(null);
  const rightHalfRef    = useRef<HTMLDivElement>(null);
  const logoRef         = useRef<HTMLDivElement>(null);
  const targetProgressRef = useRef(0);   // raw scroll → [0,1]
  const smoothProgressRef = useRef(0);   // exponentially smoothed [0,1]
  const lastTsRef         = useRef<number>(-1);
  const rafRef            = useRef<number>(0);

  // Smoothing stiffness — forward feels cinematic, reverse snaps faster
  // so the browser skips intermediate backward keyframe decodes (less jank)
  const K_FORWARD = 9;
  const K_REVERSE = 22;

  useEffect(() => {
    const video   = videoRef.current;
    const section = sectionRef.current;
    const leftEl  = leftHalfRef.current;
    const rightEl = rightHalfRef.current;
    const logoEl  = logoRef.current;
    if (!video || !section || !leftEl || !rightEl) return;

    video.pause();

    // Easing curve — gives the curtain a deliberate, weighty start and a gentler settle
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    function tick(ts: number) {
      if (!video) return;
      if (lastTsRef.current < 0) lastTsRef.current = ts;
      const dt      = Math.min((ts - lastTsRef.current) / 1000, 0.064);
      lastTsRef.current = ts;

      const diff   = targetProgressRef.current - smoothProgressRef.current;
      const k      = diff < 0 ? K_REVERSE : K_FORWARD;
      const factor = 1 - Math.exp(-k * dt);
      smoothProgressRef.current += diff * factor;

      const p = smoothProgressRef.current;

      // Phase 1: split — curtain halves slide apart (0 → SPLIT_END)
      const rawSplit      = Math.min(1, p / SPLIT_END);
      const splitProgress = easeOutCubic(rawSplit);

      if (leftEl)  leftEl.style.transform  = `translate3d(${-splitProgress * 100}%, 0, 0)`;
      if (rightEl) rightEl.style.transform = `translate3d(${ splitProgress * 100}%, 0, 0)`;

      // Logo — shadow warms up into gold as the curtain opens
      if (logoEl) {
        const glow  = 48 + rawSplit * 56;
        const r     = Math.round(rawSplit * 255);
        const g     = Math.round(rawSplit * 200);
        const b     = Math.round(rawSplit * 120);
        const a     = (0.55 + rawSplit * 0.35).toFixed(2);
        const scale = 1 + rawSplit * 0.04;
        logoEl.style.filter    = `drop-shadow(0 4px ${glow}px rgba(${r},${g},${b},${a}))`;
        logoEl.style.transform = `scale(${scale})`;
      }

      // Video parallax — starts subtly zoomed in and settles to 1.0 as curtain opens
      video.style.transform = `scale(${1.06 - rawSplit * 0.06})`;

      // Phase 2: video scrub — only starts once the curtain has opened
      const videoProgress = Math.max(0, Math.min(1, (p - SPLIT_END) / (1 - SPLIT_END)));
      if (video.readyState >= 1) {
        const targetTime = videoProgress * (video.duration || 0);
        if (Math.abs(video.currentTime - targetTime) > 0.001) {
          video.currentTime = targetTime;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    function onScroll() {
      if (!section) return;
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress   = Math.min(1, Math.max(0, window.scrollY / scrollable));
      targetProgressRef.current = progress;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Shared content inside each curtain half — static hero image + vignette
  const halfContents = (
    <>
      <img
        src="/heroimage.png"
        alt=""
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.55) 100%)",
          pointerEvents: "none",
        }}
      />
    </>
  );

  return (
    <section
      ref={sectionRef}
      aria-label="CBA — Hero"
      style={{ position: "relative", height: SCROLL_HEIGHT }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#131816",
        }}
      >
        {/* ── DJ video (back layer, revealed by the curtain split) ── */}
        <video
          ref={videoRef}
          src="/cba-hero-animation.mp4"
          muted
          playsInline
          preload="auto"
          className={styles.video}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: 1,
          }}
        />

        {/* ── Left curtain half — clipped to the left 50 % of the screen ── */}
        <div
          ref={leftHalfRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            clipPath: "inset(0 50% 0 0)",
            WebkitClipPath: "inset(0 50% 0 0)",
            willChange: "transform",
          }}
        >
          {halfContents}
        </div>

        {/* ── Right curtain half — clipped to the right 50 % of the screen ── */}
        <div
          ref={rightHalfRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            clipPath: "inset(0 0 0 50%)",
            WebkitClipPath: "inset(0 0 0 50%)",
            willChange: "transform",
          }}
        >
          {halfContents}
        </div>

        {/* ── Logo — anchored center, above curtains and video ── */}
        <div className={styles.logoWrap}>
          <div
            ref={logoRef}
            role="img"
            aria-label="CBA — Create · Build · Achieve"
            className={styles.logo}
            style={{ willChange: "transform, filter" }}
          />
        </div>

        {/* ── Hero → Beats gradient fade ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "45%",
            background: `linear-gradient(to bottom,
              transparent                0%,
              rgba(19,24,22,0.04)       25%,
              rgba(19,24,22,0.14)       48%,
              rgba(19,24,22,0.42)       66%,
              rgba(19,24,22,0.72)       80%,
              rgba(19,24,22,0.92)       91%,
              #131816                  100%)`,
            zIndex: 10,
            pointerEvents: "none",
          }}
        />

        {/* Sentinel used by SiteNav to know when the hero has scrolled past the viewport */}
        <div id="hero-sentinel" aria-hidden style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, pointerEvents: "none" }} />
      </div>
    </section>
  );
}
