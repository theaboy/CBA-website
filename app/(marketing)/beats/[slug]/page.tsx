import { notFound } from "next/navigation";
import { getBeatBySlug } from "@/lib/beats/queries";
import { BeatPurchase } from "@/components/beats/beat-purchase";

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

  return <BeatPurchase beat={beat} />;
}
