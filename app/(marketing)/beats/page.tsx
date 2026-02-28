import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function BeatsPage() {
  const page = pageSummaries["/beats"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="route-placeholder-grid">
          <article className="route-placeholder-card">
            <h3>Marketplace shell ready</h3>
            <ul>
              <li>Grid composition space for beat cards</li>
              <li>Room for future filters, sort controls, and player dock</li>
              <li>Typography and spacing tuned for metadata-heavy cards</li>
            </ul>
          </article>
          <article className="route-placeholder-card">
            <h3>Coming in Phase 2</h3>
            <p>Persistent mini-player, one-track playback control, and browsing logic.</p>
          </article>
        </div>
      </Section>
    </div>
  );
}
