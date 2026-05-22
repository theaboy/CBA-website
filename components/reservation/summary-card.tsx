import {
  SERVICES,
  computePricing,
  formatCAD,
  formatDate,
  getFormula,
  type ReservationState,
  type ReservationContact,
} from "@/lib/reservation";
import styles from "./reservation.module.css";

type Props = {
  state: ReservationState;
  pending: boolean;
  onUpdateContact: (field: keyof ReservationContact, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
};

export function SummaryCard({ state, pending, onUpdateContact, onSubmit, onReset }: Props) {
  const formula = getFormula(state.service, state.formulaId);
  const duration = formula?.durations[state.durationIdx] ?? null;
  const pricing = computePricing(state);
  const service = SERVICES[state.service];
  const ready = !!state.formulaId && !!state.selectedDate && !!state.selectedSlot;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || pending) return;
    onSubmit();
  }

  return (
    <aside className={`${styles.card} ${styles.summary}`} aria-labelledby="summary-heading">
      <p className={styles.summaryEyebrow} id="summary-heading">Récapitulatif</p>
      <h2 className={styles.summaryTitle}>{service.label}</h2>
      <p className={styles.summarySub}>{formula ? formula.name : "Formule à choisir"}</p>

      <div className={styles.summaryRows}>
        <div className={styles.summaryRow}>
          <span>Date</span>
          {state.selectedDate
            ? <strong>{formatDate(state.selectedDate)}</strong>
            : <span className={styles.empty}>À sélectionner</span>}
        </div>
        <div className={styles.summaryRow}>
          <span>Heure</span>
          {state.selectedSlot
            ? <strong>{state.selectedSlot}</strong>
            : <span className={styles.empty}>À sélectionner</span>}
        </div>
        <div className={styles.summaryRow}>
          <span>Durée</span>
          {duration
            ? <strong>{duration.label}</strong>
            : <span className={styles.empty}>À sélectionner</span>}
        </div>
        <div className={styles.summaryRow}>
          <span>Lieu</span>
          <strong>{service.location}</strong>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
          <div className={styles.formField}>
            <label htmlFor="firstName">Prénom</label>
            <input id="firstName" type="text" required value={state.contact.firstName}
              onChange={(e) => onUpdateContact("firstName", e.target.value)} />
          </div>
          <div className={styles.formField}>
            <label htmlFor="lastName">Nom</label>
            <input id="lastName" type="text" required value={state.contact.lastName}
              onChange={(e) => onUpdateContact("lastName", e.target.value)} />
          </div>
          <div className={`${styles.formField} ${styles.formGridFull}`}>
            <label htmlFor="phone">Téléphone</label>
            <input id="phone" type="tel" required value={state.contact.phone}
              onChange={(e) => onUpdateContact("phone", e.target.value)} />
          </div>
          <div className={`${styles.formField} ${styles.formGridFull}`}>
            <label htmlFor="email">Courriel</label>
            <input id="email" type="email" required value={state.contact.email}
              onChange={(e) => onUpdateContact("email", e.target.value)} />
          </div>
          <div className={`${styles.formField} ${styles.formGridFull}`}>
            <label htmlFor="notes">Notes pour l'équipe</label>
            <textarea id="notes" rows={4} placeholder="Références, contexte, objectifs…"
              value={state.contact.notes}
              onChange={(e) => onUpdateContact("notes", e.target.value)} />
          </div>
        </div>

        <div className={styles.totalsBox}>
          <div className={styles.totalsRow}>
            <span>{formula ? formula.name : "Base"}</span>
            <span>{formatCAD(pricing?.base ?? 0)}</span>
          </div>
          <div className={styles.totalsRow}>
            <span>Taxes (estim.)</span>
            <span>{formatCAD(pricing?.tax ?? 0)}</span>
          </div>
          <div className={styles.totalsGrand}>
            <span>Total</span>
            <span>
              <span className={styles.totalsAmount}>{formatCAD(pricing?.grand ?? 0)}</span>
              <span className={styles.totalsCcy}>CAD</span>
            </span>
          </div>
        </div>

        <button type="submit" className={styles.ctaPrimary} disabled={!ready || pending}>
          {pending ? "Envoi…" : "Confirmer la réservation"}
        </button>
        <button type="button" className={styles.ctaSecondary} onClick={onReset}>
          Réinitialiser
        </button>

        <p className={styles.fineprint}>
          Aucun paiement n'est prélevé maintenant. Un membre de l'équipe CBA confirme par
          courriel sous 24 h.
        </p>
      </form>
    </aside>
  );
}
