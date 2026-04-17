"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as THREE from "three";

const TOTAL_FRAMES = 73;
const FRAME_PATH = (n: number) => `/frames/frame_${String(n).padStart(4, "0")}.jpg`;

export function ScrollHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLCanvasElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const framesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef(0);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number>(0);

  // ── FRAME PRELOAD ──
  useEffect(() => {
    const frames: HTMLImageElement[] = [];
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);
      img.onload = () => { loadedRef.current++; };
      frames.push(img);
    }
    framesRef.current = frames;
    return () => { framesRef.current = []; };
  }, []);

  // ── SCROLL CANVAS ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    const heroContent = heroContentRef.current;
    if (!canvas || !section || !heroContent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    function resizeCanvas() {
      if (!canvas) return;
      dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      if (ctx) ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function drawFrame(index: number) {
      if (!ctx || !canvas) return;
      const img = framesRef.current[index];
      if (!img || !img.complete) return;
      const W = window.innerWidth;
      const H = window.innerHeight;

      // 1. Draw blurred full-cover version as background
      ctx.save();
      ctx.filter = "blur(32px) brightness(0.5)";
      const bgScale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const bgW = img.naturalWidth * bgScale;
      const bgH = img.naturalHeight * bgScale;
      ctx.drawImage(img, (W - bgW) / 2, (H - bgH) / 2, bgW, bgH);
      ctx.restore();

      // 2. Draw contained version on top (full mic visible)
      const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }

    function onScroll() {
      if (!section || !heroContent) return;
      const scrollTop = window.scrollY;
      const sectionH = section.offsetHeight;
      const stickyH = window.innerHeight;
      const scrollable = sectionH - stickyH;
      const progress = Math.min(1, Math.max(0, scrollTop / scrollable));

      const frameIndex = Math.min(
        TOTAL_FRAMES - 1,
        Math.floor(progress * TOTAL_FRAMES)
      );

      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        drawFrame(frameIndex);
      }

      // Fade hero content out in first 18% of scroll
      const contentOpacity = Math.max(0, 1 - progress / 0.18);
      heroContent.style.opacity = String(contentOpacity);
      heroContent.style.transform = `translateY(${progress * -40}px)`;
    }

    // Draw first frame immediately
    const checkFirst = setInterval(() => {
      if (framesRef.current[0]?.complete) {
        drawFrame(0);
        clearInterval(checkFirst);
      }
    }, 50);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resizeCanvas);
      clearInterval(checkFirst);
    };
  }, []);

  // ── THREE.JS PARTICLES ──
  useEffect(() => {
    const canvas = threeCanvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 80;

    function resize() {
      const w = canvas!.parentElement!.offsetWidth;
      const h = canvas!.parentElement!.offsetHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener("resize", resize);

    // Waveform particle strip
    const count = 2000;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const basePos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * 2 - 1;
      const spread = (Math.random() - 0.5) * 60;
      pos[i * 3] = basePos[i * 3] = t * 120;
      pos[i * 3 + 1] = basePos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = basePos[i * 3 + 2] = spread * 0.4;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xff7a18, size: 0.4,
      transparent: true, opacity: 0.55,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Ambient dust
    const dustCount = 800;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 300;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 150;
      dustPos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xff3d00, size: 0.2,
      transparent: true, opacity: 0.2,
    });
    scene.add(new THREE.Points(dustGeo, dustMat));

    const mouse = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    let time = 0;
    function animate() {
      rafRef.current = requestAnimationFrame(animate);
      time += 0.012;
      const positions = geo.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const base = basePos[i * 3];
        const waveAmp = 8 + 4 * Math.sin(base * 0.03 + time * 0.7);
        positions[i * 3 + 1] = basePos[i * 3 + 1] + Math.sin(base * 0.08 + time) * waveAmp;
        positions[i * 3 + 2] = basePos[i * 3 + 2] + Math.cos(base * 0.05 + time * 0.5) * 3;
      }
      geo.attributes.position.needsUpdate = true;
      particles.rotation.y += 0.0008;
      camera.position.x += (mouse.x * 8 - camera.position.x) * 0.03;
      camera.position.y += (mouse.y * 4 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      geo.dispose();
      mat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      aria-label="CBA — Hero"
      style={{
        position: "relative",
        height: `${TOTAL_FRAMES * 40}px`, // scroll distance
      }}
    >
      {/* Sticky viewport */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#0B0B0F",
        }}
      >
        {/* Video frame canvas */}
        <canvas
          ref={canvasRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />

        {/* Darkening overlay + edge vignette */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(11,11,15,0.35) 0%, transparent 20%, transparent 75%, #0B0B0F 100%), " +
              "linear-gradient(to right, rgba(11,11,15,0.3) 0%, transparent 20%, transparent 80%, rgba(11,11,15,0.3) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* Three.js particles */}
        <canvas
          ref={threeCanvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />

        {/* Hero text — fades out on scroll */}
        <div
          ref={heroContentRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 5,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "0 24px",
            willChange: "opacity, transform",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "0.7rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "rgba(240,237,232,0.5)",
              marginBottom: "1.5rem",
            }}
          >
            Montréal · Collectif Musical · Est. 2020
          </p>

          <h1
            style={{
              fontFamily: "var(--font-heading, sans-serif)",
              fontSize: "clamp(3.5rem, 12vw, 9rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
              color: "#F0EDE8",
              marginBottom: "1.25rem",
            }}
          >
            CB<span style={{ color: "#FF7A18" }}>A</span>
          </h1>

          <p
            style={{
              fontFamily: "var(--font-heading, sans-serif)",
              fontSize: "clamp(0.85rem, 2vw, 1.1rem)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "rgba(240,237,232,0.55)",
              marginBottom: "2.5rem",
            }}
          >
            Production
          </p>

          <p
            style={{
              maxWidth: "520px",
              fontSize: "clamp(0.95rem, 1.8vw, 1.1rem)",
              lineHeight: 1.65,
              color: "rgba(240,237,232,0.72)",
              marginBottom: "2.5rem",
            }}
          >
            Sessions sur mesure, moments live et son prêt à sortir — pour les artistes qui veulent du poids, de la texture et une identité.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href="/beats"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.75rem",
                background: "#FF7A18",
                color: "#000",
                fontWeight: 600,
                fontSize: "0.9rem",
                borderRadius: "100px",
                textDecoration: "none",
                letterSpacing: "0.01em",
              }}
            >
              Explorer les Beats <ArrowRight size={15} />
            </Link>
            <Link
              href="/studio"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.75rem 1.75rem",
                border: "1px solid rgba(255,255,255,0.18)",
                color: "#F0EDE8",
                fontWeight: 500,
                fontSize: "0.9rem",
                borderRadius: "100px",
                textDecoration: "none",
                backdropFilter: "blur(8px)",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              Réserver le Studio
            </Link>
          </div>

          {/* Scroll cue */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              bottom: "2.5rem",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div
              style={{
                width: "1px",
                height: "48px",
                background: "linear-gradient(to bottom, rgba(255,122,24,0.7), transparent)",
                animation: "scrollPulse 1.8s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(240,237,232,0.4)",
              }}
            >
              Défiler
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(0.8); }
          50% { opacity: 1; transform: scaleY(1); }
        }
      `}</style>
    </section>
  );
}
