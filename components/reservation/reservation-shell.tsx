"use client";

import { useReducer } from "react";
import { initialState, reducer } from "@/lib/reservation";
import styles from "./reservation.module.css";

export function ReservationShell() {
  const [state, _dispatch] = useReducer(reducer, initialState);

  return (
    <div className={styles.page} data-service={state.service}>
      <div className={styles.inner}>
        {/* Hero, ServiceSwitch, booking grid, modal — added in subsequent tasks */}
        <p style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--gold-glow)" }}>
          /reservation — shell scaffold
        </p>
      </div>
    </div>
  );
}
