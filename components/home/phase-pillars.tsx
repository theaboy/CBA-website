const pillars = [
  {
    title: "Brand system",
    copy: "Typography, surfaces, contrast, and motion cues are centralized so every future page inherits the same voice."
  },
  {
    title: "Public shell",
    copy: "Primary routes exist now with coherent spacing, navigation, and page structures instead of blank placeholders."
  },
  {
    title: "Admin boundary",
    copy: "Internal tooling gets its own layout and access path early, preventing a later bolt-on dashboard."
  }
];

export function PhasePillars() {
  return (
    <div className="pillar-grid">
      {pillars.map((pillar) => (
        <article key={pillar.title} className="pillar-card">
          <p className="eyebrow">Foundation</p>
          <h3>{pillar.title}</h3>
          <p>{pillar.copy}</p>
        </article>
      ))}
    </div>
  );
}
