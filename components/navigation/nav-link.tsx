"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "@/lib/site";

export function NavLinkItem({ href, label, shortLabel, icon }: NavLink) {
  const pathname  = usePathname();
  const isActive  = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <Link href={href} className={`nav-tile ${isActive ? "active" : ""}`}>
      <span className="nav-tile-icon" aria-hidden>{icon}</span>
      <span className="nav-tile-label nav-tile-desktop">{label}</span>
      <span className="nav-tile-label nav-tile-mobile">{shortLabel ?? label}</span>
    </Link>
  );
}
