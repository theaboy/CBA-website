"use client";

import Link from "next/link";
import { Headphones } from "lucide-react";
import { useEffect, useRef } from "react";
import styles from "./radio-section.module.css";

/* ── Dot-matrix 5×7 patterns ─────────────────────────────────────── */

const PATTERNS: Record<string, number[][]> = {
  R: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 1, 0, 0, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 1],
  ],
  A: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  D: [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
  ],
  I: [
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
  ],
  O: [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
  ],
};

const COLS       = 40;
const ROWS       = 9;
const CHAR_W     = 5;
const CHAR_GAP   = 2;
const ROW_OFFSET = 1;
const COL_OFFSET = 4;

function buildGrid(): boolean[][] {
  const grid: boolean[][] = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(false)
  );
  "RADIO".split("").forEach((ch, ci) => {
    const pat = PATTERNS[ch];
    if (!pat) return;
    const cs = COL_OFFSET + ci * (CHAR_W + CHAR_GAP);
    pat.forEach((row, ri) => {
      row.forEach((v, ci2) => {
        const r = ROW_OFFSET + ri;
        const c = cs + ci2;
        if (v && r < ROWS && c < COLS) grid[r][c] = true;
      });
    });
  });
  return grid;
}

const GRID = buildGrid();

/* ── Animation state (kept in a ref — never touches React state) ─── */

type Phase = "idle" | "pulse" | "full" | "wipe" | "done";

interface DrawState {
  phase: Phase;
  levels: number[];   // per-column fill level (0 = empty, ROWS = full)
  wipedRows: number;  // rows 0..wipedRows-1 cleared to RADIO-only
}

/* ── Canvas render ───────────────────────────────────────────────── */

function renderFrame(canvas: HTMLCanvasElement, state: DrawState, now: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W   = canvas.width;
  const H   = canvas.height;
  const dpr = window.devicePixelRatio || 1;
  const gap = Math.max(1, Math.round(3 * dpr));

  const cellW  = (W - gap * (COLS - 1)) / COLS;
  const cellH  = (H - gap * (ROWS - 1)) / ROWS;
  const radius = Math.min(cellW, cellH) * 0.22;

  const { phase, levels, wipedRows } = state;

  // Breathing value for "done" phase — 0..1 over a 3 s sine cycle
  const breathT = 0.5 + 0.5 * Math.sin((now / 3000) * Math.PI * 2);

  ctx.clearRect(0, 0, W, H);

  /* ── Pass 1: off pixels (no shadow) ── */
  ctx.shadowBlur = 0;
  ctx.fillStyle  = "oklch(17% 0.03 60)";
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const x = col * (cellW + gap);
      const y = row * (cellH + gap);
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, radius);
      ctx.fill();
    }
  }

  /* ── Pass 2: lit pixels (with glow) ── */
  ctx.shadowColor = "oklch(70% 0.14 68 / 0.85)";

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let lit = false;
      switch (phase) {
        case "pulse": lit = row >= ROWS - (levels[col] ?? 0); break;
        case "full":  lit = true; break;
        case "wipe":  lit = row < wipedRows ? GRID[row][col] : true; break;
        case "done":  lit = GRID[row][col]; break;
      }
      if (!lit) continue;

      const isRadio = GRID[row][col];

      if (phase === "done" && isRadio) {
        // Gentle breathing: blur 6→16px, alpha 0.80→1.0
        ctx.shadowBlur = 6 + 10 * breathT;
        ctx.fillStyle  = `oklch(72% 0.14 68 / ${0.80 + 0.20 * breathT})`;
      } else {
        ctx.shadowBlur = 10;
        ctx.fillStyle  = "oklch(72% 0.14 68)";
      }

      const x = col * (cellW + gap);
      const y = row * (cellH + gap);
      ctx.beginPath();
      ctx.roundRect(x, y, cellW, cellH, radius);
      ctx.fill();
    }
  }

  ctx.shadowBlur = 0;
}

/* ── Component ───────────────────────────────────────────────────── */

export function RadioSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const hasAnimated = useRef(false);
  const stateRef    = useRef<DrawState>({
    phase: "idle",
    levels: Array(COLS).fill(0),
    wipedRows: 0,
  });
  const rafRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    /* ── Size canvas to physical pixels ── */
    function resizeCanvas() {
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas!.getBoundingClientRect();
      canvas!.width  = Math.round(rect.width  * dpr);
      canvas!.height = Math.round(rect.height * dpr);
    }
    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas);

    /* ── RAF draw loop (runs from mount; keeps breathing alive in "done") ── */
    function tick(now: number) {
      renderFrame(canvas!, stateRef.current, now);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    /* ── Animation sequencer (only mutates stateRef, no React state) ── */
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    async function run() {
      const upd = (fn: (prev: DrawState) => DrawState) => {
        if (!cancelled) stateRef.current = fn(stateRef.current);
      };

      /* Phase 1 — two uneven pulse cycles */
      for (let pulse = 0; pulse < 2; pulse++) {
        const targets = Array.from({ length: COLS }, () =>
          Math.floor(Math.random() * (ROWS - 2)) + 2
        );
        const speeds = Array.from({ length: COLS }, () =>
          0.4 + Math.random() * 0.6
        );

        upd((p) => ({ ...p, phase: "pulse" }));

        for (let step = 1; step <= 10; step++) {
          await wait(45);
          if (cancelled) return;
          upd((p) => ({
            ...p,
            levels: targets.map((t, i) =>
              Math.round(t * Math.min(1, (step * speeds[i]) / 10))
            ),
          }));
        }

        await wait(90);
        if (cancelled) return;

        for (let step = 7; step >= 0; step--) {
          await wait(30);
          if (cancelled) return;
          upd((p) => ({
            ...p,
            levels: targets.map((t) => Math.round((t * step) / 8)),
          }));
        }

        await wait(60);
        if (cancelled) return;
      }

      /* Phase 2 — full fill, hold 333 ms */
      upd(() => ({ phase: "full", levels: Array(COLS).fill(ROWS), wipedRows: 0 }));
      await wait(333);
      if (cancelled) return;

      /* Phase 3 — wipe rows top → bottom */
      upd((p) => ({ ...p, phase: "wipe", wipedRows: 0 }));
      for (let row = 0; row < ROWS; row++) {
        await wait(58);
        if (cancelled) return;
        upd((p) => ({ ...p, wipedRows: row + 1 }));
      }

      await wait(40);
      if (cancelled) return;

      /* Phase 4 — done: RADIO pixels breathe via RAF */
      upd(() => ({ phase: "done", levels: Array(COLS).fill(0), wipedRows: ROWS }));
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          run();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(section);

    return () => {
      cancelled = true;
      observer.disconnect();
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="listen"
      aria-labelledby="radio-home-heading"
      className={styles.section}
    >
      <div className={styles.inner}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className={styles.header}>
          <p className={styles.eyebrow}>
            <span className={styles.liveDot} aria-hidden />
            Radio CBA · Archives
          </p>
          <h2 id="radio-home-heading" className={styles.title}>
            Nos Ondes
          </h2>
          <div className={styles.ornament} aria-hidden>
            <span className={styles.ornLine} />
            <span className={styles.ornDiamond} />
            <span className={styles.ornLine} />
          </div>
          <div className={styles.headerLinks}>
            <Link href="/radio" className={styles.headerLink}>
              <Headphones size={13} />
              Toutes les émissions
            </Link>
            <Link href="/desktop-fm" className={styles.headerLinkAlt}>
              Radio page V2
            </Link>
          </div>
        </header>

        {/* ── LED panel ──────────────────────────────────────────── */}
        <div className={styles.panel}>

          <canvas
            ref={canvasRef}
            className={styles.pixelCanvas}
            role="img"
            aria-label="Affichage LED : RADIO"
          />

          <div className={styles.panelFooter}>
            <span className={styles.footerLabel}>
              Archives Sonores <span className={styles.footerDot} />
            </span>
            <span className={styles.footerLabel}>
              <span className={styles.footerDot} /> 82:04:33
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
