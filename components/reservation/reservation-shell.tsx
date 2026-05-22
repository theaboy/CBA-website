"use client";

import { useReducer, useState } from "react";
import { initialState, reducer } from "@/lib/reservation";
import { ReservationHero } from "./reservation-hero";
import { ServiceSwitch } from "./service-switch";
import { FormulaGrid } from "./formula-grid";
import { CalendarCard } from "./calendar-card";
import { SlotPicker } from "./slot-picker";
import { SummaryCard } from "./summary-card";
import styles from "./reservation.module.css";

export function ReservationShell() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [pending, _setPending] = useState(false);  // wired in next task

  // Stubs — submit handler implemented in Task 10.
  function handleSubmit() { /* Task 10 */ }
  function handleReset()  { dispatch({ type: "RESET_ALL" }); }

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
    </div>
  );
}
