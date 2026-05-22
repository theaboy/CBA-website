import type { Formula } from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  formula: Formula;
  active: boolean;
  onClick: () => void;
};

export function FormulaCard({ formula, active, onClick }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      className={`${styles.formulaCard} ${active ? styles.active : ""}`}
      onClick={onClick}
    >
      <span className={styles.fTag}>
        <span className={styles.fMark} aria-hidden />
        {formula.tag}
      </span>
      <h3 className={styles.fName}>{formula.name}</h3>
      <p className={styles.fDesc}>{formula.description}</p>
      <div className={styles.fPrice}>
        <span className={styles.fPriceAmount}>${formula.price}</span>
        <span className={styles.fPriceUnit}>{formula.unit}</span>
      </div>
    </button>
  );
}
