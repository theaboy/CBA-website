import { useMemo } from "react";
import {
  slotsFor,
  slotPeriod,
  formatDate,
  getFormula,
  type ServiceId,
  type FormulaId,
} from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  service: ServiceId;
  formulaId: FormulaId | null;
  durationIdx: number;
  selectedDate: Date | null;
  selectedSlot: string | null;
  onSelectSlot: (time: string) => void;
  onSelectDuration: (idx: number) => void;
};

export function SlotPicker({
  service, formulaId, durationIdx, selectedDate, selectedSlot,
  onSelectSlot, onSelectDuration,
}: Props) {
  const slots = useMemo(() => (selectedDate ? slotsFor(selectedDate) : []), [selectedDate]);
  const formula = getFormula(service, formulaId);

  if (!selectedDate) {
    return (
      <section className={styles.card} aria-labelledby="slot-heading">
        <div className={styles.cardHead}>
          <span className={styles.cardEyebrow} id="slot-heading">03 · Horaire</span>
          <span className={styles.cardStep}>Créneau</span>
        </div>
        <div className={styles.slotEmpty}>
          Choisis d'abord une date pour voir les créneaux disponibles.
        </div>
      </section>
    );
  }

  const freeCount = slots.filter((s) => !s.taken).length;

  return (
    <section className={styles.card} aria-labelledby="slot-heading">
      <div className={styles.cardHead}>
        <span className={styles.cardEyebrow} id="slot-heading">03 · Horaire</span>
        <span className={styles.cardStep}>Créneau</span>
      </div>

      <div className={styles.slotMeta}>
        <strong>{formatDate(selectedDate)}</strong>
        <span>· {freeCount} créneaux libres</span>
      </div>

      <div className={styles.slotGrid}>
        {slots.map((s) => {
          const active = s.time === selectedSlot;
          const classes = [
            styles.slot,
            s.taken ? styles.taken : "",
            active ? styles.selected : "",
          ].filter(Boolean).join(" ");

          return (
            <button
              key={s.time}
              type="button"
              className={classes}
              disabled={s.taken}
              aria-disabled={s.taken}
              aria-pressed={active}
              aria-label={`${s.time} — ${slotPeriod(s.time)}`}
              onClick={() => !s.taken && onSelectSlot(s.time)}
            >
              <span className={styles.slotTime}>{s.time}</span>
              <span className={styles.slotPeriod}>{slotPeriod(s.time)}</span>
            </button>
          );
        })}
      </div>

      {formula && (
        <div className={styles.durationRow}>
          <span className={styles.durationLabel}>Durée</span>
          <div className={styles.durationPills}>
            {formula.durations.map((d, i) => {
              const active = i === durationIdx;
              return (
                <button
                  key={d.label}
                  type="button"
                  className={`${styles.durationPill} ${active ? styles.active : ""}`}
                  aria-pressed={active}
                  onClick={() => onSelectDuration(i)}
                >
                  {d.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
