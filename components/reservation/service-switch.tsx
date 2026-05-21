import type { ServiceId } from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  service: ServiceId;
  onChange: (id: ServiceId) => void;
};

const TABS: { id: ServiceId; label: string }[] = [
  { id: "studio", label: "Session Studio" },
  { id: "dj",     label: "Réservation DJ" },
];

export function ServiceSwitch({ service, onChange }: Props) {
  return (
    <div className={styles.switch} role="tablist" aria-label="Type de service">
      {TABS.map((t) => {
        const active = t.id === service;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${styles.switchTab} ${active ? styles.active : ""}`}
            onClick={() => onChange(t.id)}
          >
            <span className={styles.tabDot} aria-hidden />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
