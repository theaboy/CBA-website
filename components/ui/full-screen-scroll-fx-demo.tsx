"use client";

import React from "react";
import { FullScreenFXAPI, FullScreenScrollFX } from "@/components/ui/full-screen-scroll-fx";

const sections = [
  {
    leftLabel: "Home",
    title: <>Home</>,
    rightLabel: "Home",
    background:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=2200&q=80"
  },
  {
    leftLabel: "Beats",
    title: <>Beats</>,
    rightLabel: "Beats",
    background:
      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=2200&q=80"
  },
  {
    leftLabel: "Events",
    title: <>Events</>,
    rightLabel: "Events",
    background:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=2200&q=80"
  },
  {
    leftLabel: "Studio",
    title: <>Studio</>,
    rightLabel: "Studio",
    background:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=2200&q=80"
  },
  {
    leftLabel: "DJ Services",
    title: <>DJ Services</>,
    rightLabel: "DJ Services",
    background:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=2200&q=80"
  },
  {
    leftLabel: "About",
    title: <>About</>,
    rightLabel: "About",
    background:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=2200&q=80"
  },
  {
    leftLabel: "Contact",
    title: <>Contact</>,
    rightLabel: "Contact",
    background:
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=2200&q=80"
  }
];

export function FullScreenScrollFXDemo() {
  const apiRef = React.useRef<FullScreenFXAPI>(null);

  return (
    <FullScreenScrollFX
      apiRef={apiRef}
      sections={sections}
      header={
        <>
          <div>CBA Live Sessions</div>
          <div>After Dark</div>
        </>
      }
      footer={<div />}
      fontFamily={'var(--cinzel), "Times New Roman", serif'}
      showProgress
      durations={{ change: 0.7, snap: 800 }}
    />
  );
}
