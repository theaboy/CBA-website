export type StudioPackageCode = "signal-room" | "vocal-direction" | "night-lockout";

export type StudioPackage = {
  code: StudioPackageCode;
  name: string;
  durationHours: number;
  price: number;
  summary: string;
  tagline: string;
  includes: string[];
  bestFor: string[];
  atmosphere: string;
};

export type StudioSlot = {
  id: string;
  start: string;
  end: string;
  label: string;
  durationHours: number;
  available: boolean;
};

export type StudioAvailabilityDay = {
  id: string;
  isoDate: string;
  label: string;
  note: string;
  slots: StudioSlot[];
};

export const studioPackages: StudioPackage[] = [
  {
    code: "signal-room",
    name: "Signal Room",
    durationHours: 2,
    price: 140,
    summary: "Focused tracking for artists who need a clean record, quick direction, and a confident room.",
    tagline: "Fast session. Sharp takes. No wasted motion.",
    includes: ["Engineer-guided setup", "Stereo reference bounce", "Performance capture support"],
    bestFor: ["Single-record sessions", "Punch-in fixes", "Quick topline work"],
    atmosphere: "Tight control-room energy with a disciplined recording pace."
  },
  {
    code: "vocal-direction",
    name: "Vocal Direction",
    durationHours: 4,
    price: 260,
    summary: "A longer vocal session with arrangement feedback, layering support, and stronger creative guidance.",
    tagline: "For artists building a release, not just logging stems.",
    includes: ["Creative direction", "Layering and doubles", "Session recap for next steps"],
    bestFor: ["Lead vocal builds", "Hooks and doubles", "Release-ready session work"],
    atmosphere: "Hands-on direction with enough time to shape tone and performance."
  },
  {
    code: "night-lockout",
    name: "Night Lockout",
    durationHours: 6,
    price: 420,
    summary: "Extended studio time for artists or teams who need room to write, track, and shape the energy properly.",
    tagline: "A deeper lock-in for serious session momentum.",
    includes: ["Extended room access", "Creative pacing flexibility", "Priority follow-up context"],
    bestFor: ["Project sessions", "Writing camps", "Late-night collaborative work"],
    atmosphere: "Immersive evening session with space for ideas to breathe."
  }
];

export const studioAvailability: StudioAvailabilityDay[] = [
  {
    id: "mar-03",
    isoDate: "2026-03-03",
    label: "Tue 03 Mar",
    note: "Quiet room window with tighter engineer turnaround.",
    slots: [
      { id: "mar-03-1300", start: "13:00", end: "15:00", label: "1:00 PM - 3:00 PM", durationHours: 2, available: true },
      { id: "mar-03-1600", start: "16:00", end: "20:00", label: "4:00 PM - 8:00 PM", durationHours: 4, available: true },
      { id: "mar-03-2100", start: "21:00", end: "03:00", label: "9:00 PM - 3:00 AM", durationHours: 6, available: false }
    ]
  },
  {
    id: "mar-05",
    isoDate: "2026-03-05",
    label: "Thu 05 Mar",
    note: "Best for evening vocal sessions and campaign work.",
    slots: [
      { id: "mar-05-1200", start: "12:00", end: "14:00", label: "12:00 PM - 2:00 PM", durationHours: 2, available: true },
      { id: "mar-05-1500", start: "15:00", end: "19:00", label: "3:00 PM - 7:00 PM", durationHours: 4, available: true },
      { id: "mar-05-2000", start: "20:00", end: "02:00", label: "8:00 PM - 2:00 AM", durationHours: 6, available: true }
    ]
  },
  {
    id: "mar-07",
    isoDate: "2026-03-07",
    label: "Sat 07 Mar",
    note: "Weekend premium slots with faster demand.",
    slots: [
      { id: "mar-07-1100", start: "11:00", end: "13:00", label: "11:00 AM - 1:00 PM", durationHours: 2, available: false },
      { id: "mar-07-1400", start: "14:00", end: "18:00", label: "2:00 PM - 6:00 PM", durationHours: 4, available: true },
      { id: "mar-07-1900", start: "19:00", end: "01:00", label: "7:00 PM - 1:00 AM", durationHours: 6, available: true }
    ]
  }
];

export const studioDurationOptions = [2, 4, 6] as const;

export function getStudioPackageByCode(code: string) {
  return studioPackages.find((entry) => entry.code === code) ?? null;
}

export function getStudioAvailabilityDayById(dayId: string) {
  return studioAvailability.find((entry) => entry.id === dayId) ?? null;
}

export function getStudioSlot(dayId: string, slotId: string) {
  return getStudioAvailabilityDayById(dayId)?.slots.find((slot) => slot.id === slotId) ?? null;
}

export function getBookableStudioDays() {
  return studioAvailability.filter((day) => day.slots.some((slot) => slot.available));
}

export function getDefaultStudioSelection() {
  const day = getBookableStudioDays()[0] ?? studioAvailability[0];
  const slot = day.slots.find((entry) => entry.available) ?? day.slots[0];
  const packageOption =
    studioPackages.find((entry) => entry.durationHours === slot.durationHours) ?? studioPackages[0];

  return {
    packageCode: packageOption.code,
    dayId: day.id,
    slotId: slot.id,
    durationHours: slot.durationHours
  };
}
