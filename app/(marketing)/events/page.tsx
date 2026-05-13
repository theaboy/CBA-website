import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function EventsPage() {
  const page = pageSummaries["/events"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="preview-grid">
          {["Set sur les toits de Montréal", "Soirée de sortie en entrepôt", "Showcase privé"].map((title) => (
            <article key={title} className="preview-card">
              <p className="eyebrow">Événement à venir</p>
              <h3>{title}</h3>
              <p>L'affiche, la date, le lieu et les actions de demande seront connectés ici dans les phases suivantes.</p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
