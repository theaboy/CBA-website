"use server";

import { getBeatBySlug } from "@/lib/beats/queries";
import { getBeatLicenseOptions } from "@/lib/beats/catalog";
import {
  BeatInquiryActionState,
  dispatchBeatInquiry,
  validateBeatInquiryFields
} from "@/lib/inquiries/beat-inquiry";

export async function submitBeatInquiry(
  _previousState: BeatInquiryActionState,
  formData: FormData
): Promise<BeatInquiryActionState> {
  const validation = validateBeatInquiryFields(formData);

  if (!validation.ok) {
    return {
      status: "error",
      message: "Check the highlighted fields and try again.",
      fieldErrors: validation.fieldErrors
    };
  }

  const beat = await getBeatBySlug(validation.draft.beatSlug);

  if (!beat) {
    return {
      status: "error",
      message: "That beat could not be matched. Refresh the page and try again."
    };
  }

  const selectedLicense = getBeatLicenseOptions(beat).find(
    (license) => license.code === validation.draft.licenseCode
  );

  if (!selectedLicense) {
    return {
      status: "error",
      message: "That license tier could not be matched. Select a tier again and retry."
    };
  }

  const submittedAt = new Date().toISOString();

  await dispatchBeatInquiry({
    beatSlug: beat.slug,
    beatTitle: beat.title,
    licenseCode: selectedLicense.code,
    licenseLabel: selectedLicense.name,
    name: validation.draft.name,
    email: validation.draft.email,
    artistName: validation.draft.artistName,
    intendedUse: validation.draft.intendedUse,
    notes: validation.draft.notes,
    submittedAt
  });

  return {
    status: "success",
    message: "Inquiry received. CBA will follow up directly with the next licensing step.",
    summary: {
      beatTitle: beat.title,
      licenseLabel: selectedLicense.name,
      email: validation.draft.email
    }
  };
}
