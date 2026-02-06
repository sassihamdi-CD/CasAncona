/**
 * Admin API auth: session cookie (from login) or x-admin-key header.
 * When ADMIN_API_KEY is set, request must include header x-admin-key OR valid session cookie.
 */

import { getSessionCookie, verifySession } from "./session";

export function requireAdminAuth(request: Request): boolean {
  const key = process.env.ADMIN_API_KEY;
  const header = request.headers.get("x-admin-key");
  if (key && header === key) return true;
  const token = getSessionCookie(request);
  if (token && verifySession(token)) return true;
  if (!key) return true; // no key configured: allow (dev)
  return false;
}
