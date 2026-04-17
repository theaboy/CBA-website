import Image from "next/image";
import styles from "./about-section.module.css";

const stats = [
  { value: "100%", label: "Indépendant" },
  { value: "Est. 2020", label: "Fondé à Montréal" },
  { value: "50+", label: "Artistes accompagnés" },
  { value: "200+", label: "Disques produits" },
];

export function AboutSection() {
  return (
    <section className={`${styles.section} motion-safe:animate-fade-up`} aria-labelledby="about-home-heading">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={`${styles.eyebrow} motion-safe:animate-fade-up`}>Le Collectif</p>
          <h2
            id="about-home-heading"
            className={`${styles.title} motion-safe:animate-fade-up`}
            style={{ animationDelay: "90ms" }}
          >
            Fait par des artistes, pour des artistes.
          </h2>
          <p
            className={`${styles.body} motion-safe:animate-fade-up`}
            style={{ animationDelay: "170ms" }}
          >
            CBA est un collectif musical montréalais à l’intersection de la création, de
            la scène et de la direction sonore. Nous produisons des beats, encadrons des
            sessions studio, et construisons des sorties qui gardent leur identité.
          </p>
          <p
            className={`${styles.body} motion-safe:animate-fade-up`}
            style={{ animationDelay: "250ms" }}
          >
            Pas de filtre corporatif, pas de formule copiée-collée. Seulement un travail
            pensé avec intention, précision et caractère.
          </p>
          <blockquote
            className={`${styles.quote} motion-safe:animate-fade-up`}
            style={{ animationDelay: "330ms" }}
          >
            “Chaque projet doit sonner vrai avant de sonner grand.”
          </blockquote>
        </div>

        <div className={styles.visual}>
          <figure
            className={`${styles.imageFrame} motion-safe:animate-fade-left`}
            style={{ animationDelay: "210ms" }}
          >
            <Image
              src="/cba/cba-photo-3.jpg"
              alt="Équipe et ambiance studio CBA."
              fill
              sizes="(max-width: 980px) 94vw, 46vw"
              className={styles.image}
            />
          </figure>

          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <article
                key={stat.label}
                className={`${styles.statCard} motion-safe:animate-fade-up`}
                style={{ animationDelay: `${320 + index * 100}ms` }}
              >
                <span>{stat.value}</span>
                <p>{stat.label}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
