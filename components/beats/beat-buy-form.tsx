"use client";

import { useActionState, type CSSProperties } from "react";
import { useFormStatus } from "react-dom";
import { Beat } from "@/lib/beats";
import { submitBeatInquiry } from "@/app/(marketing)/beats/[slug]/actions";
import { initialBeatInquiryState } from "@/lib/inquiries/beat-inquiry";
import {
  PAPER,
  INK,
  INK_MUTE,
  GOLD,
  LINE_MED,
  SERIF,
  SANS,
  MONO,
} from "@/lib/beats/light-theme";

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  fontFamily: MONO,
  fontSize: 10,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color: INK_MUTE,
};

const inputStyle: CSSProperties = {
  background: PAPER,
  border: `1px solid ${LINE_MED}`,
  color: INK,
  fontFamily: SANS,
  fontSize: 14,
  padding: "11px 12px",
  borderRadius: 2,
  outline: "none",
  width: "100%",
};

const errorStyle: CSSProperties = {
  fontFamily: SANS,
  fontSize: 11,
  letterSpacing: "0.02em",
  textTransform: "none",
  color: "#a23b2c",
};

export function BeatBuyForm({ beat }: { beat: Beat }) {
  const [state, formAction] = useActionState(submitBeatInquiry, initialBeatInquiryState);

  if (state.status === "success" && state.summary) {
    return (
      <div
        style={{
          border: `1px solid ${GOLD}`,
          background: "rgba(164,123,60,0.06)",
          padding: "26px 24px",
          borderRadius: 2,
        }}
      >
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          Inquiry sent
        </div>
        <h3 style={{ margin: "12px 0 0", fontFamily: SERIF, fontWeight: 500, fontSize: 26, color: INK }}>
          {state.summary.beatTitle}
        </h3>
        <p style={{ margin: "10px 0 0", fontFamily: SANS, fontSize: 14, lineHeight: 1.55, color: INK }}>
          {state.message}
        </p>
        <p style={{ margin: "8px 0 0", fontFamily: MONO, fontSize: 11, letterSpacing: "0.12em", color: INK_MUTE }}>
          {state.summary.email}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: GOLD,
        }}
      >
        Acquire this beat
      </div>

      <input type="hidden" name="beatSlug" value={beat.slug} />
      <input type="hidden" name="licenseCode" value="basic" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <label style={labelStyle}>
          Name
          <input style={inputStyle} name="name" type="text" placeholder="Artist or manager" required />
          {state.fieldErrors?.name ? <small style={errorStyle}>{state.fieldErrors.name}</small> : null}
        </label>
        <label style={labelStyle}>
          Email
          <input style={inputStyle} name="email" type="email" placeholder="you@example.com" required />
          {state.fieldErrors?.email ? <small style={errorStyle}>{state.fieldErrors.email}</small> : null}
        </label>
        <label style={labelStyle}>
          Artist name
          <input style={inputStyle} name="artistName" type="text" placeholder="Stage name or group" required />
          {state.fieldErrors?.artistName ? <small style={errorStyle}>{state.fieldErrors.artistName}</small> : null}
        </label>
        <label style={labelStyle}>
          Intended use
          <input style={inputStyle} name="intendedUse" type="text" placeholder="Single, demo, campaign..." required />
          {state.fieldErrors?.intendedUse ? <small style={errorStyle}>{state.fieldErrors.intendedUse}</small> : null}
        </label>
      </div>

      <label style={labelStyle}>
        Notes
        <textarea
          style={{ ...inputStyle, resize: "vertical", minHeight: 84 }}
          name="notes"
          rows={3}
          placeholder="Direction, timeline, or any context CBA should know."
          required
        />
        {state.fieldErrors?.notes ? <small style={errorStyle}>{state.fieldErrors.notes}</small> : null}
      </label>

      {state.status === "error" && state.message ? (
        <p style={{ fontFamily: SANS, fontSize: 13, color: "#a23b2c", margin: 0 }}>{state.message}</p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        marginTop: 2,
        padding: "15px 26px",
        background: INK,
        color: PAPER,
        border: "none",
        borderRadius: 2,
        fontFamily: SANS,
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        cursor: pending ? "default" : "pointer",
        opacity: pending ? 0.6 : 1,
        alignSelf: "flex-start",
      }}
    >
      {pending ? "Sending..." : "Send inquiry"}
    </button>
  );
}
