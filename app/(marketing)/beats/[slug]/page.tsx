import { notFound } from "next/navigation";
import { getBeatBySlug } from "@/lib/beats/queries";
import { BeatDetailHero } from "@/components/beats/beat-detail-hero";
import { BeatLicenseInquiry } from "@/components/beats/beat-license-inquiry";

export const dynamic = "force-dynamic";

export default async function BeatDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const beat = await getBeatBySlug(slug);

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
