import { ScrollHero } from "@/components/home/scroll-hero";
import { EditorialCatalog } from "@/components/home/editorial-catalog";
import { StudioSectionMockup } from "@/components/home/studio-section-mockup";
import { EventsSection } from "@/components/home/events-section";
import { RadioSection } from "@/components/home/radio-section";
import { getFeaturedBeats } from "@/lib/beats/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const beats = await getFeaturedBeats();

  return (
    <>
      <ScrollHero />
      <div style={{ background: "#131816" }}>
        <EditorialCatalog beats={beats} />
        <StudioSectionMockup />
        <EventsSection />
        <RadioSection />
      </div>
    </>
  );
}
