/**
 * GET /api/admin/clients — list past clients (unique by email) with total paid and count.
 * Query: q (optional) — filter by client name or email (case-insensitive).
 * Protected: admin auth required.
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { requireAdminAuth } from "@/lib/auth/admin";
import { unauthorized, serverError } from "@/lib/api/response";
import type { GetAdminClientsResponse, AdminClientSummary } from "@/lib/types";

type Row = {
  client_name: string;
  client_email: string;
  client_phone: string | null;
  amount_paid_cents: number | null;
  currency: string | null;
  requested_start_at: string;
};

export async function GET(request: NextRequest) {
  if (!requireAdminAuth(request)) {
    return unauthorized();
  }

  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim().toLowerCase() ?? "";

    const { data: rows, error } = await getSupabaseAdmin()
      .from("appointments")
      .select("client_name, client_email, client_phone, amount_paid_cents, currency, requested_start_at")
      .in("status", ["confirmed", "completed", "pending_payment"])
      .order("requested_start_at", { ascending: false });

    if (error) {
      console.error("[api/admin/clients]", error);
      return serverError();
    }

    let list = (rows ?? []) as Row[];

    if (q.length > 0) {
      list = list.filter(
        (r) =>
          (r.client_name?.toLowerCase().includes(q)) ||
          (r.client_email?.toLowerCase().includes(q))
      );
    }

    // Group by client_email; keep latest name/phone, sum amount_paid_cents, count
    const byEmail = new Map<
      string,
      { name: string; phone: string | null; totalCents: number; currency: string; count: number }
    >();

    for (const r of list) {
      const email = r.client_email.toLowerCase();
      const existing = byEmail.get(email);
      const cents = r.amount_paid_cents ?? 0;
      const currency = r.currency ?? "eur";

      if (!existing) {
        byEmail.set(email, {
          name: r.client_name ?? "",
          phone: r.client_phone ?? null,
          totalCents: cents,
          currency,
          count: 1,
        });
      } else {
        existing.totalCents += cents;
        existing.count += 1;
      }
    }

    const clients: AdminClientSummary[] = Array.from(byEmail.entries()).map(
      ([clientEmail, agg]) => ({
        clientName: agg.name,
        clientEmail,
        clientPhone: agg.phone,
        totalPaidCents: agg.totalCents,
        currency: agg.currency,
        appointmentCount: agg.count,
      })
    );

    // Sort by client name
    clients.sort((a, b) => a.clientName.localeCompare(b.clientName, undefined, { sensitivity: "base" }));

    const body: GetAdminClientsResponse = { clients, total: clients.length };
    return NextResponse.json(body);
  } catch (e) {
    console.error("[api/admin/clients]", e);
    return serverError();
  }
}
