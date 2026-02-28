import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function EventsPage() {
  const page = pageSummaries["/events"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="preview-grid">
          {["Montreal rooftop set", "Warehouse release night", "Private showcase"].map((title) => (
            <article key={title} className="preview-card">
              <p className="eyebrow">Placeholder Event</p>
              <h3>{title}</h3>
              <p>Poster slot, date, venue, and inquiry actions will connect here in later phases.</p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
