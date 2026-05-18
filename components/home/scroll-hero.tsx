"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

const SCROLL_HEIGHT  = "300vh";
const SPLIT_END      = 0.4;  // curtain finishes opening at 40 % of scroll progress
const NAV_THRESHOLD  = 0.7;  // nav fades in once the video scrub is nearly done

const NAV_ITEMS = [
  { label: "EXPLORE BEATS", scrollTo: "beats"   },
  { label: "BOOK SESSION",  scrollTo: "studio"  },
  { label: "LISTEN LIVE",   scrollTo: "listen"  },
];

// ── Single nav button ─────────────────────────────────────────────────────────
function NavLink({ label, scrollTo, divider }: { label: string; scrollTo: string; divider: boolean }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "stretch",
        borderLeft: divider ? "1px solid rgba(255,255,255,0.15)" : "none",
      }}
    >
      <button
        onClick={() => document.getElementById(scrollTo)?.scrollIntoView({ behavior: "smooth" })}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "none",
          border: "none",
          cursor: "pointer",

          fontFamily: "var(--font-sans, 'Helvetica Neue', Arial, sans-serif)",
          fontSize: "clamp(0.7rem, 1.2vw, 0.95rem)",
          fontWeight: 300,
          letterSpacing: hovered ? "0.38em" : "0.28em",
          textTransform: "uppercase",

          color: hovered ? "#ffffff" : "rgba(255,255,255,0.95)",
          textShadow: "0 1px 12px rgba(0,0,0,0.6)",
          transition: "color 0.3s ease, letter-spacing 0.3s ease",
        }}
      >
        {label}
      </button>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function ScrollHero() {
  const sectionRef      = useRef<HTMLElement>(null);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const leftHalfRef     = useRef<HTMLDivElement>(null);
  const rightHalfRef    = useRef<HTMLDivElement>(null);
  const logoRef         = useRef<HTMLDivElement>(null);
  const targetProgressRef = useRef(0);   // raw scroll → [0,1]
  const smoothProgressRef = useRef(0);   // exponentially smoothed [0,1]
  const lastTsRef       = useRef<number>(-1);
  const rafRef          = useRef<number>(0);
  const [navVisible, setNavVisible] = useState(false);

  // Smoothing stiffness — forward feels cinematic, reverse snaps faster
  const K_FORWARD  = 9;
  const K_REVERSE  = 22;

  useEffect(() => {
    const video    = videoRef.current;
    const section  = sectionRef.current;
    const leftEl   = leftHalfRef.current;
    const rightEl  = rightHalfRef.current;
    const logoEl   = logoRef.current;
    if (!video || !section || !leftEl || !rightEl) return;

    video.pause();

    // Easing curve — gives the curtain a deliberate, weighty start and a gentler settle
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    function tick(ts: number) {
      if (lastTsRef.current < 0) lastTsRef.current = ts;
      const dt      = Math.min((ts - lastTsRef.current) / 1000, 0.064);
      lastTsRef.current = ts;

      const diff    = targetProgressRef.current - smoothProgressRef.current;
      const k       = diff < 0 ? K_REVERSE : K_FORWARD;
      const factor  = 1 - Math.exp(-k * dt);
      smoothProgressRef.current += diff * factor;

      const p = smoothProgressRef.current;

      // Phase 1: split — curtain halves slide apart (0 → SPLIT_END)
      const rawSplit    = Math.min(1, p / SPLIT_END);
      const splitProgress = easeOutCubic(rawSplit);

      if (leftEl)  leftEl.style.transform  = `translate3d(${-splitProgress * 100}%, 0, 0)`;
      if (rightEl) rightEl.style.transform = `translate3d(${ splitProgress * 100}%, 0, 0)`;

      // Logo — anchored. At scroll 0 it has a neutral dark shadow; as the curtain opens,
      // the shadow warms up into gold to feel like the DJ scene is lighting it from behind.
      if (logoEl) {
        const glow   = 48 + rawSplit * 56;
        // Interpolate shadow color from neutral black to warm gold
        const r = Math.round(0   + rawSplit * 255);
        const g = Math.round(0   + rawSplit * 200);
        const b = Math.round(0   + rawSplit * 120);
        const a = (0.55 + rawSplit * 0.35).toFixed(2);
        const scale = 1 + rawSplit * 0.04;
        logoEl.style.filter    = `drop-shadow(0 4px ${glow}px rgba(${r},${g},${b},${a}))`;
        logoEl.style.transform = `scale(${scale})`;
      }

      // Video parallax — starts subtly zoomed in (1.06) and settles to 1.0 as curtain opens.
      // Gives depth: the DJ scene "pulls forward" out of the distance.
      const videoScale = 1.06 - rawSplit * 0.06;
      video.style.transform = `scale(${videoScale})`;

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
      setNavVisible(progress >= NAV_THRESHOLD);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Shared content inside each curtain half — the full bg image + vignette.
  // The half's clip-path is what makes each one show only its 50 % of the screen.
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
          background: "#080808",
        }}
      >
        {/* ── DJ video (back layer, revealed by the curtain split) ── */}
        <video
          ref={videoRef}
          src="/cba-hero-animation.mp4"
          muted
          playsInline
          preload="auto"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
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

        {/* ── CBA logo — anchored center, persistent above the curtain and the video ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "38vh",
            pointerEvents: "none",
          }}
        >
          <div
            ref={logoRef}
            role="img"
            aria-label="CBA — Create · Build · Achieve"
            style={{
              width: "min(380px, 52vw)",
              aspectRatio: "560 / 373",
              background: "linear-gradient(135deg, #1e6539 0%, #c9a961 55%)",
              WebkitMaskImage: "url(/cba/cba-logo-full.png)",
              WebkitMaskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskImage: "url(/cba/cba-logo-full.png)",
              maskSize: "contain",
              maskRepeat: "no-repeat",
              maskPosition: "center",
              filter: "drop-shadow(0 4px 48px rgba(0,0,0,0.55))",
              willChange: "transform, filter",
            }}
          />
        </div>

        {/* ── Ghost nav — fades in after NAV_THRESHOLD scroll progress ── */}
        <nav
          aria-label="Main navigation"
          style={{
            position: "absolute",
            bottom: "45vh",
            left: 0,
            right: 0,
            zIndex: 6,
            display: "flex",
            alignItems: "stretch",
            height: "3rem",
            opacity: navVisible ? 1 : 0,
            transform: navVisible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            pointerEvents: navVisible ? "auto" : "none",
          }}
        >
          {NAV_ITEMS.map((item, i) => (
            <NavLink key={item.scrollTo} {...item} divider={i > 0} />
          ))}
        </nav>

        {/* ── Hero → Beats gradient fade ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "38%",
            background: "linear-gradient(to bottom, transparent 0%, #0a0a0a 100%)", // matches BG in editorial-catalog.tsx
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      </div>
    </section>
  );
}
