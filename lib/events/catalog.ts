export type EventStatus = "On sale" | "Few left" | "Sold out" | "Free · RSVP";

export type EventRecord = {
  id: string;
  num: string;
  day: number;
  month: string;
  monthShort: string;
  year: number;
  name: string;
  nameShort: string;
  venue: string;
  city: string;
  type: string;
  typeFr: string;
  time: string;
  doors: string | null;
  price: number;
  currency: string;
  status: EventStatus;
  ticketRef: string;
  capacity: number;
  poster: string;
};

export const eventsCatalog: EventRecord[] = [
  {
    id: "session-ecoute",
    num: "01",
    day: 24,
    month: "Avril",
    monthShort: "AVR",
    year: 2026,
    name: "Session d'Écoute CBA",
    nameShort: "Session d'Écoute",
    venue: "Le Ministère",
    city: "Montréal",
    type: "Listening party",
    typeFr: "Événement Collectif",
    time: "21h00",
    doors: "20h00",
    price: 15,
    currency: "CAD",
    status: "Few left",
    ticketRef: "CBA·0424·LM",
    capacity: 280,
    poster: "/cba/beat-after-hours.jpg",
  },
  {
    id: "underground-frequency",
    num: "02",
    day: 8,
    month: "Mai",
    monthShort: "MAI",
    year: 2026,
    name: "Underground Frequency Vol. 4",
    nameShort: "Underground Frequency",
    venue: "Bar Le Ritz PDB",
    city: "Montréal",
    type: "DJ Night",
    typeFr: "Soirée DJ",
    time: "22h30",
    doors: "21h30",
    price: 20,
    currency: "CAD",
    status: "On sale",
    ticketRef: "CBA·0508·LR",
    capacity: 420,
    poster: "/cba/beat-strobe-testimony.jpg",
  },
  {
    id: "portes-ouvertes",
    num: "03",
    day: 22,
    month: "Mai",
    monthShort: "MAI",
    year: 2026,
    name: "Portes Ouvertes Studio",
    nameShort: "Open Studio",
    venue: "CBA Studio",
    city: "Plateau-Mont-Royal",
    type: "Studio open house",
    typeFr: "Session Studio",
    time: "14h00 – 19h00",
    doors: null,
    price: 0,
    currency: "CAD",
    status: "Free · RSVP",
    ticketRef: "CBA·0522·CS",
    capacity: 60,
    poster: "/cba/beat-amber-session.jpg",
  },
];
