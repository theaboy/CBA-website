"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Beat, BeatLicenseCode } from "@/lib/beats";
import { submitBeatInquiry } from "@/app/(marketing)/beats/[slug]/actions";
import { initialBeatInquiryState } from "@/lib/inquiries/beat-inquiry";

type BeatInquiryFormProps = {
  beat: Beat;
  selectedLicense: BeatLicenseCode;
  licenseLabel: string;
};

export function BeatInquiryForm({ beat, selectedLicense, licenseLabel }: BeatInquiryFormProps) {
  const [state, formAction] = useActionState(submitBeatInquiry, initialBeatInquiryState);

  if (state.status === "success" && state.summary) {
    return (
      <div className="beat-inquiry-success">
        <p className="eyebrow">Inquiry Sent</p>
        <h3>{state.summary.beatTitle}</h3>
        <p>{state.message}</p>
        <div className="beat-detail-chip-row">
          <span>{state.summary.licenseLabel}</span>
          <span>{state.summary.email}</span>
          <span>Manual follow-up</span>
        </div>
      </div>
    );
  }

  return (
    <form className="beat-inquiry-form" action={formAction}>
      <div className="beat-inquiry-context">
        <div>
          <span>Beat</span>
          <strong>{beat.title}</strong>
        </div>
        <div>
          <span>License</span>
          <strong>{licenseLabel}</strong>
        </div>
      </div>

      <input type="hidden" name="beatSlug" value={beat.slug} />
      <input type="hidden" name="licenseCode" value={selectedLicense} />

      <div className="beat-inquiry-grid">
        <label>
          <span>Name</span>
          <input name="name" type="text" placeholder="Artist or manager name" required />
          {state.fieldErrors?.name ? <small>{state.fieldErrors.name}</small> : null}
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" placeholder="you@example.com" required />
          {state.fieldErrors?.email ? <small>{state.fieldErrors.email}</small> : null}
        </label>
        <label>
          <span>Artist Name</span>
          <input name="artistName" type="text" placeholder="Stage name or group" required />
          {state.fieldErrors?.artistName ? <small>{state.fieldErrors.artistName}</small> : null}
        </label>
        <label>
          <span>Usage</span>
          <input name="intendedUse" type="text" placeholder="Single release, demo, campaign..." required />
          {state.fieldErrors?.intendedUse ? <small>{state.fieldErrors.intendedUse}</small> : null}
        </label>
      </div>

      <label className="beat-inquiry-notes">
        <span>Notes</span>
        <textarea
          name="notes"
          rows={5}
          placeholder="Share the track direction, timeline, or any licensing context CBA should know."
          required
        />
        {state.fieldErrors?.notes ? <small>{state.fieldErrors.notes}</small> : null}
      </label>

      {state.status === "error" && state.message ? <p className="form-error">{state.message}</p> : null}

      <div className="beat-inquiry-foot">
        <p>
          This is an inquiry-first flow. CBA will review the selected beat and license tier, then follow up
          directly with next steps.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="solid-chip" disabled={pending}>
      {pending ? "Sending..." : "Send Inquiry"}
    </button>
  );
}
