"use client";

import { useEffect, useState } from "react";

/**
 * Returns true when the viewport is at or below `breakpoint` px.
 * For inline-styled components that can't use CSS media queries.
 * SSR-safe: starts false, syncs on mount.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}
