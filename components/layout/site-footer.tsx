import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer-upgraded">
      {/* Photo strip */}
      <div style={{ display: "flex", height: "180px", overflow: "hidden", marginBottom: 0 }}>
        {["/cba/cba-hero-1.jpg", "/cba/cba-photo-2.jpg", "/cba/cba-photo-3.jpg", "/cba/cba-hero-2.jpg"].map((src, i) => (
          <div key={i} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
            <Image
              src={src}
              alt=""
              fill
              style={{ objectFit: "cover", filter: "brightness(0.55) saturate(0.8)", transition: "transform 0.6s ease" }}
              className="footer-strip-photo"
            />
            {i < 3 && (
              <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: "1px", background: "rgba(212,163,115,0.25)" }} />
            )}
          </div>
        ))}
        <style>{`
          .footer-strip-photo:hover { transform: scale(1.06); }
          div:has(> .footer-strip-photo):hover .footer-strip-photo { filter: brightness(0.75) saturate(1) !important; }
        `}</style>
      </div>
      <div className="footer-top">
        {/* Brand col */}
        <div className="footer-brand-col">
          <Link href="/" className="footer-wordmark">CBA</Link>
          <p className="footer-tagline">
            Beats, sessions et scènes — le son souterrain de Montréal, fait pour la culture.
          </p>
          <span className="footer-location">Montréal, Québec · Canada</span>
        </div>

        {/* Nav cols */}
        <div className="footer-nav-cols">
          <div className="footer-col">
            <h4>Navigation</h4>
            <ul>
              {siteConfig.nav.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><Link href="/beats">Catalogue de Beats</Link></li>
              <li><Link href="/studio">Sessions Studio</Link></li>
              <li><Link href="/dj-services">Services DJ</Link></li>
              <li><Link href="/events">Événements Live</Link></li>
              <li><Link href="/contact">Nous Contacter</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span className="footer-copy">
          © {new Date().getFullYear()} CBA Production. Tous droits réservés.
        </span>
        <div className="footer-social">
          {siteConfig.social.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="footer-social-link"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
