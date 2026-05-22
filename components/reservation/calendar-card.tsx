import { useMemo } from "react";
import { dayStatus, MONTHS_FR } from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  viewYear: number;
  viewMonth: number;
  selectedDate: Date | null;
  onNavMonth: (delta: -1 | 1) => void;
  onSelectDate: (date: Date) => void;
};

const WEEKDAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function CalendarCard({ viewYear, viewMonth, selectedDate, onNavMonth, onSelectDate }: Props) {
  const today = useMemo(() => new Date(), []);

  const cells = useMemo(() => {
    // Build a 6-row grid (42 cells). Monday is column 0.
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const jsDow = firstOfMonth.getDay();     // 0 = Sun
    const mondayDow = (jsDow + 6) % 7;       // shift so Mon = 0
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const out: Array<{ kind: "empty" } | { kind: "day"; date: Date }> = [];
    for (let i = 0; i < mondayDow; i++) out.push({ kind: "empty" });
    for (let d = 1; d <= daysInMonth; d++) out.push({ kind: "day", date: new Date(viewYear, viewMonth, d) });
    while (out.length < 42) out.push({ kind: "empty" });
    return out;
  }, [viewYear, viewMonth]);

  const selectedKey = selectedDate
    ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
    : null;
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  return (
    <section className={styles.card} aria-labelledby="calendar-heading">
      <div className={styles.cardHead}>
        <span className={styles.cardEyebrow} id="calendar-heading">02 · Date</span>
        <span className={styles.cardStep}>Disponibilité</span>
      </div>

      <div className={styles.calHeader}>
        <div className={styles.calMonth}>
          {MONTHS_FR[viewMonth]}<em>{viewYear}</em>
        </div>
        <div className={styles.calNav}>
          <button type="button" aria-label="Mois précédent" onClick={() => onNavMonth(-1)}>‹</button>
          <button type="button" aria-label="Mois suivant"   onClick={() => onNavMonth(1)}>›</button>
        </div>
      </div>

      <div className={styles.calWeekRow} aria-hidden>
        {WEEKDAYS_FR.map((w) => <span key={w}>{w}</span>)}
      </div>

      <div className={styles.calGrid}>
        {cells.map((cell, i) => {
          if (cell.kind === "empty") {
            return <div key={i} className={`${styles.calCell} ${styles.empty}`} aria-hidden />;
          }
          const status = dayStatus(cell.date, today);
          const key = `${cell.date.getFullYear()}-${cell.date.getMonth()}-${cell.date.getDate()}`;
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;
          const interactive = status === "avail";
          const classes = [
            styles.calCell,
            styles[status],
            isToday ? styles.today : "",
            isSelected ? styles.selected : "",
          ].filter(Boolean).join(" ");
          const meta = status === "full" ? "complet" : status === "avail" ? "dispo" : "";

          return (
            <button
              key={i}
              type="button"
              className={classes}
              disabled={!interactive}
              aria-disabled={!interactive}
              aria-pressed={isSelected}
              aria-label={`${cell.date.getDate()} ${MONTHS_FR[cell.date.getMonth()]} — ${meta || "indisponible"}`}
              onClick={() => interactive && onSelectDate(cell.date)}
            >
              <span className={styles.calDay}>{cell.date.getDate()}</span>
              {meta && <span className={styles.calMeta}>{meta}</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.calLegend} aria-hidden>
        <span><i style={{ background: "oklch(45% 0.08 110)" }} /> Disponible</span>
        <span><i style={{ background: "var(--gold-glow)" }} /> Sélection</span>
        <span><i style={{ background: "oklch(55% 0.08 30)" }} /> Complet</span>
      </div>
    </section>
  );
}
