import { AdminOverviewCard } from "@/components/admin/admin-overview-card";

const modules = [
  {
    title: "Homepage Content",
    blurb: "Hero copy, feature rails, and promotional modules will be editable here in later phases.",
    status: "Shell ready"
  },
  {
    title: "Beat Catalog",
    blurb: "Metadata, licensing tiers, and upload-ready fields are accounted for before real audio arrives.",
    status: "Mapped"
  },
  {
    title: "Studio Availability",
    blurb: "Scheduling states and booking review surfaces will plug into this dashboard area.",
    status: "Reserved"
  },
  {
    title: "Events",
    blurb: "Placeholder event entries and future date management are planned into the IA from day one.",
    status: "Reserved"
  },
  {
    title: "DJ Inquiries",
    blurb: "Lead review and request triage will surface here once inquiry flows are implemented.",
    status: "Reserved"
  },
  {
    title: "Operations Snapshot",
    blurb: "This dashboard frame is designed to hold analytics, incoming requests, and publishing state.",
    status: "Foundation"
  }
];

export default function AdminDashboardPage() {
  return (
    <>
      <header className="admin-stage-header">
        <div>
          <p className="eyebrow">Dashboard Foundation</p>
          <h1 style={{ fontSize: "3.5rem", maxWidth: "14ch" }}>CBA internal operations shell.</h1>
        </div>
        <span className="ghost-chip">Preview access only</span>
      </header>

      <div className="admin-card-grid">
        {modules.map((module) => (
          <AdminOverviewCard key={module.title} {...module} />
        ))}
      </div>
    </>
  );
}
