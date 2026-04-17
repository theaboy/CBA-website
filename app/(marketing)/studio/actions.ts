"use server";

import { getStudioAvailabilityDayById, getStudioPackageByCode, getStudioSlot } from "@/lib/studio";
import {
  StudioBookingActionState,
  dispatchStudioBooking,
  validateStudioBookingFields
} from "@/lib/inquiries/studio-booking";

export async function submitStudioBooking(
  _previousState: StudioBookingActionState,
  formData: FormData
): Promise<StudioBookingActionState> {
  const validation = validateStudioBookingFields(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "Check the highlighted booking details and try again.",
      fieldErrors: validation.fieldErrors
    };
  }

  const packageOption = getStudioPackageByCode(validation.draft.packageCode);
  const day = getStudioAvailabilityDayById(validation.draft.dayId);
  const slot = getStudioSlot(validation.draft.dayId, validation.draft.slotId);

  if (!packageOption || !day || !slot || !slot.available) {
    return {
      status: "error",
      message: "That package or slot could not be confirmed. Choose another option and retry."
    };
  }

  const submittedAt = new Date().toISOString();

  await dispatchStudioBooking({
    packageCode: packageOption.code,
    packageLabel: packageOption.name,
    dayId: day.id,
    dayLabel: day.label,
    slotId: slot.id,
    slotLabel: slot.label,
    durationHours: validation.draft.durationHours,
    name: validation.draft.name,
    email: validation.draft.email,
    artistName: validation.draft.artistName,
    notes: validation.draft.notes,
    submittedAt
  });

  return {
    status: "success",
    message: "Session request received. CBA will confirm availability and follow up directly.",
    summary: {
      packageLabel: packageOption.name,
      dayLabel: day.label,
      slotLabel: slot.label,
      email: validation.draft.email
    }
  };
}
