export type NavLink = {
  href: string;
  label: string;
  shortLabel?: string;
};

export const siteConfig = {
  name: "CBA Official Website",
  title: "CBA",
  description:
    "Premium Montreal music collective website for beats, studio bookings, DJ services, and live event discovery.",
  location: "Montreal, Canada",
  adminPreviewCookie: "cba_admin_preview",
  nav: [
    { href: "/", label: "Home" },
    { href: "/beats", label: "Beats" },
    { href: "/events", label: "Events" },
    { href: "/studio", label: "Studio" },
    { href: "/dj-services", label: "DJ Services", shortLabel: "DJ" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" }
  ] satisfies NavLink[],
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "YouTube", href: "https://youtube.com/" },
    { label: "SoundCloud", href: "https://soundcloud.com/" }
  ],
  adminNav: [
    "Overview",
    "Homepage Content",
    "Beat Catalog",
    "Studio Availability",
    "Events",
    "DJ Inquiries"
  ]
} as const;

export const pageSummaries: Record<string, { eyebrow: string; title: string; body: string }> = {
  "/beats": {
    eyebrow: "Beat Marketplace",
    title: "Browse polished placeholders for the audio storefront to come.",
    body: "Phase 1 establishes the shell, metadata, and presentation patterns that the full marketplace will inherit."
  },
  "/events": {
    eyebrow: "Live Events",
    title: "Event discovery and ticket promotion architecture.",
    body: "This page establishes the event presentation frame so future admin-managed listings feel intentional from day one."
  },
  "/studio": {
    eyebrow: "Studio Sessions",
    title: "Studio booking starts with trust, clarity, and atmosphere.",
    body: "The booking flow lands in the next phase, but the information architecture starts here."
  },
  "/dj-services": {
    eyebrow: "DJ Services",
    title: "Private events, curated sound, and production-minded presence.",
    body: "The inquiry flow will plug into this foundation after the first public shell is established."
  },
  "/about": {
    eyebrow: "About CBA",
    title: "Montreal roots with a scalable premium identity.",
    body: "This early page lays out the editorial rhythm for story-driven content and press materials."
  },
  "/contact": {
    eyebrow: "Contact",
    title: "A controlled, high-trust contact surface for future conversion flows.",
    body: "Phase 1 provides structure and presentation so contact and inquiry mechanics can be added cleanly."
  }
};
