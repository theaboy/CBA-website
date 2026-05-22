import type { ServiceId, FormulaId } from "./catalog";

export type ReservationContact = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  notes: string;
};

export type ReservationState = {
  service: ServiceId;
  formulaId: FormulaId | null;
  durationIdx: number;
  viewYear: number;
  viewMonth: number;        // 0-11
  selectedDate: Date | null;
  selectedSlot: string | null;
  contact: ReservationContact;
};

export type Action =
  | { type: "SET_SERVICE"; id: ServiceId }
  | { type: "SET_FORMULA"; id: FormulaId }
  | { type: "SET_DURATION"; idx: number }
  | { type: "NAV_MONTH"; delta: -1 | 1 }
  | { type: "SET_DATE"; date: Date }
  | { type: "SET_SLOT"; time: string }
  | { type: "UPDATE_CONTACT"; field: keyof ReservationContact; value: string }
  | { type: "RESET_ALL" };

const now = new Date();

export const initialState: ReservationState = {
  service: "studio",
  formulaId: null,
  durationIdx: 0,
  viewYear: now.getFullYear(),
  viewMonth: now.getMonth(),
  selectedDate: null,
  selectedSlot: null,
  contact: { firstName: "", lastName: "", phone: "", email: "", notes: "" },
};

export function reducer(state: ReservationState, action: Action): ReservationState {
  switch (action.type) {
    case "SET_SERVICE":
      if (state.service === action.id) return state;
      return { ...state, service: action.id, formulaId: null, durationIdx: 0 };
    case "SET_FORMULA":
      return { ...state, formulaId: action.id, durationIdx: 0 };
    case "SET_DURATION":
      return { ...state, durationIdx: action.idx };
    case "NAV_MONTH": {
      let month = state.viewMonth + action.delta;
      let year = state.viewYear;
      if (month < 0) { month = 11; year -= 1; }
      else if (month > 11) { month = 0; year += 1; }
      return { ...state, viewYear: year, viewMonth: month };
    }
    case "SET_DATE":
      return { ...state, selectedDate: action.date, selectedSlot: null };
    case "SET_SLOT":
      return { ...state, selectedSlot: action.time };
    case "UPDATE_CONTACT":
      return { ...state, contact: { ...state.contact, [action.field]: action.value } };
    case "RESET_ALL":
      return { ...initialState, viewYear: state.viewYear, viewMonth: state.viewMonth };
  }
}
