import { getFormula } from "./catalog";
import type { ReservationState } from "./state";

export const TAX_RATE = 0.14975;

export type Pricing = { base: number; tax: number; grand: number };

export function computePricing(state: ReservationState): Pricing | null {
  const formula = getFormula(state.service, state.formulaId);
  if (!formula) return null;

  const dur = formula.durations[state.durationIdx];
  if (!dur) return null;

  let base = 0;
  if (formula.unit.includes("/ h"))         base = formula.price * dur.h;
  else if (formula.unit.includes("/ titre"))    base = formula.price * (state.durationIdx === 1 ? 4 : 1);
  else if (formula.unit.includes("/ jour"))     base = formula.price * (state.durationIdx === 0 ? 1 : state.durationIdx === 1 ? 2 : 5);
  else if (formula.unit.includes("/ set"))      base = formula.price + (dur.h - 2) * 200;
  else if (formula.unit.includes("/ soirée"))   base = formula.price + Math.max(0, dur.h - 4) * 150;
  else if (formula.unit.includes("/ showcase")) base = formula.price * dur.h;

  const tax = base * TAX_RATE;
  return { base, tax, grand: base + tax };
}

export function formatCAD(n: number): string {
  if (!n) return "—";
  return n.toLocaleString("fr-CA", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " $";
}

export const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

export function formatDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
}
