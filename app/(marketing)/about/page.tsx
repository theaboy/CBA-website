import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function AboutPage() {
  const page = pageSummaries["/about"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="route-placeholder-grid">
          <article className="route-placeholder-card">
            <h3>Histoire du groupe</h3>
            <p>Structure éditoriale pour les origines, le processus, les collaborateurs et le catalogue évolutif.</p>
          </article>
          <article className="route-placeholder-card">
            <h3>Presse / médias</h3>
            <p>Espace réservé pour les médias intégrés, la photographie et les références presse.</p>
          </article>
        </div>
      </Section>
    </div>
  );
}
