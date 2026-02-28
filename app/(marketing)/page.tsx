import { FeaturedBeats } from "@/components/home/featured-beats";
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
        eyebrow="Beat Priority"
        title="Browse-first pathways now sit inside the homepage story."
        body="The homepage no longer points at a future marketplace. It previews the catalog directly, lets visitors audition the vibe, and moves them into the beats page with actual playback continuity."
      >
        <FeaturedBeats />
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
        title="Public routes now support a real audio-first browsing loop."
        body="Visitors can discover featured beats on the homepage, move into the marketplace, filter the catalog, and keep playback alive while the inquiry and booking layers are built next."
      />
    </>
  );
}
