"use client";

import { useReducer, useState } from "react";
import {
  initialState,
  reducer,
  submitReservation,
  type ReservationPayload,
} from "@/lib/reservation";
import { ReservationHero } from "./reservation-hero";
import { ServiceSwitch } from "./service-switch";
import { FormulaGrid } from "./formula-grid";
import { CalendarCard } from "./calendar-card";
import { SlotPicker } from "./slot-picker";
import { SummaryCard } from "./summary-card";
import { ConfirmationModal } from "./confirmation-modal";
import styles from "./reservation.module.css";

function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function ReservationShell() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, setPending] = useState(false);
  const [reservationRef, setReservationRef] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSubmit() {
    if (!state.formulaId || !state.selectedDate || !state.selectedSlot) return;
    const payload: ReservationPayload = {
      service: state.service,
      formulaId: state.formulaId,
      durationIdx: state.durationIdx,
      date: isoDate(state.selectedDate),
      time: state.selectedSlot,
      contact: state.contact,
    };
    setPending(true);
    try {
      const { ref } = await submitReservation(payload);
      setReservationRef(ref);
      setModalOpen(true);
    } finally {
      setPending(false);
    }
  }

  function handleReset() { dispatch({ type: "RESET_ALL" }); }

  return (
    <div className={styles.page} data-service={state.service}>
      <div className={styles.inner}>
        <ReservationHero />
        <ServiceSwitch
          service={state.service}
          onChange={(id) => dispatch({ type: "SET_SERVICE", id })}
        />

        <div className={styles.bookingGrid}>
          <div className={styles.leftCol}>
            <FormulaGrid
              service={state.service}
              formulaId={state.formulaId}
              onSelect={(id) => dispatch({ type: "SET_FORMULA", id })}
            />
            <CalendarCard
              viewYear={state.viewYear}
              viewMonth={state.viewMonth}
              selectedDate={state.selectedDate}
              onNavMonth={(delta) => dispatch({ type: "NAV_MONTH", delta })}
              onSelectDate={(date) => dispatch({ type: "SET_DATE", date })}
            />
            <SlotPicker
              service={state.service}
              formulaId={state.formulaId}
              durationIdx={state.durationIdx}
              selectedDate={state.selectedDate}
              selectedSlot={state.selectedSlot}
              onSelectSlot={(time) => dispatch({ type: "SET_SLOT", time })}
              onSelectDuration={(idx) => dispatch({ type: "SET_DURATION", idx })}
            />
          </div>

          <SummaryCard
            state={state}
            pending={pending}
            onUpdateContact={(field, value) => dispatch({ type: "UPDATE_CONTACT", field, value })}
            onSubmit={handleSubmit}
            onReset={handleReset}
          />
        </div>
      </div>

      <ConfirmationModal
        open={modalOpen}
        reservationRef={reservationRef}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
