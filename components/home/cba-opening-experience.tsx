"use client";

import Link from "next/link";
import { CSSProperties, useEffect, useMemo, useRef, useState } from "react";

type Destination = {
  label: string;
  caption: string;
  href: string;
  tone: string;
};

const destinations: Destination[] = [
  {
    label: "Reserve DJ Session",
    caption: "Private events, curated sets, and premium atmosphere control.",
    href: "/dj-services",
    tone: "linear-gradient(120deg, rgba(209,141,63,0.24), rgba(10,75,42,0.18))"
  },
  {
    label: "See All Beats",
    caption: "Browse sonic signatures, licensing tiers, and new drops.",
    href: "/beats",
    tone: "linear-gradient(120deg, rgba(240,193,123,0.22), rgba(52,48,45,0.2))"
  },
  {
    label: "Next Events",
    caption: "Upcoming showcases, ticket drops, and live moments.",
    href: "/events",
    tone: "linear-gradient(120deg, rgba(30,101,57,0.2), rgba(209,141,63,0.16))"
  },
  {
    label: "Book Studio Time",
    caption: "Session requests, room options, and production blocks.",
    href: "/studio",
    tone: "linear-gradient(120deg, rgba(10,75,42,0.2), rgba(107,77,50,0.24))"
  },
  {
    label: "About CBA",
    caption: "Montréal roots, collective direction, and creative story.",
    href: "/about",
    tone: "linear-gradient(120deg, rgba(143,109,72,0.24), rgba(31,26,22,0.24))"
  },
  {
    label: "Contact & Inquiries",
    caption: "Partnerships, custom requests, and direct communication.",
    href: "/contact",
    tone: "linear-gradient(120deg, rgba(232,200,112,0.2), rgba(44,35,28,0.22))"
  }
];

export function CBAOpeningExperience() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [focusPosition, setFocusPosition] = useState(0);
  const [introVisible, setIntroVisible] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const sceneRef = useRef<HTMLElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const originalOverflowRef = useRef("");
  const targetProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const hoverIndexRef = useRef<number | null>(null);

  useEffect(() => {
    hoverIndexRef.current = hoverIndex;
  }, [hoverIndex]);

  useEffect(() => {
    document.body.dataset.cbaIntro = "active";
    const originalOverflow = document.body.style.overflow;
    originalOverflowRef.current = originalOverflow;
    document.body.style.overflow = "hidden";

    const introTimer = window.setTimeout(() => {
      setIntroVisible(false);
      document.body.dataset.cbaIntro = "done";
      document.body.style.overflow = originalOverflow;
    }, 2200);

    const onScroll = () => {
      const scene = sceneRef.current;
      if (!scene) return;

      const rect = scene.getBoundingClientRect();
      const total = Math.max(rect.height - window.innerHeight, 1);
      const traveled = Math.min(Math.max(-rect.top, 0), total);
      targetProgressRef.current = traveled / total;
    };

    const animate = () => {
      const target = targetProgressRef.current;
      const current = smoothProgressRef.current;
      const next = current + (target - current) * 0.14;
      smoothProgressRef.current = next;

      setScrollProgress((prev) => (Math.abs(prev - next) > 0.0008 ? next : prev));

      const pos = next * (destinations.length - 1);
      setFocusPosition((prev) => (Math.abs(prev - pos) > 0.002 ? pos : prev));

      if (hoverIndexRef.current === null) {
        const nearest = Math.min(destinations.length - 1, Math.max(0, Math.round(pos)));
        setActiveIndex((prev) => (prev === nearest ? prev : nearest));
      }

      rafRef.current = window.requestAnimationFrame(animate);
    };

    onScroll();
    rafRef.current = window.requestAnimationFrame(animate);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.clearTimeout(introTimer);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      document.body.dataset.cbaIntro = "";
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const meter = useMemo(() => {
    const step = 1 / destinations.length;
    return destinations.map((_, idx) => {
      const from = idx * step;
      const to = (idx + 1) * step;
      const on = scrollProgress >= from && scrollProgress < to;
      return on;
    });
  }, [scrollProgress]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const frame = stackRef.current;
    if (!frame) return;

    const rect = frame.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mx = ((event.clientX - centerX) / rect.width) * 2;
    const my = ((event.clientY - centerY) / rect.height) * 2;

    frame.style.setProperty("--cba-mx", mx.toFixed(3));
    frame.style.setProperty("--cba-my", my.toFixed(3));
  };

  const handlePointerLeave = () => {
    const frame = stackRef.current;
    if (!frame) return;
    frame.style.setProperty("--cba-mx", "0");
    frame.style.setProperty("--cba-my", "0");
    setHoverIndex(null);
  };

  return (
    <>
      <section className="cba-opening-scroll-scene" ref={sceneRef} aria-label="CBA destination stack">
        <div className={`cba-opening-intro-screen ${introVisible ? "" : "is-hidden"}`}>
          <p className="cba-opening-kicker">Montréal • Music Collective</p>
          <h1 className="cba-opening-wordmark" aria-label="CBA">
            <span>C</span>
            <span>B</span>
            <span>A</span>
          </h1>
          <p className="cba-opening-tagline">A studio for beats, sessions, and stages.</p>
          <button
            type="button"
            className="cba-opening-enter"
            onClick={() => {
              setIntroVisible(false);
              document.body.dataset.cbaIntro = "done";
              document.body.style.overflow = originalOverflowRef.current;
            }}
          >
            Enter
          </button>
        </div>

        <div className={`cba-opening-stack cba-opening-stack-sticky ${introVisible ? "" : "is-visible"}`}>
          <div className="cba-opening-scroll-meta" aria-hidden="true">
            <span>Destinations</span>
            <div className="cba-opening-scroll-meter">
              {meter.map((on, idx) => (
                <span key={`meter-${idx}`} className={on ? "is-on" : ""} />
              ))}
            </div>
          </div>

          <div
            className="cba-opening-stack-frame"
            ref={stackRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            role="list"
            aria-label="Primary destinations"
          >
              {destinations.map((item, index) => {
              const depth = index - focusPosition;
              const absDepth = Math.abs(depth);

              const style = {
                "--cba-depth": depth,
                "--cba-abs-depth": absDepth,
                "--cba-tone": item.tone
              } as CSSProperties;

              const drift = (scrollProgress * (destinations.length - 1) - index) * 30;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`cba-opening-drawer ${index === activeIndex ? "is-active" : ""}`}
                  style={{ ...style, "--cba-drift": `${drift}px` } as CSSProperties}
                  onPointerEnter={() => {
                    setHoverIndex(index);
                    setActiveIndex(index);
                  }}
                  onFocus={() => {
                    setHoverIndex(index);
                    setActiveIndex(index);
                  }}
                  onBlur={() => setHoverIndex(null)}
                  role="listitem"
                  aria-current={index === activeIndex ? "true" : undefined}
                >
                  <span className="cba-opening-drawer-title">{item.label}</span>
                  <span className="cba-opening-drawer-caption">{item.caption}</span>
                  <span className="cba-opening-drawer-arrow" aria-hidden="true">
                    →
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
