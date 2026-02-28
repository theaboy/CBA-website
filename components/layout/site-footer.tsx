import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div>
        <p className="eyebrow">CBA / Montreal</p>
        <h3>Built for sound-led discovery, bookings, and growth.</h3>
      </div>

      <div className="footer-grid">
        <div>
          <h4>Navigate</h4>
          <ul>
            {siteConfig.nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Social</h4>
          <ul>
            {siteConfig.social.map((link) => (
              <li key={link.label}>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Phase 1 Status</h4>
          <p>
            Premium public shell complete. Marketplace, booking, and admin operations plug into this
            foundation next.
          </p>
        </div>
      </div>
    </footer>
  );
}
