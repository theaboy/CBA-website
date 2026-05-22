import Image from "next/image";
import Link from "next/link";
import styles from "./studio-section-mockup.module.css";

const services = [
  {
    image: "/cba/cba-photo-2.jpg",
    title: "Sessions\nd'Enregistrement",
    description:
      "Cabine vocale, salle live et régie calibrée pour capturer un rendu net, riche et exploitable dès la première prise.",
    price: "À partir de 120 $/h",
  },
  {
    image: "/cba/cba-photo-3.jpg",
    title: "Mixage &\nMastering",
    description:
      "Direction sonore complète pour donner de la densité, du contraste et une traduction solide sur toutes les plateformes.",
    price: "À partir de 250 $/titre",
  },
  {
    image: "/cba/cba-hero-1.jpg",
    title: "Production\nSur Mesure",
    description:
      "Sessions avec les producteurs CBA pour bâtir une direction unique, du beat à la structure finale.",
    price: "À partir de 500 $/jour",
  },
];

const CARD_VARIANT = ["cardLeft", "cardCenter", "cardRight"] as const;

export function StudioSectionMockup() {
  return (
    <section id="studio" className={styles.section} aria-labelledby="studio-home-heading">

      {/* ── Header ───────────────────────────────────────────────── */}
      <header className={styles.header}>
        <p className={styles.eyebrow}>Le Studio</p>

        <h2 id="studio-home-heading" className={styles.title}>
          Session Studio
        </h2>

        <div className={styles.ornament} aria-hidden>
          <span className={styles.ornLine} />
          <span className={styles.ornDiamond} />
          <span className={styles.ornLine} />
        </div>

        <p className={styles.lead}>
          Un environnement pensé pour produire vite,<br />
          proprement, et avec une vraie signature sonore.
        </p>
      </header>

      {/* ── Arc of cards ─────────────────────────────────────────── */}
      <div className={styles.stage}>
        <div className={styles.arc}>
          {services.map((s, i) => (
            <article
              key={s.title}
              className={`${styles.card} ${styles[CARD_VARIANT[i]]}`}
            >
              <Image
                src={s.image}
                alt={s.title.replace("\n", " ")}
                fill
                sizes="(max-width: 720px) 92vw, 30vw"
                className={styles.cardImg}
              />

              <div className={styles.cardOverlay} />

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>
                  {s.title.split("\n").map((line, j) => (
                    <span key={j}>{line}{j === 0 && <br />}</span>
                  ))}
                </h3>
                <div className={styles.cardDivider} />
                <p className={styles.cardDesc}>{s.description}</p>
                <p className={styles.cardPrice}>{s.price}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <div className={styles.nav}>
        <Link href="/reservation" className={styles.navBtn}>Réserver</Link>
      </div>

    </section>
  );
}
