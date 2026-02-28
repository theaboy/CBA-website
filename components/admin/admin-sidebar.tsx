import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <div>
        <p className="eyebrow">Internal</p>
        <h2>CBA Control Room</h2>
      </div>
      <nav aria-label="Admin navigation">
        <ul>
          {siteConfig.adminNav.map((label) => (
            <li key={label}>
              <Link href="/admin">{label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
