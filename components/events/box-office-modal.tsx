"use client";

import { useEffect, useMemo, useState } from "react";
import type { EventRecord } from "@/lib/events";

const SERIF = `"Cinzel", "Cormorant Garamond", Georgia, serif`;
const SANS  = `"Space Grotesk", "Inter Tight", "Helvetica Neue", Arial, sans-serif`;
const MONO  = `"JetBrains Mono", ui-monospace, monospace`;

// ── Mini bulb letters for BOX OFFICE header ──────────────────────────────────
const MINI_LETTERS: Record<string, string[]> = {
  B: ["111110", "100001", "100001", "111110", "100001", "100001", "111110"],
  O: ["011110", "100001", "100001", "100001", "100001", "100001", "011110"],
  X: ["100001", "010010", "001100", "001100", "001100", "010010", "100001"],
  F: ["111111", "100000", "100000", "111110", "100000", "100000", "100000"],
  I: ["111", "010", "010", "010", "010", "010", "111"],
  C: ["011110", "100001", "100000", "100000", "100000", "100001", "011110"],
  E: ["111111", "100000", "100000", "111110", "100000", "100000", "111111"],
  " ": ["000", "000", "000", "000", "000", "000", "000"],
};

function MiniBulbWord({ text = "BOX OFFICE", cell = 7 }: { text?: string; cell?: number }) {
  const r = cell * 0.34;
  const letterGap = cell * 1.8;
  let x = 0;
  const bulbs: { cx: number; cy: number; on: boolean }[] = [];
  for (const ch of text) {
    const grid = MINI_LETTERS[ch];
    if (!grid) { x += cell * 3 + letterGap; continue; }
    for (let row = 0; row < grid.length; row++) {
      for (let col = 0; col < grid[row].length; col++) {
        bulbs.push({
          cx: x + col * cell + cell / 2,
          cy: row * cell + cell / 2,
          on: grid[row][col] === "1",
        });
      }
    }
    x += grid[0].length * cell + letterGap;
  }
  const w = x - letterGap;
  const h = 7 * cell;
  return (
    <svg viewBox={`-4 -4 ${w + 8} ${h + 8}`} height={h + 8} style={{ display: "block" }}>
      {bulbs.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={b.cy}
          r={r}
          fill={b.on ? "#e8c870" : "#3a3024"}
          opacity={b.on ? 0.95 : 0.5}
        />
      ))}
    </svg>
  );
}

// ── Barcode util ─────────────────────────────────────────────────────────────
function Barcode({ width = 220, height = 36, dark = "#0d0a07" }: { width?: number; height?: number; dark?: string }) {
  const bars = useMemo(() => {
    const out: { x: number; w: number; on: boolean }[] = [];
    let x = 0;
    let s = 13;
    while (x < width) {
      s = (s * 9301 + 49297) % 233280;
      const w = 1 + (s % 4);
      out.push({ x, w, on: x % 5 === 0 ? true : (s % 233280) / 233280 > 0.45 });
      x += w + 1;
    }
    return out;
  }, [width]);
  return (
    <svg width={width} height={height}>
      {bars.map((b, i) => b.on && <rect key={i} x={b.x} y={0} width={b.w} height={height} fill={dark} />)}
    </svg>
  );
}

// ── Stamp dropping in on Step 3 ──────────────────────────────────────────────
function Stamp({ label, color, show }: { label: string; color: string; show: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        right: "8%",
        top: "30%",
        transform: show ? "rotate(-12deg) scale(1)" : "rotate(-26deg) scale(2.4) translateY(-120px)",
        opacity: show ? 1 : 0,
        transition: "all 700ms cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <div
        style={{
          position: "relative",
          padding: "18px 28px",
          border: `5px solid ${color}`,
          color,
          background: "transparent",
          fontFamily: MONO,
          fontSize: 38,
          fontWeight: 800,
          letterSpacing: "0.18em",
          opacity: 0.86,
          filter: "blur(0.3px)",
        }}
      >
        {label}
        <div
          style={{
            position: "absolute",
            inset: -2,
            background: `repeating-radial-gradient(circle at 10% 30%, transparent 0 2px, rgba(255,255,255,0.18) 2px 3px)`,
            mixBlendMode: "screen",
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 10,
          marginTop: 4,
          color,
          opacity: 0.7,
          letterSpacing: "0.3em",
          textAlign: "center",
        }}
      >
        {new Date().toLocaleDateString("en-CA")}
      </div>
    </div>
  );
}

const qtyBtnStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: "10px 14px",
  fontFamily: MONO,
  fontSize: 18,
  fontWeight: 700,
  color: "#0d0a07",
  cursor: "pointer",
};

function QtyControl({ qty, setQty, max = 8 }: { qty: number; setQty: (n: number) => void; max?: number }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "stretch", border: "1px solid #0d0a07" }}>
      <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} style={qtyBtnStyle} aria-label="Decrease quantity">−</button>
      <div
        style={{
          minWidth: 56,
          padding: "10px 18px",
          display: "grid",
          placeItems: "center",
          fontFamily: SERIF,
          fontSize: 22,
          fontWeight: 600,
          color: "#0d0a07",
          borderLeft: "1px solid #0d0a07",
          borderRight: "1px solid #0d0a07",
        }}
      >
        {qty}
      </div>
      <button type="button" onClick={() => setQty(Math.min(max, qty + 1))} style={qtyBtnStyle} aria-label="Increase quantity">+</button>
    </div>
  );
}

function DeliveryOpt({
  active,
  onClick,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 14px",
        background: active ? "#0d0a07" : "transparent",
        color: active ? "#f0e6d2" : "#0d0a07",
        border: "1px solid #0d0a07",
        fontFamily: SANS,
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        transition: "all 200ms",
      }}
    >
      <div>
        <div style={{ fontWeight: 600, fontSize: 14, letterSpacing: "0.04em" }}>{label}</div>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.18em",
            marginTop: 4,
            opacity: 0.7,
            textTransform: "uppercase",
          }}
        >
          {hint}
        </div>
      </div>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: `1.5px solid ${active ? "#f0e6d2" : "#0d0a07"}`,
          background: active ? "#e8c870" : "transparent",
          flexShrink: 0,
        }}
      />
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span
        style={{
          display: "block",
          fontFamily: MONO,
          fontSize: 9.5,
          letterSpacing: "0.28em",
          color: "#5a4f37",
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "12px 14px",
          background: "transparent",
          border: "1px solid #0d0a07",
          color: "#0d0a07",
          fontFamily: SERIF,
          fontSize: 17,
          outline: "none",
        }}
      />
    </label>
  );
}

// ── Ticket preview inside the modal ──────────────────────────────────────────
function TicketPreview({
  event,
  stamped,
  free,
  confirmation,
}: {
  event: EventRecord;
  stamped: boolean;
  free: boolean;
  confirmation: string;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: "#f0e6d2",
        color: "#0d0a07",
        padding: "24px 26px 22px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        backgroundImage: `repeating-linear-gradient(135deg, transparent 0 18px, rgba(13,10,7,0.022) 18px 19px)`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: "0.22em",
          color: "#5a4f37",
          textTransform: "uppercase",
          paddingBottom: 12,
          borderBottom: "1px dashed #8a7b56",
        }}
      >
        <span>Ref · {event.ticketRef}</span>
        <span>{stamped ? `Conf · ${confirmation}` : event.status}</span>
      </div>

      <div style={{ marginTop: 20, flex: 1 }}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.28em",
            color: "#5a4f37",
            textTransform: "uppercase",
          }}
        >
          {event.monthShort} {event.year}
        </div>
        <div
          style={{
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: "clamp(5rem, 12vw, 9rem)",
            lineHeight: 0.82,
            letterSpacing: "-0.04em",
            color: "#0d0a07",
            marginTop: 6,
          }}
        >
          {String(event.day).padStart(2, "0")}
        </div>

        <div
          style={{
            marginTop: 22,
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: "0.28em",
            color: "#5a4f37",
            textTransform: "uppercase",
          }}
        >
          {event.typeFr} · {event.type}
        </div>
        <h3
          style={{
            margin: "8px 0 6px",
            fontFamily: SERIF,
            fontWeight: 500,
            fontSize: 30,
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
          }}
        >
          {event.name}
        </h3>
        <div style={{ fontSize: 14, fontWeight: 500 }}>
          {event.venue} · <span style={{ color: "#5a4f37" }}>{event.city}</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px dashed #8a7b56",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {[
          ["Doors", event.doors || "—"],
          ["Show", event.time],
          ["Section", "GA"],
        ].map(([k, v]) => (
          <div key={k}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: "0.24em",
                color: "#5a4f37",
                textTransform: "uppercase",
              }}
            >
              {k}
            </div>
            <div style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 500, marginTop: 3 }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Barcode width={350} height={32} dark="#0d0a07" />
      </div>

      <Stamp
        label={stamped ? (free ? "RSVP'D" : "PAID") : ""}
        color={free ? "#1f5d3a" : "#b04a32"}
        show={stamped}
      />

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -8,
          left: 0,
          right: 0,
          height: 16,
          background: `radial-gradient(circle at 12px 8px, #0d0a07 4px, transparent 5px)`,
          backgroundSize: "24px 16px",
          opacity: 0.85,
        }}
      />
    </div>
  );
}

// ── The Modal ────────────────────────────────────────────────────────────────
export function BoxOfficeModal({ event, onClose }: { event: EventRecord; onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [qty, setQty] = useState(2);
  const [delivery, setDelivery] = useState<"email" | "willcall" | "wallet">("email");
  const [form, setForm] = useState({ name: "", email: "", phone: "", card: "" });
  const [processing, setProcessing] = useState(false);
  const [confirmation] = useState(() => "CBA-" + Math.floor(Math.random() * 90000 + 10000));

  const free = event.price === 0;
  const subtotal = (event.price || 0) * qty;
  const fees = free ? 0 : Math.round(subtotal * 0.075);
  const total = subtotal + fees;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const stamped = step === 3;

  function next() {
    if (free && step === 1) {
      setStep(3);
      return;
    }
    if (step === 2) {
      setProcessing(true);
      setTimeout(() => {
        setProcessing(false);
        setStep(3);
      }, 900);
      return;
    }
    setStep(step + 1);
  }

  function back() {
    if (step === 1) return;
    setStep(step - 1);
  }

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Box Office"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        animation: "bo-fade-in 280ms ease-out",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(1100px, 100%)",
          maxHeight: "100%",
          background: "#0d0a07",
          border: "1px solid #2a221a",
          boxShadow: "0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(232,200,112,0.06)",
          animation: "bo-rise 380ms cubic-bezier(0.16,1,0.3,1)",
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          overflow: "hidden",
        }}
      >
        <header
          style={{
            padding: "18px 26px",
            borderBottom: "1px solid #2a221a",
            background: "linear-gradient(180deg, rgba(232,200,112,0.06) 0%, transparent 100%), #0d0a07",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <MiniBulbWord text="BOX OFFICE" cell={7} />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 9.5,
                letterSpacing: "0.32em",
                color: "#7c6f55",
                textTransform: "uppercase",
                paddingLeft: 16,
                borderLeft: "1px solid #2a221a",
              }}
            >
              Issuing tickets · {event.ticketRef}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 36,
              height: 36,
              border: "1px solid #2a221a",
              background: "transparent",
              color: "#cdbba0",
              fontFamily: MONO,
              fontSize: 16,
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </header>

        <div
          className="bo-body"
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 1fr",
            gap: 0,
            minHeight: 560,
          }}
        >
          <div
            className="bo-ticket-pane"
            style={{ padding: 32, background: "#15110b", display: "grid", placeItems: "stretch" }}
          >
            <TicketPreview event={event} stamped={stamped} free={free} confirmation={confirmation} />
          </div>

          <div
            style={{
              padding: "34px 36px 26px",
              background: "#f0e6d2",
              color: "#0d0a07",
              fontFamily: SANS,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* steps tracker */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontFamily: MONO,
                fontSize: 9,
                letterSpacing: "0.28em",
                color: "#5a4f37",
                textTransform: "uppercase",
                marginBottom: 22,
              }}
            >
              {(free ? ["Review", "RSVP"] : ["Review", "Payment", "Issued"]).map((s, i, arr) => {
                const idx = i + 1;
                const stepNum = free && i === 1 ? 3 : idx;
                const active = step === stepNum;
                const done = free ? step === 3 && i === 0 : step > idx;
                return (
                  <span key={s} style={{ display: "contents" }}>
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        border: `1px solid ${active || done ? "#0d0a07" : "#8a7b56"}`,
                        background: active || done ? "#0d0a07" : "transparent",
                        color: active || done ? "#f0e6d2" : "transparent",
                        display: "grid",
                        placeItems: "center",
                        fontSize: 9,
                      }}
                    >
                      {done ? "✓" : ""}
                    </span>
                    <span
                      style={{
                        color: active ? "#0d0a07" : "#8a7b56",
                        fontWeight: active ? 700 : 500,
                      }}
                    >
                      {s}
                    </span>
                    {i < arr.length - 1 && (
                      <span style={{ flex: 1, height: 1, background: "#8a7b56", opacity: 0.5 }} />
                    )}
                  </span>
                );
              })}
            </div>

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: SERIF,
                    fontWeight: 500,
                    fontSize: 36,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.05,
                  }}
                >
                  {free ? "Reserve your spot" : `Hold ${qty > 1 ? "spots" : "a spot"} at the door`}
                </h2>
                <p
                  style={{
                    marginTop: 8,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 15,
                    color: "#3a322a",
                    lineHeight: 1.5,
                  }}
                >
                  {free
                    ? "RSVP is non-binding — just helps us pace the day."
                    : "Pick how many you need and how you want it delivered."}
                </p>

                {!free && (
                  <div style={{ marginTop: 22 }}>
                    <div
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: "0.28em",
                        color: "#5a4f37",
                        textTransform: "uppercase",
                        marginBottom: 8,
                      }}
                    >
                      How many
                    </div>
                    <QtyControl qty={qty} setQty={setQty} />
                  </div>
                )}

                <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontSize: 10,
                      letterSpacing: "0.28em",
                      color: "#5a4f37",
                      textTransform: "uppercase",
                    }}
                  >
                    Delivery
                  </div>
                  <DeliveryOpt
                    active={delivery === "email"}
                    onClick={() => setDelivery("email")}
                    label="Email PDF"
                    hint="Sent within 60 seconds"
                  />
                  <DeliveryOpt
                    active={delivery === "willcall"}
                    onClick={() => setDelivery("willcall")}
                    label="Will-call at the door"
                    hint="Bring ID · opens 1h before show"
                  />
                  <DeliveryOpt
                    active={delivery === "wallet"}
                    onClick={() => setDelivery("wallet")}
                    label="Apple / Google Wallet"
                    hint="One tap at the door"
                  />
                </div>

                <div style={{ marginTop: "auto", paddingTop: 22 }}>
                  <div style={{ padding: 14, background: "#e6dcc3", border: "1px solid #c9bd9c", fontFamily: MONO, fontSize: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                      <span style={{ color: "#5a4f37" }}>Subtotal</span>
                      <span>{free ? "Free" : `$${subtotal}`}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                      <span style={{ color: "#5a4f37" }}>Fees & tax</span>
                      <span>{free ? "—" : `$${fees}`}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0 0",
                        marginTop: 4,
                        borderTop: "1px solid #c9bd9c",
                        fontFamily: SERIF,
                        fontSize: 22,
                        fontWeight: 600,
                      }}
                    >
                      <span>Total</span>
                      <span>{free ? "Free" : `$${total}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && !free && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 500, fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                  Almost yours
                </h2>
                <p style={{ marginTop: 8, fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: "#3a322a", lineHeight: 1.5 }}>
                  We&apos;ll email your ticket to this address.
                </p>

                <div style={{ marginTop: 20 }}>
                  <Field label="Full name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Léa Bouchard" />
                  <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="lea@studio.ca" type="email" />
                  <Field label="Card · 4242 4242 4242 4242" value={form.card} onChange={(v) => setForm({ ...form, card: v })} placeholder="•••• •••• •••• ••••" />
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <Field label="MM / YY" value="" onChange={() => {}} placeholder="04 / 28" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <Field label="CVC" value="" onChange={() => {}} placeholder="•••" />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 14,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: "0.22em",
                    color: "#5a4f37",
                    textTransform: "uppercase",
                  }}
                >
                  <span>● Secure · processed via Stripe</span>
                  <span
                    style={{
                      fontFamily: SERIF,
                      fontSize: 24,
                      color: "#0d0a07",
                      letterSpacing: "-0.01em",
                      textTransform: "none",
                    }}
                  >
                    ${total}
                  </span>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                <h2 style={{ margin: 0, fontFamily: SERIF, fontWeight: 500, fontSize: 36, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
                  {free ? "You're on the list." : "Your ticket is printed."}
                </h2>
                <p
                  style={{
                    marginTop: 8,
                    fontFamily: SERIF,
                    fontStyle: "italic",
                    fontSize: 15,
                    color: "#3a322a",
                    lineHeight: 1.5,
                    maxWidth: 380,
                  }}
                >
                  {free
                    ? "Drop in anytime during opening hours. No ID needed."
                    : `Confirmation ${confirmation} — sent to ${form.email || "your inbox"}. Save the stub, screenshot the QR, or grab it at will-call.`}
                </p>

                <div style={{ marginTop: 22, padding: 16, background: "#e6dcc3", border: "1px solid #c9bd9c" }}>
                  {[
                    ["Show", `${event.day} ${event.month} ${event.year} · ${event.time}`],
                    ["Where", `${event.venue}, ${event.city}`],
                    ["Confirmation", confirmation],
                    ["Delivery", delivery === "email" ? "Email PDF (sent)" : delivery === "willcall" ? "Will-call at the door" : "Wallet (pushed)"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px dashed #c9bd9c",
                        fontFamily: MONO,
                        fontSize: 11,
                        letterSpacing: "0.16em",
                      }}
                    >
                      <span style={{ color: "#5a4f37", textTransform: "uppercase" }}>{k}</span>
                      <span style={{ color: "#0d0a07", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{v}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    marginTop: "auto",
                    paddingTop: 22,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  {[
                    ["Wallet", "📱"],
                    ["Print", "🖨"],
                    ["Email", "✉"],
                  ].map(([t, ic]) => (
                    <button
                      key={t}
                      type="button"
                      style={{
                        padding: "12px 10px",
                        background: "transparent",
                        border: "1px solid #0d0a07",
                        fontFamily: MONO,
                        fontSize: 10,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: "#0d0a07",
                        cursor: "pointer",
                      }}
                    >
                      {ic}  {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <footer
          style={{
            padding: "16px 26px",
            borderTop: "1px solid #2a221a",
            background: "#0d0a07",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={step === 3 ? onClose : back}
            disabled={step === 1}
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid #2a221a",
              color: "#cdbba0",
              cursor: step === 1 ? "default" : "pointer",
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 600,
              opacity: step === 1 ? 0.4 : 1,
            }}
          >
            {step === 3 ? "Close" : "← Back"}
          </button>

          <div
            style={{
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.28em",
              color: "#7c6f55",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {step === 1 && "Esc to cancel · Continue to confirm"}
            {step === 2 && (processing ? "● Processing payment…" : "● Stripe encrypts your details")}
            {step === 3 && "● Have a great show — see you at the door"}
          </div>

          {step < 3 ? (
            <button
              type="button"
              onClick={next}
              disabled={processing}
              style={{
                padding: "12px 22px",
                background: "#e8c870",
                color: "#0d0a07",
                border: "1px solid #e8c870",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                fontWeight: 800,
                cursor: processing ? "default" : "pointer",
                boxShadow: "0 0 22px rgba(232,200,112,0.25)",
                opacity: processing ? 0.6 : 1,
              }}
            >
              {free ? "Reserve spot →" : step === 1 ? "Continue →" : `Confirm $${total} →`}
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 22px",
                background: "#e8c870",
                color: "#0d0a07",
                border: "1px solid #e8c870",
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Done ✓
            </button>
          )}
        </footer>
      </div>

      <style jsx>{`
        @keyframes bo-fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes bo-rise {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @media (max-width: 800px) {
          .bo-body {
            grid-template-columns: 1fr !important;
          }
          .bo-ticket-pane {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
