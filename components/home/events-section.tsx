import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import styles from "./events-section.module.css";
import { MagicCard } from "@/components/ui/magic-card";

const events = [
  {
    day: "24",
    month: "Avril",
    year: "2026",
    name: "Session d'Écoute CBA",
    venue: "Le Ministère, Montréal",
    type: "Événement Collectif",
    ticketLink: "/events",
  },
  {
    day: "08",
    month: "Mai",
    year: "2026",
    name: "Underground Frequency Vol. 4",
    venue: "Bar Le Ritz PDB, Montréal",
    type: "Soirée DJ",
    ticketLink: "/events",
  },
  {
    day: "22",
    month: "Mai",
    year: "2026",
    name: "Portes Ouvertes Studio",
    venue: "CBA Studio, Plateau-Mont-Royal",
    type: "Session Studio",
    ticketLink: "/events",
  },
];

export function EventsSection() {
  return (
    /* TODO: replace with real stream URL */
    <section id="listen" className={`${styles.section} motion-safe:animate-fade-up`} aria-labelledby="events-home-heading">
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <p className={`${styles.eyebrow} motion-safe:animate-fade-up`}>Agenda CBA</p>
            <h2
              id="events-home-heading"
              className={`${styles.title} motion-safe:animate-fade-up`}
              style={{ animationDelay: "90ms" }}
            >
              Prochains rendez-vous
            </h2>
          </div>
          <Link
            href="/events"
            className={`${styles.headerLink} motion-safe:animate-fade-left`}
            style={{ animationDelay: "180ms" }}
          >
            Tous les événements <ArrowRight size={15} />
          </Link>
        </header>

        <div className={styles.grid} role="list">
          {events.map((event, index) => (
            <MagicCard
              key={event.name}
              className={`${styles.cardWrap} motion-safe:animate-fade-up`}
              gradientSize={200}
              gradientFrom="rgba(212, 163, 115, 0.92)"
              gradientTo="rgba(62, 76, 63, 0.84)"
              overlayColor="rgba(212, 163, 115, 0.16)"
              overlayOpacity={0.75}
            >
              <article
                className={styles.card}
                style={{ animationDelay: `${220 + index * 100}ms` }}
                role="listitem"
              >
                <div className={styles.dateBlock}>
                  <span className={styles.day}>{event.day}</span>
                  <span className={styles.month}>
                    {event.month} {event.year}
                  </span>
                </div>

                <div className={styles.body}>
                  <span className={styles.type}>{event.type}</span>
                  <h3>{event.name}</h3>
                  <p>{event.venue}</p>
                </div>

                <Link href={event.ticketLink} className={styles.ticketAction}>
                  <CalendarDays size={13} /> Billets
                </Link>
              </article>
            </MagicCard>
          ))}
        </div>
      </div>
    </section>
  );
}
