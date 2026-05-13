import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function DjServicesPage() {
  const page = pageSummaries["/dj-services"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="route-placeholder-grid">
          <article className="route-placeholder-card">
            <h3>Positionnement du service</h3>
            <p>Équipement, types d'événements et présentation axée sur l'ambiance débutent ici.</p>
          </article>
          <article className="route-placeholder-card">
            <h3>Structure prête aux demandes</h3>
            <p>Les phases suivantes connecteront le budget, le lieu et la durée dans un flux de leads géré.</p>
          </article>
        </div>
      </Section>
    </div>
  );
}
