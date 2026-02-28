"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "@/lib/site";

export function NavLinkItem({ href, label, shortLabel }: NavLink) {
  const pathname = usePathname();
  const isActive = href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <Link href={href} className={`nav-link ${isActive ? "active" : ""}`}>
      <span className="nav-link-desktop">{label}</span>
      <span className="nav-link-mobile">{shortLabel ?? label}</span>
    </Link>
  );
}
