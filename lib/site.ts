export type NavLink = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: string;
};

export const siteConfig = {
  name: "Site officiel de CBA",
  title: "CBA",
  description:
    "Site officiel du collectif musical CBA de Montréal — beats, réservations studio, services DJ et découverte d'événements.",
  location: "Montréal, Canada",
  adminPreviewCookie: "cba_admin_preview",
  nav: [
    { href: "/",           label: "Accueil",         icon: "⌂",  shortLabel: "Home"    },
    { href: "/beats",      label: "Nos Beats",        icon: "◈",  shortLabel: "Beats"   },
    { href: "/events",     label: "Agenda",           icon: "◷",  shortLabel: "Agenda"  },
    { href: "/studio",     label: "Session Studio",   icon: "⬡",  shortLabel: "Studio"  },
    { href: "/dj-services",label: "Book un DJ",       icon: "↝",  shortLabel: "DJ"      },
    { href: "/about",      label: "Notre ADN",        icon: "◉",  shortLabel: "ADN"     },
    { href: "/contact",    label: "Nous écrire",      icon: "✦",  shortLabel: "Contact" },
  ] satisfies NavLink[],
  social: [
    { label: "Instagram", href: "https://instagram.com/" },
    { label: "YouTube", href: "https://youtube.com/" },
    { label: "SoundCloud", href: "https://soundcloud.com/" }
  ],
  adminNav: [
    "Vue d'ensemble",
    "Contenu page d'accueil",
    "Catalogue de beats",
    "Disponibilités studio",
    "Événements",
    "Demandes DJ"
  ]
} as const;

export const pageSummaries: Record<string, { eyebrow: string; title: string; body: string }> = {
  "/beats": {
    eyebrow: "Marketplace de Beats",
    title: "Explorez notre catalogue audio soigneusement sélectionné.",
    body: "La phase 1 établit la structure, les métadonnées et les gabarits de présentation que le marketplace complet héritera."
  },
  "/events": {
    eyebrow: "Événements Live",
    title: "Découverte d'événements et architecture de promotion de billets.",
    body: "Cette page pose le cadre de présentation des événements pour que les futures annonces gérées par l'admin soient cohérentes dès le premier jour."
  },
  "/studio": {
    eyebrow: "Sessions Studio",
    title: "Réservez du temps studio dans un espace conçu pour la précision, le son et l'élan créatif.",
    body: "Choisissez un forfait, vérifiez les disponibilités et envoyez une demande de session que CBA confirmera manuellement."
  },
  "/dj-services": {
    eyebrow: "Services DJ",
    title: "Événements privés, son curatif et présence orientée production.",
    body: "Le flux de demandes se connectera à cette base après l'établissement du premier shell public."
  },
  "/about": {
    eyebrow: "À propos de CBA",
    title: "Des racines montréalaises avec une identité premium évolutive.",
    body: "Cette page pose le rythme éditorial pour les contenus narratifs et les dossiers de presse."
  },
  "/contact": {
    eyebrow: "Contact",
    title: "Un point de contact contrôlé et fiable pour les futures demandes.",
    body: "La phase 1 fournit la structure et la présentation pour que les mécaniques de contact et de demande puissent être ajoutées proprement."
  }
};
