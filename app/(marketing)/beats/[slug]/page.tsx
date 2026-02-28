import { notFound } from "next/navigation";
import { BeatDetailHero } from "@/components/beats/beat-detail-hero";
import { BeatLicenseInquiry } from "@/components/beats/beat-license-inquiry";
import { beatsCatalog, getBeatBySlug } from "@/lib/beats";

export function generateStaticParams() {
  return beatsCatalog.map((beat) => ({ slug: beat.slug }));
}

export default async function BeatDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const beat = getBeatBySlug(slug);

  if (!beat) {
    notFound();
  }

  return (
    <div className="page-shell">
      <BeatDetailHero beat={beat} />
      <BeatLicenseInquiry beat={beat} />
    </div>
  );
}
