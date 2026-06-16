import Link from "next/link";
import Image from "next/image";
import type { ComponentType } from "react";
import { FaInstagram, FaYoutube, FaSoundcloud } from "react-icons/fa";
import { siteConfig, type NavLink } from "@/lib/site";

const legalLinks: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/legal/mentions", label: "Mentions légales" },
  { href: "/legal/privacy", label: "Confidentialité" },
  { href: "/legal/cgu", label: "CGU" },
];

const socialIcons: Record<string, ComponentType<{ "aria-hidden"?: boolean }>> = {
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  SoundCloud: FaSoundcloud,
};

type FooterLink = NavLink | { href: string; label: string };

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: ReadonlyArray<FooterLink>;
}) {
  return (
    <div className="footer-col">
      <h4>{title}</h4>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>{link.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer-upgraded">
      <div className="footer-main">
        <div className="footer-brand-col">
          <Link href="/" className="footer-wordmark" aria-label="Retour à l'accueil CBA">
            <Image
              src="/cba/cba-logo-full.png"
              alt="CBA"
              width={180}
              height={120}
              className="footer-logo"
            />
          </Link>
          <p className="footer-tagline">
            Beats, sessions et scènes — le son souterrain de Montréal, fait pour la culture.
          </p>
          <div className="footer-contact">
            <a href={`mailto:${siteConfig.contact.email}`} className="footer-contact-email">
              {siteConfig.contact.email}
            </a>
            <span className="footer-contact-city">{siteConfig.contact.cityLine}</span>
          </div>
          <ul className="footer-socials">
            {siteConfig.social.map((social) => {
              const Icon = socialIcons[social.label];
              if (!Icon) return null;
              return (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Suivre CBA sur ${social.label}`}
                    className="footer-social-link"
                  >
                    <Icon aria-hidden />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="footer-nav-cols">
          <FooterColumn title="Explorer" links={siteConfig.nav} />
          <FooterColumn title="À propos" links={siteConfig.secondaryNav} />
          <FooterColumn title="Légal" links={legalLinks} />
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {year} CBA Production. Tous droits réservés.
        </span>
        <span className="footer-tag">Conçu à Montréal</span>
      </div>
    </footer>
  );
}
