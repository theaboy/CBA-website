import { HomeHero } from "@/components/home/home-hero";
import { PhasePillars } from "@/components/home/phase-pillars";
import { ReferenceGallery } from "@/components/home/reference-gallery";
import { RouteMarquee } from "@/components/home/route-marquee";
import { Section } from "@/components/primitives/section";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <RouteMarquee />

      <Section
        eyebrow="Creative System"
        title="A foundation built for premium audio browsing, not generic startup polish."
        body="Phase 1 locks in the visual grammar: deep contrast, editorial typography, strong surfaces, and a page rhythm that can support beats, bookings, and artist storytelling."
      >
        <PhasePillars />
      </Section>

      <Section
        eyebrow="Client References"
        title="Customer material is already shaping the interface."
        body="The mockups supplied in the repository are treated as directional references, then translated into reusable code instead of one-off compositions."
      >
        <ReferenceGallery />
      </Section>

      <Section
        eyebrow="Launch Intent"
        title="Public routes exist now so each next phase lands on a real product shell."
        body="The beats, studio, events, and admin experiences all connect to the same design system and route architecture, which keeps the product coherent as business-critical flows are added."
      />
    </>
  );
}
