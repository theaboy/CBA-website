"use client";

import { useEffect, useRef } from "react";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const outline = outlineRef.current;
    if (!dot || !outline) return;

    let outlineX = 0;
    let outlineY = 0;
    let animId: number;

    const onMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      dot.style.transform = `translate(${x - 4}px, ${y - 4}px)`;

      // Lerp outline toward cursor
      outlineX += (x - outlineX) * 0.15;
      outlineY += (y - outlineY) * 0.15;
    };

    const animate = () => {
      outline.style.transform = `translate(${outlineX - 16}px, ${outlineY - 16}px)`;
      animId = requestAnimationFrame(animate);
    };

    const onEnterInteractive = () => {
      dot.style.transform += " scale(2)";
      outline.style.width = "3rem";
      outline.style.height = "3rem";
    };

    const onLeaveInteractive = () => {
      outline.style.width = "2rem";
      outline.style.height = "2rem";
    };

    window.addEventListener("mousemove", onMove);
    animId = requestAnimationFrame(animate);

    const interactives = document.querySelectorAll("a, button, [role='button']");
    interactives.forEach((el) => {
      el.addEventListener("mouseenter", onEnterInteractive);
      el.addEventListener("mouseleave", onLeaveInteractive);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(animId);
      interactives.forEach((el) => {
        el.removeEventListener("mouseenter", onEnterInteractive);
        el.removeEventListener("mouseleave", onLeaveInteractive);
      });
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
      <div ref={outlineRef} className="cursor-outline" />
    </>
  );
}
