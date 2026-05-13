import { NextRequest, NextResponse } from "next/server";
import { siteConfig } from "@/lib/site";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (pathname === "/admin/sign-in") {
    if (searchParams.get("preview") === "1") {
      const response = NextResponse.redirect(new URL("/admin", request.url));
      response.cookies.set(siteConfig.adminPreviewCookie, "granted", {
        httpOnly: true,
        sameSite: "lax",
        path: "/"
      });
      return response;
    }

    return NextResponse.next();
  }

  const hasAccess = request.cookies.get(siteConfig.adminPreviewCookie)?.value === "granted";

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/admin/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
