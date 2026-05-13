import { cookies } from "next/headers";
import { siteConfig } from "@/lib/site";

export async function hasAdminPreviewAccess() {
  const store = await cookies();
  return store.get(siteConfig.adminPreviewCookie)?.value === "granted";
}
