"use client";

import { useMemo, useState } from "react";
import {
  getBookableStudioDays,
  getDefaultStudioSelection,
  getStudioPackageByCode,
  getStudioSlot,
  StudioAvailabilityDay,
  studioDurationOptions,
  studioPackages
} from "@/lib/studio";
import { StudioBookingForm } from "@/components/studio/studio-booking-form";

type StudioSelection = {
  packageCode: string;
  dayId: string;
  slotId: string;
  durationHours: number;
};

export function StudioBookingShell() {
  const defaults = getDefaultStudioSelection();
  const days = getBookableStudioDays();
  const [selection, setSelection] = useState<StudioSelection>(defaults);

  const selectedPackage = getStudioPackageByCode(selection.packageCode) ?? studioPackages[0];
  const selectedDay = days.find((entry) => entry.id === selection.dayId) ?? days[0];
  const selectedSlot = getStudioSlot(selectedDay.id, selection.slotId) ?? selectedDay.slots[0];

  const compatibleDurationOptions = useMemo(
    () => studioDurationOptions.filter((entry) => entry <= Math.max(selectedSlot.durationHours, selectedPackage.durationHours)),
    [selectedPackage.durationHours, selectedSlot.durationHours]
  );

  return (
    <div className="studio-shell">
      <section className="studio-hero">
        <div className="studio-hero-copy">
          <p className="eyebrow">Studio Booking</p>
          <h1>Midnight-room discipline with enough space to finish a record properly.</h1>
          <p className="section-body">
            CBA sessions are built for artists who want direction, tone control, and a room that moves
            with intent. Choose the package, check the next available windows, and send the request with
            the session details already attached.
          </p>
          <div className="studio-hero-ribbon">
            <span>Montreal-based</span>
            <span>Inquiry-first booking</span>
            <span>Manual session confirmation</span>
          </div>
        </div>

        <div className="studio-hero-panel">
          <div className="studio-hero-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="studio-hero-panel-copy">
            <p className="eyebrow">Room Standard</p>
            <h2>Quiet capture, direct feedback, and late-session momentum.</h2>
            <p>
              The booking flow below is built to start the conversation quickly while keeping package,
              slot, and session expectations clear.
            </p>
          </div>
        </div>
      </section>

      <section className="studio-story-grid">
        <article className="studio-story-card">
          <p className="eyebrow">Why Artists Book</p>
          <h3>Direction without chaos.</h3>
          <p>
            Sessions are structured to protect performance energy. The room pace stays sharp, feedback stays
            actionable, and every booking starts with a clear request context.
          </p>
        </article>
        <article className="studio-story-card">
          <p className="eyebrow">Session Flow</p>
          <h3>Book. Confirm. Pull up ready.</h3>
          <p>
            Pick the package and slot that fits your release window. CBA confirms the request manually, then
            sends the follow-up details directly.
          </p>
        </article>
        <article className="studio-story-card">
          <p className="eyebrow">Prep Note</p>
          <h3>Bring the brief, not the guesswork.</h3>
          <p>
            Use the notes field for references, timeline, or session goals so the booking can be confirmed
            with the right setup from the start.
          </p>
        </article>
      </section>

      <section className="studio-package-shell">
        <div className="studio-section-head">
          <div>
            <p className="eyebrow">Packages</p>
            <h2>Three session lanes, each built for a different pace.</h2>
          </div>
          <p className="section-body">
            The page stays editorial, but the package decisions are concrete: duration, pricing anchor, and
            session intent are all explicit before booking starts.
          </p>
        </div>

        <div className="studio-package-grid">
          {studioPackages.map((entry) => {
            const active = entry.code === selectedPackage.code;

            return (
              <button
                key={entry.code}
                type="button"
                className={`studio-package-card ${active ? "active" : ""}`}
                onClick={() => {
                  setSelection((current) => ({
                    ...current,
                    packageCode: entry.code,
                    durationHours: entry.durationHours
                  }));
                }}
              >
                <div className="studio-package-top">
                  <div>
                    <span>{entry.durationHours} hour session</span>
                    <h3>{entry.name}</h3>
                  </div>
                  <strong>${entry.price}</strong>
                </div>
                <p>{entry.summary}</p>
                <p className="studio-package-tagline">{entry.tagline}</p>
                <ul>
                  {entry.includes.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <em>{entry.atmosphere}</em>
              </button>
            );
          })}
        </div>
      </section>

      <section className="studio-booking-stage">
        <div className="studio-section-head">
          <div>
            <p className="eyebrow">Availability</p>
            <h2>Choose the date and window that matches the session pace.</h2>
          </div>
          <p className="section-body">
            Slots are request-based, not instantly guaranteed. Your selected package and time are carried
            straight into the booking request below.
          </p>
        </div>

        <div className="studio-stage-grid">
          <div className="studio-availability-shell">
            <div className="studio-day-column">
              {days.map((day) => {
                const active = day.id === selectedDay.id;

                return (
                  <button
                    key={day.id}
                    type="button"
                    className={`studio-day-card ${active ? "active" : ""}`}
                    onClick={() => {
                      const firstSlot = day.slots.find((entry) => entry.available) ?? day.slots[0];

                      setSelection((current) => ({
                        ...current,
                        dayId: day.id,
                        slotId: firstSlot.id,
                        durationHours: firstSlot.durationHours
                      }));
                    }}
                  >
                    <strong>{day.label}</strong>
                    <span>{day.note}</span>
                  </button>
                );
              })}
            </div>

            <StudioSlotList
              day={selectedDay}
              selectedSlotId={selection.slotId}
              onSelect={(slotId, durationHours) => {
                setSelection((current) => ({
                  ...current,
                  slotId,
                  durationHours
                }));
              }}
            />
          </div>

          <StudioBookingForm
            packageOption={selectedPackage}
            day={selectedDay}
            slot={selectedSlot}
            durationOptions={compatibleDurationOptions}
            durationHours={selection.durationHours}
            onDurationChange={(durationHours) => {
              setSelection((current) => ({
                ...current,
                durationHours
              }));
            }}
          />
        </div>
      </section>
    </div>
  );
}

function StudioSlotList({
  day,
  selectedSlotId,
  onSelect
}: {
  day: StudioAvailabilityDay;
  selectedSlotId: string;
  onSelect: (slotId: string, durationHours: number) => void;
}) {
  return (
    <div className="studio-slot-grid">
      {day.slots.map((slot) => {
        const active = slot.id === selectedSlotId;

        return (
          <button
            key={slot.id}
            type="button"
            className={`studio-slot-card ${active ? "active" : ""}`}
            disabled={!slot.available}
            onClick={() => {
              if (!slot.available) return;
              onSelect(slot.id, slot.durationHours);
            }}
          >
            <span>{slot.available ? "Open slot" : "Booked"}</span>
            <strong>{slot.label}</strong>
            <em>{slot.durationHours} hour window</em>
          </button>
        );
      })}
    </div>
  );
}
