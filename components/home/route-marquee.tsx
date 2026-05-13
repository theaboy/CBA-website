const genres = [
  "Trap",
  "Afrobeats",
  "R&B",
  "Drill",
  "Soul",
  "Hip-Hop",
  "Montréal",
  "Cinematic",
  "Nocturnal",
  "Luxe",
];

export function RouteMarquee() {
  const doubled = [...genres, ...genres];

  return (
    <div className="genre-marquee" aria-label="Musical genres at CBA">
      <div className="genre-marquee-track">
        {doubled.map((genre, index) => (
          <span key={`${genre}-${index}`} className="genre-marquee-item">
            <span>{genre}</span>
            <span className="genre-marquee-dot" aria-hidden="true">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
