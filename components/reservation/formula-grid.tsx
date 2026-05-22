import { SERVICES, type FormulaId, type ServiceId } from "@/lib/reservation";
import { FormulaCard } from "./formula-card";
import styles from "./reservation.module.css";

type Props = {
  service: ServiceId;
  formulaId: FormulaId | null;
  onSelect: (id: FormulaId) => void;
};

export function FormulaGrid({ service, formulaId, onSelect }: Props) {
  const formulas = SERVICES[service].formulas;
  return (
    <section className={styles.card} aria-labelledby="formula-heading">
      <div className={styles.cardHead}>
        <span className={styles.cardEyebrow} id="formula-heading">01 · Formule</span>
        <span className={styles.cardStep}>Service</span>
      </div>
      <div className={styles.formulaGrid} role="radiogroup" aria-labelledby="formula-heading">
        {formulas.map((f) => (
          <FormulaCard
            key={f.id}
            formula={f}
            active={f.id === formulaId}
            onClick={() => onSelect(f.id)}
          />
        ))}
      </div>
    </section>
  );
}
