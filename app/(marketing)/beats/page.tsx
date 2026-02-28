import { BeatsMarketplace } from "@/components/beats/beats-marketplace";
import { beatBpmRange, beatGenres, beatMoods, beatPriceRange } from "@/lib/beats";
import { pageSummaries } from "@/lib/site";
import { Section } from "@/components/primitives/section";

export default function BeatsPage() {
  const page = pageSummaries["/beats"];

  return (
    <div className="page-shell">
      <Section eyebrow={page.eyebrow} title={page.title} body={page.body}>
        <div className="marketplace-overview">
          <article className="route-placeholder-card">
            <h3>Catalog Snapshot</h3>
            <ul>
              <li>{beatGenres.length} active genre lanes</li>
              <li>{beatMoods.length} mood filters for browse refinement</li>
              <li>
                {beatBpmRange[0]}-{beatBpmRange[1]} BPM spread with pricing from ${beatPriceRange[0]}-
                ${beatPriceRange[1]}
              </li>
            </ul>
          </article>
          <article className="route-placeholder-card">
            <h3>Player System</h3>
            <p>One track at a time, persistent mini-player, shared controls across listing and homepage.</p>
          </article>
        </div>
        <BeatsMarketplace />
      </Section>
    </div>
  );
}
