import { pageSummaries, siteConfig } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function ContactPage() {
  const page = pageSummaries["/contact"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="route-placeholder-grid">
          <article className="route-placeholder-card">
            <h3>Location</h3>
            <p>{siteConfig.location}</p>
            <p>Contact form and booking-specific messaging will connect here in the next phases.</p>
          </article>
          <article className="route-placeholder-card">
            <h3>Signal quality</h3>
            <p>Structured inquiries, licensing notes, and response expectations will be layered into this surface.</p>
          </article>
        </div>
      </Section>
    </div>
  );
}
