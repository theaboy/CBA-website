import Link from "next/link";

function MicIcon() {
  return (
    <svg className="service-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="16" y="4" width="16" height="26" rx="8" />
      <path d="M8 26c0 8.837 7.163 16 16 16s16-7.163 16-16" />
      <line x1="24" y1="42" x2="24" y2="46" />
      <line x1="16" y1="46" x2="32" y2="46" />
    </svg>
  );
}

function DJIcon() {
  return (
    <svg className="service-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="24" cy="24" r="18" />
      <circle cx="24" cy="24" r="5" />
      <circle cx="24" cy="24" r="2" fill="currentColor" stroke="none" />
      <path d="M24 6 L24 10M24 38 L24 42M6 24 L10 24M38 24 L42 24" strokeWidth="2" />
    </svg>
  );
}

function BeatIcon() {
  return (
    <svg className="service-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="4,24 10,14 16,34 22,10 28,38 34,20 40,28 44,24" />
    </svg>
  );
}

const services = [
  {
    icon: <MicIcon />,
    title: "Studio Sessions",
    description:
      "Book focused time in our professionally treated room. From vocal tracking to full production sessions — we create the space for your sound to breathe.",
    cta: "Book a Session",
    href: "/studio",
  },
  {
    icon: <DJIcon />,
    title: "DJ Services",
    description:
      "Private events, brand activations, and curated nightlife sets. CBA brings production-minded energy and seamless sound to every room.",
    cta: "Inquire Now",
    href: "/dj-services",
  },
  {
    icon: <BeatIcon />,
    title: "Custom Beats",
    description:
      "Looking for something built specifically for you? We craft original instrumentals tailored to your sound, genre, and vision — on your timeline.",
    cta: "Browse Catalog",
    href: "/beats",
  },
];

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ServicesSection() {
  return (
    <div className="services-section">
      <div className="services-head reveal">
        <p className="services-eyebrow">What We Offer</p>
        <h2 className="services-title">Three ways to work with CBA</h2>
      </div>

      <div className="services-grid">
        {services.map((service, i) => (
          <Link
            key={service.title}
            href={service.href}
            className={`service-card reveal reveal-delay-${i + 1}`}
          >
            {service.icon}
            <div className="service-card-body">
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-desc">{service.description}</p>
            </div>
            <span className="service-card-cta">
              {service.cta} <ArrowIcon />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
