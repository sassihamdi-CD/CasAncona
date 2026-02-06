/**
 * Admin session: signed cookie-based auth.
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in .env for login.
 * Session cookie is signed with ADMIN_SESSION_SECRET (or ADMIN_API_KEY).
 */

import { cookies } from "next/headers";

const COOKIE_NAME = "cas_admin_session";
const MAX_AGE = 60 * 60 * 24; // 24 hours

type Payload = { email: string; exp: number };

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_KEY;
  if (!secret) throw new Error("Set ADMIN_SESSION_SECRET or ADMIN_API_KEY in .env");
  return secret;
}

function sign(payload: Payload): string {
  const secret = getSecret();
  const payloadStr = JSON.stringify(payload);
  const b64 = Buffer.from(payloadStr, "utf-8").toString("base64url");
  const sig = require("node:crypto").createHmac("sha256", secret).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

function verify(token: string): Payload | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig) return null;
    const secret = getSecret();
    const expected = require("node:crypto").createHmac("sha256", secret).update(b64).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(b64, "base64url").toString("utf-8")) as Payload;
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSession(email: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  return sign({ email, exp });
}

export function verifySession(token: string): Payload | null {
  return verify(token);
}

export function getSessionCookie(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getSessionFromCookies(): Promise<Payload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return token ? verifySession(token) : null;
}

export function setSessionCookie(value: string): string {
  const isProd = process.env.NODE_ENV === "production";
  return `${COOKIE_NAME}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE}${isProd ? "; Secure" : ""}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export { COOKIE_NAME };
