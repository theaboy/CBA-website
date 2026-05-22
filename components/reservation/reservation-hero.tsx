import { SpinningRecord } from "@/components/experiences/spinning-record";
import styles from "./reservation.module.css";

export function ReservationHero() {
  return (
    <header className={styles.hero}>
      <div className={styles.heroText}>
        <p className={styles.eyebrow}>
          <span className={styles.pulseDot} aria-hidden />
          Réservation · CBA
        </p>
        <h1 className={styles.heroTitle}>Réserver une session</h1>
        <p className={styles.heroLede}>
          Studio ou DJ — une seule fenêtre pour bloquer la date, choisir la formule, et envoyer
          la demande. Confirmation manuelle par courriel sous 24 heures.
        </p>
      </div>
      <div className={styles.heroVisual}>
        <SpinningRecord />
      </div>
    </header>
  );
}
