import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { type Beat } from "@/lib/beats";
import styles from "./beats-bento.module.css";

const CARD_VARIANTS = [
  styles.cardHero,
  styles.cardWide,
  styles.cardTall,
  styles.cardStandard,
  styles.cardStandard,
  styles.cardSlim,
];

const CARD_REVEAL_DELAYS = [
  styles.delay0,
  styles.delay1,
  styles.delay2,
  styles.delay3,
  styles.delay4,
  styles.delay5,
];

export function BeatsBento({ beats }: { beats: Beat[] }) {
  const displayBeats = beats.slice(0, 6);

  return (
    <section className={styles.section} aria-labelledby="beats-home-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Sélection CBA</p>
            <h2 id="beats-home-heading" className={styles.title}>
              Nos Beats
            </h2>
            <p className={styles.lead}>
              Beats exclusifs, palettes sonores distinctes, énergie montréalaise.
            </p>
          </div>

          <Link href="/beats" className={styles.headerLink}>
            Tout le catalogue <ArrowRight size={15} />
          </Link>
        </header>

        <div className={styles.grid} role="list">
          {displayBeats.map((beat, index) => (
            <article
              key={beat.id}
              className={`${styles.card} ${CARD_VARIANTS[index] ?? styles.cardStandard} ${
                CARD_REVEAL_DELAYS[index] ?? styles.delay0
              }`}
              role="listitem"
            >
              <Image
                src={beat.artwork_url}
                alt={`Artwork du beat ${beat.title}`}
                fill
                sizes="(max-width: 640px) 78vw, (max-width: 1100px) 46vw, 30vw"
                className={styles.cardImage}
              />
              <div className={styles.cardShade} aria-hidden />

              <div className={styles.cardTop}>
                <span>{beat.genre}</span>
                <span>{beat.bpm} BPM</span>
              </div>

              <div className={styles.cardBottom}>
                <h3>{beat.title}</h3>
                <p>{beat.tagline}</p>

                <div className={styles.cardActions}>
                  <span className={styles.price}>${beat.price_basic}</span>
                  <div className={styles.actionRow}>
                    <Link href={`/beats/${beat.slug}`} className={styles.listenAction}>
                      <Play size={13} /> Écouter
                    </Link>
                    <Link href={`/beats/${beat.slug}`} className={styles.detailsAction}>
                      Détails
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
