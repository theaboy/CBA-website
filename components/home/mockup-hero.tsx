"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import styles from "./mockup-hero.module.css";

const HERO_COPY = {
  eyebrow: "Collectif Musical Montréalais",
  lines: ["Souterrain.", "Brut.", "Indéniable."],
  subtitle:
    "Sessions sur mesure, moments live et son prêt à sortir — pour les artistes qui veulent du poids, de la texture et une identité.",
};

export function MockupHero() {
  const rootRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const springX = useSpring(pointerX, { stiffness: 180, damping: 28, mass: 0.55 });
  const springY = useSpring(pointerY, { stiffness: 180, damping: 28, mass: 0.55 });

  const glowX = useTransform(springX, [0, 1], ["6%", "94%"]);
  const glowY = useTransform(springY, [0, 1], ["8%", "90%"]);
  const reactiveGlow = useMotionTemplate`radial-gradient(520px circle at ${glowX} ${glowY}, rgba(212, 163, 115, 0.28), rgba(62, 76, 63, 0.05) 38%, transparent 70%)`;

  const orbX = useTransform(springX, [0, 1], [-28, 28]);
  const orbY = useTransform(springY, [0, 1], [-20, 20]);
  const orbRotate = useTransform(springX, [0, 1], [-10, 10]);

  const mainFrameY = useTransform(springY, [0, 1], [12, -12]);
  const sideFrameY = useTransform(springY, [0, 1], [10, -14]);
  const sideFrameX = useTransform(springX, [0, 1], [-8, 8]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(pointer: coarse)").matches || reduceMotion) {
      pointerX.set(0.5);
      pointerY.set(0.5);
      return;
    }

    const onMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      pointerX.set(Math.min(1, Math.max(0, x)));
      pointerY.set(Math.min(1, Math.max(0, y)));
    };

    const onLeave = () => {
      pointerX.set(0.5);
      pointerY.set(0.5);
    };

    root.addEventListener("mousemove", onMove);
    root.addEventListener("mouseleave", onLeave);

    return () => {
      root.removeEventListener("mousemove", onMove);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, [pointerX, pointerY, reduceMotion]);

  return (
    <section ref={rootRef} className={`${styles.hero} motion-safe:animate-fade-up`} aria-label="Accueil CBA">
      <div className={styles.bgLayer} aria-hidden>
        <Image
          src="/cba/cba-hero-1.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
        />
      </div>
      <div className={styles.bgShade} aria-hidden />
      <div className={styles.bgGlow} aria-hidden />
      <div className={styles.bgGrain} aria-hidden />
      <div className={styles.gridOverlay} aria-hidden>
        <InteractiveGridPattern
          width={28}
          height={28}
          squares={[54, 34]}
          className={styles.gridPattern}
          squaresClassName={styles.gridSquare}
        />
      </div>
      {!reduceMotion && (
        <motion.div className={styles.reactiveGlow} aria-hidden style={{ backgroundImage: reactiveGlow }} />
      )}

      <div className={styles.inner}>
        <div className={styles.copyCol}>
          <motion.p
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            {HERO_COPY.eyebrow}
          </motion.p>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>{HERO_COPY.lines[0]}</span>
            <span>{HERO_COPY.lines[1]}</span>
            <span>{HERO_COPY.lines[2]}</span>
          </motion.h1>
          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.84, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            {HERO_COPY.subtitle}
          </motion.p>

          <motion.div
            className={styles.actions}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.78, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href="/beats" className={`${styles.primaryAction} motion-safe:hover:animate-soft-float`}>
              Explorer les Beats <ArrowRight size={16} />
            </Link>
            <Link href="/studio" className={styles.secondaryAction}>
              Réserver le Studio
            </Link>
          </motion.div>

          <motion.div
            className={styles.meta}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.76, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
          >
            <span>Sessions live</span>
            <span>Mixage premium</span>
            <span>Création indépendante</span>
          </motion.div>
        </div>

        <div className={styles.visualCol}>
          <motion.figure
            className={styles.mainFrame}
            style={reduceMotion ? undefined : { y: mainFrameY }}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/cba/cba-hero-2.jpg"
              alt="Session d'enregistrement CBA en studio."
              fill
              sizes="(max-width: 900px) 88vw, 36vw"
              className={styles.mainFrameImage}
            />
            <figcaption className={styles.mainFrameCaption}>
              Salle live + régie analogique
            </figcaption>
          </motion.figure>

          <motion.div
            className={styles.sideFrame}
            aria-hidden
            style={reduceMotion ? undefined : { x: sideFrameX, y: sideFrameY }}
            initial={{ opacity: 0, y: 26, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.05, delay: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src="/cba/cba-photo-2.jpg"
              alt=""
              fill
              sizes="(max-width: 900px) 50vw, 16vw"
              className={styles.sideFrameImage}
            />
          </motion.div>

          <motion.div
            className={`${styles.signatureRelic} motion-safe:animate-soft-float`}
            aria-hidden
            style={reduceMotion ? undefined : { x: orbX, y: orbY, rotate: orbRotate }}
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.15, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.relicHalo} />
            <div className={styles.relicBody}>
              <Image
                src="/cba/cba-logo.png"
                alt=""
                width={132}
                height={132}
                className={styles.relicLogo}
              />
            </div>
            <span className={styles.relicLabel}>Collectif depuis 2020</span>
          </motion.div>
        </div>
      </div>

      <div className={styles.scrollHint} aria-hidden>
        <span className={styles.scrollLine} />
        <span className={styles.scrollText}>Défiler</span>
      </div>
    </section>
  );
}
