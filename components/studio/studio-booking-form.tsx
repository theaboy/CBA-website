"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitStudioBooking } from "@/app/(marketing)/studio/actions";
import { initialStudioBookingState } from "@/lib/inquiries/studio-booking";
import { StudioAvailabilityDay, StudioPackage, StudioSlot } from "@/lib/studio";

export function StudioBookingForm({
  packageOption,
  day,
  slot,
  durationOptions,
  durationHours,
  onDurationChange
}: {
  packageOption: StudioPackage;
  day: StudioAvailabilityDay;
  slot: StudioSlot;
  durationOptions: readonly number[];
  durationHours: number;
  onDurationChange: (durationHours: number) => void;
}) {
  const [state, formAction] = useActionState(submitStudioBooking, initialStudioBookingState);

  if (state.status === "success" && state.summary) {
    return (
      <div className="studio-success-card">
        <p className="eyebrow">Booking Request Sent</p>
        <h3>{state.summary.packageLabel}</h3>
        <p>{state.message}</p>
        <div className="beat-detail-chip-row">
          <span>{state.summary.dayLabel}</span>
          <span>{state.summary.slotLabel}</span>
          <span>{state.summary.email}</span>
        </div>
      </div>
    );
  }

  return (
    <form className="studio-form-card" action={formAction}>
      <div className="studio-form-context">
        <div>
          <span>Package</span>
          <strong>{packageOption.name}</strong>
        </div>
        <div>
          <span>Date</span>
          <strong>{day.label}</strong>
        </div>
        <div>
          <span>Time</span>
          <strong>{slot.label}</strong>
        </div>
      </div>

      <input type="hidden" name="packageCode" value={packageOption.code} />
      <input type="hidden" name="dayId" value={day.id} />
      <input type="hidden" name="slotId" value={slot.id} />

      <label className="studio-duration-field">
        <span>Duration</span>
        <select
          name="durationHours"
          value={durationHours}
          onChange={(event) => {
            onDurationChange(Number(event.target.value));
          }}
        >
          {durationOptions.map((entry) => (
            <option key={entry} value={entry}>
              {entry} hours
            </option>
          ))}
        </select>
        {state.fieldErrors?.durationHours ? <small>{state.fieldErrors.durationHours}</small> : null}
      </label>

      <div className="studio-form-grid">
        <label>
          <span>Name</span>
          <input name="name" type="text" placeholder="Manager or artist name" required />
          {state.fieldErrors?.name ? <small>{state.fieldErrors.name}</small> : null}
        </label>
        <label>
          <span>Email</span>
          <input name="email" type="email" placeholder="you@example.com" required />
          {state.fieldErrors?.email ? <small>{state.fieldErrors.email}</small> : null}
        </label>
        <label className="studio-form-grid-full">
          <span>Artist Name</span>
          <input name="artistName" type="text" placeholder="Stage name or project name" required />
          {state.fieldErrors?.artistName ? <small>{state.fieldErrors.artistName}</small> : null}
        </label>
      </div>

      <label className="studio-notes-field">
        <span>Session Notes</span>
        <textarea
          name="notes"
          rows={5}
          required
          placeholder="Share your session goal, release context, references, or anything CBA should know before confirming."
        />
        {state.fieldErrors?.notes ? <small>{state.fieldErrors.notes}</small> : null}
      </label>

      {state.status === "error" && state.message ? <p className="form-error">{state.message}</p> : null}

      <div className="studio-form-foot">
        <p>
          Requests are confirmed manually. CBA will review the selected slot, lock the right room pace, and
          follow up directly with confirmation details.
        </p>
        <StudioSubmitButton />
      </div>
    </form>
  );
}

function StudioSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="solid-chip" disabled={pending}>
      {pending ? "Sending..." : "Request Session"}
    </button>
  );
}
