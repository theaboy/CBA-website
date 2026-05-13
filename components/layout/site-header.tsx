import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/site";
import { NavLinkItem } from "@/components/navigation/nav-link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="brand-block">
        <Link href="/" className="brand-mark">
          <span className="brand-mark-badge">
            <Image src="/cba/cba-logo.png" alt="CBA" width={36} height={36} style={{ borderRadius: "50%", objectFit: "cover" }} />
          </span>
          <span className="brand-mark-copy">
            <strong>{siteConfig.title}</strong>
            <span>{siteConfig.location}</span>
          </span>
        </Link>
      </div>

      <nav className="primary-nav" aria-label="Primary">
        {siteConfig.nav.map((link) => (
          <NavLinkItem key={link.href} {...link} />
        ))}
      </nav>

      <div className="header-actions">
        <Link href="/studio" className="ghost-chip">
          Réserver le Studio
        </Link>
        <Link href="/admin" className="solid-chip">
          Admin
        </Link>
      </div>
    </header>
  );
}
