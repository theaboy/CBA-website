"use client";

import type { CSSProperties, ReactNode } from "react";
import { useScrollReveal } from "@/components/ui/use-scroll-reveal";

interface ScrollRevealSectionProps {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

export function ScrollRevealSection({
  children,
  delay = 0,
  distance = 80,
  duration = 900,
  className,
  style,
}: ScrollRevealSectionProps) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: revealed ? undefined : 0,
        animation: revealed
          ? `sectionRiseIn ${duration}ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms both`
          : "none",
        willChange: "transform, opacity",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
