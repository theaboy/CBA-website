import { pageSummaries, siteConfig } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function ContactPage() {
  const page = pageSummaries["/contact"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="route-placeholder-grid">
          <article className="route-placeholder-card">
            <h3>Localisation</h3>
            <p>{siteConfig.location}</p>
            <p>Le formulaire de contact et les messages liés aux réservations seront intégrés ici dans les prochaines phases.</p>
          </article>
          <article className="route-placeholder-card">
            <h3>Qualité du signal</h3>
            <p>Les demandes structurées, notes de licence et délais de réponse seront ajoutés à cette surface.</p>
          </article>
        </div>
      </Section>
    </div>
  );
}
