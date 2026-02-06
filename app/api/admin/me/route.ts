/**
 * GET /api/admin/me — current admin from session (or 401).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie, verifySession } from "@/lib/auth/session";
import { unauthorized } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const token = getSessionCookie(request);
  const payload = token ? verifySession(token) : null;
  if (!payload) return unauthorized();
  return NextResponse.json({ email: payload.email });
}
