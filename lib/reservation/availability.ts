export type DayStatus = "past" | "avail" | "full";

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export function dayStatus(d: Date, today: Date): DayStatus {
  // Normalize comparison to date-only (ignore time).
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (a < b) return "past";
  const dow = d.getDay();
  const h = hash(dayKey(d));
  if (dow === 0 && (h % 5) !== 0) return "full";   // Sundays mostly off
  if ((h % 11) === 0) return "full";
  return "avail";
}

export type SlotEntry = { time: string; taken: boolean };

export function slotsFor(date: Date): SlotEntry[] {
  const base = ["10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00"];
  const h = hash(dayKey(date));
  return base.map((t, i) => ({ time: t, taken: ((h >> i) & 7) === 0 }));
}

export function slotPeriod(time: string): string {
  const hour = parseInt(time.slice(0, 2), 10);
  if (hour < 12) return "Matin";
  if (hour < 17) return "PM";
  if (hour < 21) return "Soir";
  return "Nuit";
}
