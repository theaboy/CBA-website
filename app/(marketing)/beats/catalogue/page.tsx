import { getPublishedBeats } from "@/lib/beats/queries";
import { BeatsCatalogue } from "@/components/beats/beats-catalogue";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalogue complet · Beats",
  description:
    "Parcourez le catalogue complet d'instrumentaux CBA — filtres par genre, mood, prix et BPM.",
};

export default async function BeatsCataloguePage() {
  const beats = await getPublishedBeats();
  return <BeatsCatalogue beats={beats} />;
}
