"use client";

import { useEffect } from "react";
import { FullScreenScrollFXDemo } from "@/components/ui/full-screen-scroll-fx-demo";

export default function FullScreenFXPage() {
  useEffect(() => {
    document.body.dataset.fxFullscreen = "1";
    return () => {
      delete document.body.dataset.fxFullscreen;
    };
  }, []);

  return <FullScreenScrollFXDemo />;
}
