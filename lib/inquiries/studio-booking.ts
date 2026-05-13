import { StudioPackageCode } from "@/lib/studio";

type StudioBookingField =
  | "packageCode"
  | "dayId"
  | "slotId"
  | "durationHours"
  | "name"
  | "email"
  | "artistName"
  | "notes";

export type StudioBookingPayload = {
  packageCode: StudioPackageCode;
  packageLabel: string;
  dayId: string;
  dayLabel: string;
  slotId: string;
  slotLabel: string;
  durationHours: number;
  name: string;
  email: string;
  artistName: string;
  notes: string;
  submittedAt: string;
};

export type StudioBookingActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<StudioBookingField, string>>;
  summary?: {
    packageLabel: string;
    dayLabel: string;
    slotLabel: string;
    email: string;
  };
};

export const initialStudioBookingState: StudioBookingActionState = {
  status: "idle",
  message: ""
};

function readRequiredField(formData: FormData, field: StudioBookingField) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function validateStudioBookingFields(formData: FormData) {
  const draft = {
    packageCode: readRequiredField(formData, "packageCode"),
    dayId: readRequiredField(formData, "dayId"),
    slotId: readRequiredField(formData, "slotId"),
    durationHours: readRequiredField(formData, "durationHours"),
    name: readRequiredField(formData, "name"),
    email: readRequiredField(formData, "email"),
    artistName: readRequiredField(formData, "artistName"),
    notes: readRequiredField(formData, "notes")
  };

  const fieldErrors: Partial<Record<StudioBookingField, string>> = {};

  if (!draft.packageCode) fieldErrors.packageCode = "Select a studio package.";
  if (!draft.dayId) fieldErrors.dayId = "Select a date.";
  if (!draft.slotId) fieldErrors.slotId = "Select a time slot.";
  if (!draft.durationHours) fieldErrors.durationHours = "Select a duration.";
  if (!draft.name) fieldErrors.name = "Name is required.";
  if (!draft.email) {
    fieldErrors.email = "Email is required.";
  } else if (!draft.email.includes("@")) {
    fieldErrors.email = "Enter a valid email.";
  }
  if (!draft.artistName) fieldErrors.artistName = "Artist name is required.";
  if (!draft.notes) fieldErrors.notes = "Add a few notes so the session can be confirmed properly.";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false as const, fieldErrors };
  }

  return {
    ok: true as const,
    draft: {
      ...draft,
      durationHours: Number(draft.durationHours)
    }
  };
}

export async function dispatchStudioBooking(payload: StudioBookingPayload) {
  console.info("[studio-booking]", JSON.stringify(payload, null, 2));

  return {
    channel: "manual-review",
    acceptedAt: payload.submittedAt
  };
}
