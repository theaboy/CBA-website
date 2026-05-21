"use client";

import { useReducer } from "react";
import { initialState, reducer } from "@/lib/reservation";
import { ReservationHero } from "./reservation-hero";
import { ServiceSwitch } from "./service-switch";
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
        {/* Booking grid + modal come in subsequent tasks */}
      </div>
    </div>
  );
}
