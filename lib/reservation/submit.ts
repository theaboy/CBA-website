import type { ServiceId, FormulaId } from "./catalog";
import type { ReservationContact } from "./state";

export type ReservationPayload = {
  service: ServiceId;
  formulaId: FormulaId;
  durationIdx: number;
  date: string;     // "YYYY-MM-DD"
  time: string;     // "HH:MM"
  contact: ReservationContact;
};

export type ReservationResult = { ref: string };

/**
 * Frontend stub. Backend wiring (Supabase) will replace this body —
 * the public signature stays the same.
 */
export async function submitReservation(payload: ReservationPayload): Promise<ReservationResult> {
  await new Promise((r) => setTimeout(r, 600));  // simulate network
  const prefix = payload.service === "studio" ? "STD" : "DJ";
  const ref = `CBA · ${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  return { ref };
}
