"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";
import { NavLinkItem } from "@/components/navigation/nav-link";
import { MobileMenu } from "@/components/navigation/mobile-menu";
import styles from "./site-nav.module.css";

export function SiteNav() {
  const [isHidden, setIsHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      setIsHidden(false);
      return;
    }

    setIsHidden(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHidden(entry.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [pathname]);

  return (
    <>
      <header className={`${styles.bar} ${isHidden ? styles.isHidden : ""}`}>
        <Link href="/" className={styles.brand} aria-label={siteConfig.title}>
          <Image
            src="/cba/cba-logo-full.png"
            alt="CBA — Create · Build · Achieve"
            width={60}
            height={40}
            priority
            className={styles.brandLogo}
          />
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {siteConfig.nav.map((link) => (
            <NavLinkItem key={link.href} {...link} />
          ))}
        </nav>

        <div className={styles.actions}>
          <Link href="/admin" className={styles.adminChip}>Admin</Link>
          <button
            ref={burgerRef}
            type="button"
            className={styles.burger}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span className={styles.burgerLines}><span /><span /><span /></span>
          </button>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} triggerRef={burgerRef} />
    </>
  );
}
