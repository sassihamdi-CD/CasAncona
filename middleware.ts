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
      return NextResponse.next();
    }
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Public pages that load services from DB: never cache so admin changes show immediately
  const localeMatch = path.match(/^\/(it|en|fr|ar)(\/.*|$)/);
  if (localeMatch) {
    const sub = localeMatch[2] === "" ? "/" : localeMatch[2]; // "" for /it, "/" for /it/, "/servizi" for /it/servizi
    if (sub === "/" || sub === "/servizi" || sub === "/servizi/") {
      const res = intlMiddleware(request);
      if (res instanceof NextResponse) {
        res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        res.headers.set("Pragma", "no-cache");
      }
      return res;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
