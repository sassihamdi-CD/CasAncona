import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const COOKIE_NAME = "cas_admin_session";

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Admin: require session cookie (except login page)
  if (path.startsWith("/admin")) {
    if (path === "/admin/login") {
      return NextResponse.next();
    }
    if (path === "/admin" || path === "/admin/") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Locale-prefixed routes
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
