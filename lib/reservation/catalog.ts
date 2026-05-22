export type ServiceId = "studio" | "dj";
export type FormulaId = "rec" | "mix" | "prod" | "club" | "priv" | "fest";

export type Duration = { label: string; h: number };

export type Formula = {
  id: FormulaId;
  tag: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  durations: Duration[];
};

export type ServiceConfig = {
  label: string;
  location: string;
  formulas: Formula[];
};

export const SERVICES: Record<ServiceId, ServiceConfig> = {
  studio: {
    label: "Session Studio",
    location: "CBA Studio · Plateau-Mont-Royal",
    formulas: [
      {
        id: "rec",
        tag: "Enregistrement",
        name: "Sessions d'enregistrement",
        description: "Cabine vocale, régie calibrée, ingénieur sur place.",
        price: 120,
        unit: "$ / h",
        durations: [{ label: "2 h", h: 2 }, { label: "4 h", h: 4 }, { label: "Journée 8 h", h: 8 }],
      },
      {
        id: "mix",
        tag: "Mixage",
        name: "Mixage & Mastering",
        description: "Direction sonore complète, densité & traduction multi-plateformes.",
        price: 250,
        unit: "$ / titre",
        durations: [{ label: "1 titre", h: 4 }, { label: "EP · 4 titres", h: 16 }],
      },
      {
        id: "prod",
        tag: "Production",
        name: "Production sur mesure",
        description: "Sessions avec producteurs CBA, du beat à la structure finale.",
        price: 500,
        unit: "$ / jour",
        durations: [{ label: "1 jour", h: 8 }, { label: "2 jours", h: 16 }, { label: "Semaine", h: 40 }],
      },
    ],
  },
  dj: {
    label: "Réservation DJ",
    location: "Sur place · Montréal & environs",
    formulas: [
      {
        id: "club",
        tag: "Club / Bar",
        name: "Set Club · 2 h",
        description: "Open / b2b / set signature CBA. Matériel Pioneer fourni si besoin.",
        price: 450,
        unit: "$ / set",
        durations: [{ label: "2 h", h: 2 }, { label: "3 h", h: 3 }, { label: "4 h", h: 4 }],
      },
      {
        id: "priv",
        tag: "Privé",
        name: "Événement privé",
        description: "Mariage, anniversaire, corporate. Set sur mesure, MC inclus.",
        price: 850,
        unit: "$ / soirée",
        durations: [{ label: "4 h", h: 4 }, { label: "6 h", h: 6 }, { label: "Soirée complète", h: 8 }],
      },
      {
        id: "fest",
        tag: "Festival",
        name: "Festival / Showcase",
        description: "Set scénique, fiche technique fournie, coordination régie.",
        price: 1200,
        unit: "$ / showcase",
        durations: [{ label: "60 min", h: 1 }, { label: "90 min", h: 1.5 }, { label: "120 min", h: 2 }],
      },
    ],
  },
};

export function getFormula(service: ServiceId, formulaId: FormulaId | null): Formula | null {
  if (!formulaId) return null;
  return SERVICES[service].formulas.find((f) => f.id === formulaId) ?? null;
}
