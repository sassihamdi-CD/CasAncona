/**
 * POST /api/admin/login — email + password, sets session cookie.
 * Requires ADMIN_EMAIL and ADMIN_PASSWORD in .env.
 */

import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { badRequest, serverError } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      return NextResponse.json(
        { error: "SERVER_CONFIG", message: "Admin login not configured." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { email: bodyEmail, password: bodyPassword } = body;

    if (!bodyEmail || !bodyPassword) {
      return badRequest("Email and password are required.");
    }

    const emailMatch = String(bodyEmail).trim().toLowerCase() === email.toLowerCase();
    const passwordMatch = String(bodyPassword) === password;

    if (!emailMatch || !passwordMatch) {
      return NextResponse.json(
        { error: "UNAUTHORIZED", message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = createSession(email);
    const res = NextResponse.json({ ok: true, email });
    res.headers.set("Set-Cookie", setSessionCookie(token));
    return res;
  } catch (e) {
    console.error("[api/admin/login]", e);
    return serverError();
  }
}
