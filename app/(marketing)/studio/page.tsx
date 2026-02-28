import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function StudioPage() {
  const page = pageSummaries["/studio"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="preview-grid">
          {["Tracking sessions", "Vocal production", "Mix-ready packages"].map((title) => (
            <article key={title} className="preview-card">
              <h3>{title}</h3>
              <p>Phase 1 establishes the content and layout space for pricing, package, and schedule UX.</p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
