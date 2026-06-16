import { DJS, type DjId } from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  djId: DjId | null;
  onSelect: (id: DjId) => void;
};

export function DjPicker({ djId, onSelect }: Props) {
  return (
    <section className={styles.card} aria-labelledby="dj-heading">
      <div className={styles.cardHead}>
        <span className={styles.cardEyebrow} id="dj-heading">DJ · Artiste</span>
        <span className={styles.cardStep}>Sélection</span>
      </div>
      <div className={styles.slotGrid} role="radiogroup" aria-labelledby="dj-heading">
        {DJS.map((dj) => {
          const active = dj.id === djId;
          return (
            <button
              key={dj.id}
              type="button"
              role="radio"
              aria-checked={active}
              className={`${styles.slot} ${active ? styles.selected : ""}`}
              onClick={() => onSelect(dj.id)}
            >
              <span className={styles.slotTime}>{dj.name}</span>
              <span className={styles.slotPeriod}>CBA</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
