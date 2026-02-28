import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function DjServicesPage() {
  const page = pageSummaries["/dj-services"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="route-placeholder-grid">
          <article className="route-placeholder-card">
            <h3>Service positioning</h3>
            <p>Equipment, event types, and atmosphere-led presentation start here.</p>
          </article>
          <article className="route-placeholder-card">
            <h3>Inquiry-ready structure</h3>
            <p>Later phases connect budget, location, and duration fields into a managed lead flow.</p>
          </article>
        </div>
      </Section>
    </div>
  );
}
