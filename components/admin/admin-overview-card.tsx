type AdminOverviewCardProps = {
  title: string;
  blurb: string;
  status: string;
};

export function AdminOverviewCard({ title, blurb, status }: AdminOverviewCardProps) {
  return (
    <article className="admin-card">
      <div className="admin-card-topline">
        <span>{status}</span>
      </div>
      <h3>{title}</h3>
      <p>{blurb}</p>
    </article>
  );
}
