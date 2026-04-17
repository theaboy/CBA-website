"use client";

import { useEffect, useRef, ReactNode } from "react";

interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function TextReveal({ children, className = "", delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Split text into word spans
    const words = el.innerText.split(" ");
    el.innerHTML = words
      .map(
        (w, i) =>
          `<span style="display:inline-block;opacity:0;transform:translateY(20px);transition:opacity 0.5s ease ${delay + i * 0.05}s, transform 0.5s ease ${delay + i * 0.05}s">${w}&nbsp;</span>`
      )
      .join("");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const spans = el.querySelectorAll("span");
            spans.forEach((span) => {
              (span as HTMLElement).style.opacity = "1";
              (span as HTMLElement).style.transform = "translateY(0px)";
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
