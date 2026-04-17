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
            <h3>Aperçu du Catalogue</h3>
            <ul>
              <li>{beatGenres.length} catégories de genres actives</li>
              <li>{beatMoods.length} filtres d'ambiance pour affiner la recherche</li>
              <li>
                {beatBpmRange[0]}-{beatBpmRange[1]} BPM spread with pricing from ${beatPriceRange[0]}-
                ${beatPriceRange[1]}
              </li>
            </ul>
          </article>
          <article className="route-placeholder-card">
            <h3>Système de Lecture</h3>
            <p>Une piste à la fois, mini-lecteur persistant, contrôles partagés entre le catalogue et la page d'accueil.</p>
          </article>
        </div>
        <BeatsMarketplace />
      </Section>
    </div>
  );
}
