"use client";

import Link from "next/link";
import { useEffect, useRef, type RefObject } from "react";
import { siteConfig } from "@/lib/site";
import styles from "./mobile-menu.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
};

export function MobileMenu({ open, onClose, triggerRef }: Props) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      triggerRef.current?.focus();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div className={`${styles.overlay} ${open ? styles.open : ""}`} aria-hidden={!open} inert={!open || undefined}>
      <div className={styles.topBar}>
        <span className={styles.brandLabel}>{siteConfig.title}</span>
        <button type="button" className={styles.close} aria-label="Fermer le menu" onClick={onClose}>
          ✕
        </button>
      </div>

      <ul className={styles.primary}>
        {siteConfig.nav.map((link, i) => (
          <li key={link.href}>
            <Link
              href={link.href}
              ref={i === 0 ? firstLinkRef : undefined}
              onClick={onClose}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.divider} />

      <ul className={styles.secondary}>
        {siteConfig.secondaryNav.map((link) => (
          <li key={link.href}>
            <Link href={link.href} onClick={onClose}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className={styles.adminRow}>
        <Link href="/admin" className={styles.adminChip} onClick={onClose}>Admin</Link>
      </div>

      <div className={styles.social}>
        {siteConfig.social.map((s) => (
          <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
            {s.label}
          </a>
        ))}
      </div>
    </div>
  );
}
