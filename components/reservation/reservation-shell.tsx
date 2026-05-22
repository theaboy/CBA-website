"use client";

import { useReducer } from "react";
import { initialState, reducer } from "@/lib/reservation";
import { ReservationHero } from "./reservation-hero";
import { ServiceSwitch } from "./service-switch";
import { FormulaGrid } from "./formula-grid";
import { CalendarCard } from "./calendar-card";
import styles from "./reservation.module.css";

export function ReservationShell() {
  const [state, dispatch] = useReducer(reducer, initialState);

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
            {/* Slot picker next task */}
          </div>
          {/* Summary in later task */}
        </div>
      </div>
    </div>
  );
}
