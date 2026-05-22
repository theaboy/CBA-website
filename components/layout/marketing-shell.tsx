"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MarketingShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isReservation = pathname === "/reservation";

  // Scroll reveal via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    const reveals = document.querySelectorAll(".reveal");
    reveals.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="marketing-shell">
      {!isReservation && <div className="grain-overlay" aria-hidden="true" />}
      {!isReservation && <div className="ambient ambient-one" aria-hidden="true" />}
      {!isReservation && <div className="ambient ambient-two" aria-hidden="true" />}
      <main>{children}</main>
    </div>
  );
}
