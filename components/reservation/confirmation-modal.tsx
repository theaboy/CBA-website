import { useEffect } from "react";
import styles from "./reservation.module.css";

type Props = {
  open: boolean;
  reservationRef: string | null;
  onClose: () => void;
};

export function ConfirmationModal({ open, reservationRef, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`${styles.modalOverlay} ${open ? styles.open : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-hidden={!open}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.modalCard}>
        <div className={styles.modalCheck} aria-hidden>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className={styles.modalTitle} id="modal-title">Demande envoyée.</h3>
        <p className={styles.modalCopy}>
          Merci. L'équipe CBA confirme ta réservation par courriel sous 24 heures.
          Garde ta référence à portée de main.
        </p>
        {reservationRef && (
          <div className={styles.modalRef}>{reservationRef}</div>
        )}
        <div className={styles.modalCloseRow}>
          <button type="button" className={styles.ctaSecondary} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
