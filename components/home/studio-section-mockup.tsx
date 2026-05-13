import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Disc, Mic, Music } from "lucide-react";
import styles from "./studio-section-mockup.module.css";

const services = [
  {
    icon: Mic,
    title: "Sessions d'Enregistrement",
    description:
      "Cabine vocale, salle live et régie calibrée pour capter un rendu net, riche et exploitable dès la première prise.",
    price: "À partir de 120 $/h",
  },
  {
    icon: Disc,
    title: "Mixage & Mastering",
    description:
      "Direction sonore complète pour donner de la densité, du contraste et une traduction solide sur toutes les plateformes.",
    price: "À partir de 250 $/titre",
  },
  {
    icon: Music,
    title: "Production Sur Mesure",
    description:
      "Sessions avec les producteurs CBA pour bâtir une direction unique, du beat à la structure finale.",
    price: "À partir de 500 $/jour",
  },
];

export function StudioSectionMockup() {
  return (
    <section className={`${styles.section} motion-safe:animate-fade-up`} aria-labelledby="studio-home-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={`${styles.eyebrow} motion-safe:animate-fade-up`}>Le Studio</p>
            <h2
              id="studio-home-heading"
              className={`${styles.title} motion-safe:animate-fade-up`}
              style={{ animationDelay: "90ms" }}
            >
              Espace de création haute intensité
            </h2>
            <p
              className={`${styles.lead} motion-safe:animate-fade-up`}
              style={{ animationDelay: "170ms" }}
            >
              Un environnement pensé pour produire vite, proprement, et avec une vraie
              signature sonore.
            </p>
          </div>
          <Link
            href="/studio"
            className={`${styles.headerLink} motion-safe:animate-fade-left`}
            style={{ animationDelay: "240ms" }}
          >
            Découvrir le studio <ArrowRight size={15} />
          </Link>
        </header>

        <div className={styles.layout}>
          <figure
            className={`${styles.imageFrame} motion-safe:animate-fade-right`}
            style={{ animationDelay: "200ms" }}
          >
            <Image
              src="/cba/cba-photo-3.jpg"
              alt="Vue du studio CBA."
              fill
              sizes="(max-width: 960px) 94vw, 44vw"
              className={styles.image}
            />
            <figcaption className={styles.caption}>
              Plateau-Mont-Royal · Montréal
            </figcaption>
          </figure>

          <div className={styles.cards}>
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <article
                  key={service.title}
                  className={`${styles.card} motion-safe:animate-fade-left`}
                  style={{ animationDelay: `${300 + index * 120}ms` }}
                >
                  <span className={styles.index}>{String(index + 1).padStart(2, "0")}</span>

                  <div className={styles.cardIcon}>
                    <Icon size={17} />
                  </div>

                  <div className={styles.cardBody}>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>

                  <p className={styles.cardPrice}>{service.price}</p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
