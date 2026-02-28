const routes = [
  "Home",
  "Beats",
  "Events",
  "Studio",
  "DJ Services",
  "About",
  "Contact",
  "Admin"
];

export function RouteMarquee() {
  return (
    <div className="route-marquee" aria-label="Planned route inventory">
      <div className="route-marquee-track">
        {[...routes, ...routes].map((route, index) => (
          <span key={`${route}-${index}`}>{route}</span>
        ))}
      </div>
    </div>
  );
}
