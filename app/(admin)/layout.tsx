import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { hasAdminPreviewAccess } from "@/lib/auth/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const hasAccess = await hasAdminPreviewAccess();

  if (!hasAccess) {
    redirect("/admin/sign-in");
  }

  return (
    <div className="admin-shell">
      <div className="admin-layout">
        <AdminSidebar />
        <main className="admin-stage">{children}</main>
      </div>
    </div>
  );
}
