import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function AboutPage() {
  const page = pageSummaries["/about"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="route-placeholder-grid">
          <article className="route-placeholder-card">
            <h3>Band story</h3>
            <p>Editorial structure for roots, process, collaborators, and evolving catalog.</p>
          </article>
          <article className="route-placeholder-card">
            <h3>Press / media</h3>
            <p>Reserved space for embedded media, photography, and press references.</p>
          </article>
        </div>
      </Section>
    </div>
  );
}
