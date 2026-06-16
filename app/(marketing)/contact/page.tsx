import type { ComponentType } from "react";
import { FaInstagram, FaYoutube, FaSoundcloud } from "react-icons/fa";
import { siteConfig } from "@/lib/site";
import { Section } from "@/components/primitives/section";

const socialIcons: Record<string, ComponentType<{ "aria-hidden"?: boolean }>> = {
  Instagram: FaInstagram,
  YouTube: FaYoutube,
  SoundCloud: FaSoundcloud,
};

export default function ContactPage() {
  const { email, cityLine } = siteConfig.contact;

  return (
    <div className="page-shell contact-page">
      <Section
        eyebrow="Contact"
        title="Parlons de votre prochain projet."
        body="Beats, réservations studio, bookings ou collaborations — écrivez-nous directement, on vous répond vite."
      >
        <div className="contact-layout">
          <article className="contact-card contact-card--primary">
            <span className="contact-card-label">Écrivez-nous</span>
            <a className="contact-email" href={`mailto:${email}`}>
              {email}
            </a>
            <p>La façon la plus directe de joindre l&apos;équipe CBA. On lit chaque message.</p>
            <a className="contact-cta" href={`mailto:${email}`}>
              Démarrer une conversation
            </a>
          </article>

          <aside className="contact-side">
            <div className="contact-info-block">
              <span className="contact-info-label">Localisation</span>
              <p>{cityLine}</p>
            </div>

            <div className="contact-info-block">
              <span className="contact-info-label">Réseaux</span>
              <ul className="contact-socials">
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
                        className="contact-social-link"
                      >
                        <Icon aria-hidden />
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="contact-info-block">
              <span className="contact-info-label">Délai de réponse</span>
              <p>Sous 24 à 48 h, du lundi au vendredi.</p>
            </div>
          </aside>
        </div>
      </Section>
    </div>
  );
}
