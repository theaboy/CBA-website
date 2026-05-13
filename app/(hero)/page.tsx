"use client";

import { ScrollHero } from "@/components/home/scroll-hero";
import { EditorialCatalog } from "@/components/home/editorial-catalog";
import { StudioSectionMockup } from "@/components/home/studio-section-mockup";
import { EventsSection } from "@/components/home/events-section";

export default function HomePage() {
  return (
    <>
      <ScrollHero />
      <EditorialCatalog />
      <StudioSectionMockup />
      <EventsSection />
    </>
  );
}
