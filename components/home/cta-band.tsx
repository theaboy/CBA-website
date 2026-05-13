"use client";

import styles from "./cta-band.module.css";

export function CtaBand() {
  return (
    <section className={`${styles.section} motion-safe:animate-fade-up`} aria-labelledby="cta-heading">
      <div className={`${styles.panel} motion-safe:animate-fade-up`}>
        <p className={`${styles.eyebrow} motion-safe:animate-fade-up`}>Restez Connectés</p>
        <h2
          id="cta-heading"
          className={`${styles.title} motion-safe:animate-fade-up`}
          style={{ animationDelay: "90ms" }}
        >
          Prêt à créer quelque chose d'inoubliable ?
        </h2>
        <p
          className={`${styles.body} motion-safe:animate-fade-up`}
          style={{ animationDelay: "170ms" }}
        >
          Rejoignez la communauté CBA pour recevoir en priorité les nouveaux beats,
          les annonces d'événements et les ouvertures de sessions studio.
        </p>

        <form
          className={`${styles.form} motion-safe:animate-fade-up`}
          style={{ animationDelay: "240ms" }}
          onSubmit={(event) => event.preventDefault()}
          aria-label="Inscription infolettre CBA"
        >
          <label htmlFor="newsletter-email" className={styles.srOnly}>
            Adresse courriel
          </label>
          <input
            id="newsletter-email"
            type="email"
            className={styles.input}
            placeholder="Votre adresse courriel"
            required
          />
          <button type="submit" className={`${styles.submit} relative overflow-hidden`}>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 w-10 -skew-x-[18deg] bg-gradient-to-r from-transparent via-white/40 to-transparent motion-safe:animate-gold-sweep"
            />
            <span className="relative z-10">S'abonner</span>
          </button>
        </form>
      </div>
    </section>
  );
}
