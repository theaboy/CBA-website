import { BeatLicenseCode } from "@/lib/beats";

type BeatInquiryField = "name" | "email" | "artistName" | "intendedUse" | "notes" | "beatSlug" | "licenseCode";

export type BeatInquiryPayload = {
  beatSlug: string;
  beatTitle: string;
  licenseCode: BeatLicenseCode;
  licenseLabel: string;
  name: string;
  email: string;
  artistName: string;
  intendedUse: string;
  notes: string;
  submittedAt: string;
};

export type BeatInquiryActionState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<BeatInquiryField, string>>;
  summary?: {
    beatTitle: string;
    licenseLabel: string;
    email: string;
  };
};

export const initialBeatInquiryState: BeatInquiryActionState = {
  status: "idle",
  message: ""
};

function readRequiredField(formData: FormData, field: BeatInquiryField) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export function validateBeatInquiryFields(formData: FormData) {
  const draft = {
    beatSlug: readRequiredField(formData, "beatSlug"),
    licenseCode: readRequiredField(formData, "licenseCode"),
    name: readRequiredField(formData, "name"),
    email: readRequiredField(formData, "email"),
    artistName: readRequiredField(formData, "artistName"),
    intendedUse: readRequiredField(formData, "intendedUse"),
    notes: readRequiredField(formData, "notes")
  };

  const fieldErrors: Partial<Record<BeatInquiryField, string>> = {};

  if (!draft.beatSlug) fieldErrors.beatSlug = "Beat selection is missing.";
  if (!draft.licenseCode) fieldErrors.licenseCode = "License selection is missing.";
  if (!draft.name) fieldErrors.name = "Name is required.";
  if (!draft.email) {
    fieldErrors.email = "Email is required.";
  } else if (!draft.email.includes("@")) {
    fieldErrors.email = "Enter a valid email.";
  }
  if (!draft.artistName) fieldErrors.artistName = "Artist name is required.";
  if (!draft.intendedUse) fieldErrors.intendedUse = "Tell CBA how you want to use the beat.";
  if (!draft.notes) fieldErrors.notes = "Add a few notes so follow-up has context.";

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false as const,
      fieldErrors
    };
  }

  return {
    ok: true as const,
    draft
  };
}

export async function dispatchBeatInquiry(payload: BeatInquiryPayload) {
  console.info("[beat-inquiry]", JSON.stringify(payload, null, 2));

  return {
    channel: "manual-review",
    acceptedAt: payload.submittedAt
  };
}
