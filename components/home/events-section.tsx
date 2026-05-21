import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import styles from "./events-section.module.css";

const events = [
  {
    image: "/cba/cba-hero-1.jpg",
    day: "24",
    month: "Avril",
    year: "2026",
    name: "Session d'écoute CBA",
    venue: "Le Ministère, Montréal",
  },
  {
    image: "/cba/cba-photo-3.jpg",
    day: "08",
    month: "Mai",
    year: "2026",
    name: "Underground Frequency Vol. 4",
    venue: "Bar Le Ritz PDB, Montréal",
  },
  {
    image: "/cba/cba-photo-2.jpg",
    day: "22",
    month: "Mai",
    year: "2026",
    name: "Portes Ouvertes Studio",
    venue: "CBA Studio, Plateau-Mont-Royal",
  },
];

export function EventsSection() {
  return (
    <section id="events" className={styles.section} aria-labelledby="events-home-heading">
      <div className={styles.inner}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Agenda CBA</p>
            <h2 id="events-home-heading" className={styles.title}>
              Nos Dates
            </h2>
          </div>
          <Link href="/events" className={styles.headerLink}>
            Tous les événements <ArrowRight size={13} />
          </Link>
        </header>

        {/* ── Cards ──────────────────────────────────────────────── */}
        <div className={styles.grid}>
          {events.map((event) => (
            <article key={event.name} className={styles.card}>

              {/* Photo */}
              <div className={styles.cardPhoto}>
                <Image
                  src={event.image}
                  alt={event.name}
                  fill
                  sizes="(max-width: 900px) 92vw, 33vw"
                  className={styles.cardImg}
                />
                <div className={styles.photoOverlay} />
              </div>

              {/* Info strip */}
              <div className={styles.cardInfo}>
                <div className={styles.dateBox}>
                  <span className={styles.day}>{event.day}</span>
                  <span className={styles.month}>{event.month}</span>
                  <span className={styles.year}>{event.year}</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.eventName}>{event.name}</h3>
                  <p className={styles.venue}>{event.venue}</p>
                </div>
              </div>

            </article>
          ))}
        </div>

        {/* ── Nav arrows ─────────────────────────────────────────── */}
        <div className={styles.nav}>
          <button className={styles.navBtn} aria-label="Précédent">←</button>
          <button className={styles.navBtn} aria-label="Suivant">→</button>
        </div>

      </div>
    </section>
  );
}
