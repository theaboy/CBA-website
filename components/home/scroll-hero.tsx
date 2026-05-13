"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";

const SCROLL_HEIGHT  = "190vh";
const NAV_THRESHOLD  = 0.45; // nav fades in once 45 % of the animation is done

const NAV_ITEMS = [
  { label: "EXPLORE BEATS", href: "/beats"       },
  { label: "BOOK SESSION",  href: "/dj-services"  },
  { label: "LISTEN LIVE",   href: "/events"        },
];

// ── Single nav link ───────────────────────────────────────────────────────────
function NavLink({ label, href, divider }: { label: string; href: string; divider: boolean }) {
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
      <Link
        href={href}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",

          // ── Typography — matches the logo's thin geometric uppercase feel
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
      </Link>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
export function ScrollHero() {
  const sectionRef      = useRef<HTMLElement>(null);
  const videoRef        = useRef<HTMLVideoElement>(null);
  const targetProgressRef = useRef(0);   // raw scroll → [0,1]
  const smoothProgressRef = useRef(0);   // exponentially smoothed [0,1]
  const lastTsRef       = useRef<number>(-1);
  const rafRef          = useRef<number>(0);
  const [navVisible, setNavVisible] = useState(false);

  // Smoothing stiffness — forward feels cinematic, reverse snaps faster
  // so the browser skips intermediate backward keyframe decodes (less jank)
  const K_FORWARD  = 9;
  const K_REVERSE  = 22;

  useEffect(() => {
    const video   = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    video.pause();

    function tick(ts: number) {
      // Frame-rate-independent exponential decay: factor = 1 − e^(−K·Δt)
      if (lastTsRef.current < 0) lastTsRef.current = ts;
      const dt      = Math.min((ts - lastTsRef.current) / 1000, 0.064); // cap at ~4 frames
      lastTsRef.current = ts;

      const diff    = targetProgressRef.current - smoothProgressRef.current;
      const k       = diff < 0 ? K_REVERSE : K_FORWARD;
      const factor  = 1 - Math.exp(-k * dt);
      smoothProgressRef.current += diff * factor;

      if (video && video.readyState >= 1) {
        const targetTime = smoothProgressRef.current * (video.duration || 0);
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
        {/* ── Video ── */}
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
          }}
        />

        {/* ── Vignette — just enough to lift the nav text off the video ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.5) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        {/* ── Logo ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingBottom: "38vh",
            pointerEvents: "none",
          }}
        >
          <Image
            src="/cba/cba-logo-full.png"
            alt="CBA — Create · Build · Achieve"
            width={560}
            height={373}
            priority
            style={{
              objectFit: "contain",
              maxWidth: "min(380px, 52vw)",
              height: "auto",
              filter: "drop-shadow(0 4px 48px rgba(0,0,0,0.55))",
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
            zIndex: 3,
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
            <NavLink key={item.href} {...item} divider={i > 0} />
          ))}
        </nav>
      </div>
    </section>
  );
}
