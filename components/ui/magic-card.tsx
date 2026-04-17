"use client";

import React, { useCallback, useEffect } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";

import { cn } from "@/lib/utils";

interface MagicCardProps {
  children: React.ReactNode;
  className?: string;
  gradientSize?: number;
  gradientFrom?: string;
  gradientTo?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

export function MagicCard({
  children,
  className,
  gradientSize = 260,
  gradientFrom = "rgba(212, 163, 115, 0.95)",
  gradientTo = "rgba(62, 76, 63, 0.85)",
  overlayColor = "rgba(245, 235, 216, 0.18)",
  overlayOpacity = 0.85,
}: MagicCardProps) {
  const reduceMotion = useReducedMotion();

  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);
  const softX = useSpring(mouseX, { stiffness: 230, damping: 30, mass: 0.5 });
  const softY = useSpring(mouseY, { stiffness: 230, damping: 30, mass: 0.5 });

  useEffect(() => {
    if (!reduceMotion) return;
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY, reduceMotion]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduceMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      mouseX.set(event.clientX - rect.left);
      mouseY.set(event.clientY - rect.top);
    },
    [mouseX, mouseY, reduceMotion],
  );

  const onPointerLeave = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  const borderGradient = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${softX}px ${softY}px, ${gradientFrom}, ${gradientTo}, transparent 85%)
  `;
  const overlayGradient = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${softX}px ${softY}px, ${overlayColor}, transparent 70%)
  `;

  return (
    <motion.div
      className={cn(
        "group relative isolate overflow-hidden rounded-[inherit] border border-transparent bg-transparent",
        className,
      )}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      style={{ backgroundImage: borderGradient }}
    >
      <div className="absolute inset-px z-10 rounded-[inherit] bg-[rgba(13,15,14,0.92)]" />
      {!reduceMotion && (
        <motion.div
          className="pointer-events-none absolute inset-px z-20 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ backgroundImage: overlayGradient, opacity: overlayOpacity }}
        />
      )}
      <div className="relative z-30">{children}</div>
    </motion.div>
  );
}
