/**
 * Compute available slots for a date and service.
 * See docs/DATA_MODEL.md § Slot computation.
 * Office timezone: Europe/Rome (configurable via env OFFICE_TIMEZONE).
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { AvailableSlot } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

const OFFICE_TIMEZONE = process.env.OFFICE_TIMEZONE ?? "Europe/Rome";
const SLOT_STEP_MINUTES = 30;

/**
 * Parse YYYY-MM-DD in office timezone and get start/end of day in UTC (for DB comparison).
 */
function getDayBoundsUtc(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const startLocal = new Date(y, m - 1, d, 0, 0, 0);
  const endLocal = new Date(y, m - 1, d, 23, 59, 59);
  return { start: startLocal, end: endLocal };
}

/**
 * Get day of week (0 = Sunday, 1 = Monday, ...) for a date string YYYY-MM-DD in office timezone.
 */
function getDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getDay();
}

type ServiceRow = Pick<Database["public"]["Tables"]["services"]["Row"], "duration_minutes">;
type AvailabilityRow = Pick<
  Database["public"]["Tables"]["staff_availability"]["Row"],
  "staff_id" | "start_time" | "end_time"
>;
type BlockedRow = Pick<Database["public"]["Tables"]["staff_blocked_dates"]["Row"], "staff_id">;
type AppointmentSlotRow = Pick<
  Database["public"]["Tables"]["appointments"]["Row"],
  "assigned_staff_id" | "requested_start_at" | "duration_minutes"
>;

export async function getAvailableSlots(
  dateStr: string,
  serviceId: string
): Promise<AvailableSlot[]> {
  const supabase = getSupabaseAdmin();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .eq("active", true)
    .single();

  if (serviceError || !service) {
    return [];
  }

  const svc = service as ServiceRow;
  const durationMinutes = svc.duration_minutes;
  const dayOfWeek = getDayOfWeek(dateStr);

  const { data: availability, error: availError } = await supabase
    .from("staff_availability")
    .select("staff_id, start_time, end_time")
    .eq("day_of_week", dayOfWeek);

  if (availError || !availability?.length) {
    return [];
  }

  const { data: blocked } = await supabase
    .from("staff_blocked_dates")
    .select("staff_id")
    .eq("date", dateStr);

  const blockedStaffIds = new Set((blocked ?? []).map((r: BlockedRow) => r.staff_id));

  const { start: dayStart, end: dayEnd } = getDayBoundsUtc(dateStr);

  const { data: appointments, error: appError } = await supabase
    .from("appointments")
    .select("assigned_staff_id, requested_start_at, duration_minutes")
    .in("status", ["pending_payment", "confirmed"])
    .gte("requested_start_at", dayStart.toISOString())
    .lte("requested_start_at", dayEnd.toISOString());

  if (appError) {
    return [];
  }

  const busyRangesByStaff = new Map<string, Array<{ start: Date; end: Date }>>();
  for (const a of (appointments ?? []) as AppointmentSlotRow[]) {
    const staffId = a.assigned_staff_id ?? "any";
    const start = new Date(a.requested_start_at);
    const end = new Date(start.getTime() + (a.duration_minutes ?? 0) * 60 * 1000);
    if (!busyRangesByStaff.has(staffId)) {
      busyRangesByStaff.set(staffId, []);
    }
    busyRangesByStaff.get(staffId)!.push({ start, end });
  }

  const slots: AvailableSlot[] = [];
  const seen = new Set<string>();
  const availList = availability as AvailabilityRow[];

  for (const avail of availList) {
    if (blockedStaffIds.has(avail.staff_id)) continue;

    const [sh, sm] = String(avail.start_time).split(":").map(Number);
    const [eh, em] = String(avail.end_time).split(":").map(Number);
    const [y, mo, day] = dateStr.split("-").map(Number);
    let slotStart = new Date(y, mo - 1, day, sh, sm, 0);
    const windowEnd = new Date(y, mo - 1, day, eh, em, 0);

    while (slotStart.getTime() + durationMinutes * 60 * 1000 <= windowEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      const busy = busyRangesByStaff.get(avail.staff_id) ?? [];
      const overlaps = busy.some(
        (b) =>
          (slotStart.getTime() < b.end.getTime() && slotEnd.getTime() > b.start.getTime())
      );
      if (!overlaps) {
        const key = slotStart.toISOString();
        if (!seen.has(key)) {
          seen.add(key);
          slots.push({
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString(),
            staffId: avail.staff_id,
          });
        }
      }
      slotStart = new Date(slotStart.getTime() + SLOT_STEP_MINUTES * 60 * 1000);
    }
  }

  slots.sort((a, b) => a.startAt.localeCompare(b.startAt));
  return slots;
}

/** Same as getAvailableSlots but also returns booked slots (same grid, occupied). Single source of truth for UI (red = booked). */
export async function getSlotsWithAvailability(
  dateStr: string,
  serviceId: string
): Promise<{ available: AvailableSlot[]; booked: AvailableSlot[] }> {
  const supabase = getSupabaseAdmin();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .eq("active", true)
    .single();

  if (serviceError || !service) {
    return { available: [], booked: [] };
  }

  const svc = service as ServiceRow;
  const durationMinutes = svc.duration_minutes;
  const dayOfWeek = getDayOfWeek(dateStr);

  const { data: availability, error: availError } = await supabase
    .from("staff_availability")
    .select("staff_id, start_time, end_time")
    .eq("day_of_week", dayOfWeek);

  if (availError || !availability?.length) {
    return { available: [], booked: [] };
  }

  const { data: blocked } = await supabase
    .from("staff_blocked_dates")
    .select("staff_id")
    .eq("date", dateStr);

  const blockedStaffIds = new Set((blocked ?? []).map((r: BlockedRow) => r.staff_id));

  const { start: dayStart, end: dayEnd } = getDayBoundsUtc(dateStr);

  const { data: appointments, error: appError } = await supabase
    .from("appointments")
    .select("assigned_staff_id, requested_start_at, duration_minutes")
    .in("status", ["pending_payment", "confirmed"])
    .gte("requested_start_at", dayStart.toISOString())
    .lte("requested_start_at", dayEnd.toISOString());

  if (appError) {
    return { available: [], booked: [] };
  }

  const busyRangesByStaff = new Map<string, Array<{ start: Date; end: Date }>>();
  for (const a of (appointments ?? []) as AppointmentSlotRow[]) {
    const staffId = a.assigned_staff_id ?? "any";
    const start = new Date(a.requested_start_at);
    const end = new Date(start.getTime() + (a.duration_minutes ?? 0) * 60 * 1000);
    if (!busyRangesByStaff.has(staffId)) {
      busyRangesByStaff.set(staffId, []);
    }
    busyRangesByStaff.get(staffId)!.push({ start, end });
  }

  const available: AvailableSlot[] = [];
  const booked: AvailableSlot[] = [];
  const seenAvailable = new Set<string>();
  const seenBooked = new Set<string>();
  const availList = availability as AvailabilityRow[];

  for (const avail of availList) {
    if (blockedStaffIds.has(avail.staff_id)) continue;

    const [sh, sm] = String(avail.start_time).split(":").map(Number);
    const [eh, em] = String(avail.end_time).split(":").map(Number);
    const [y, mo, day] = dateStr.split("-").map(Number);
    let slotStart = new Date(y, mo - 1, day, sh, sm, 0);
    const windowEnd = new Date(y, mo - 1, day, eh, em, 0);

    while (slotStart.getTime() + durationMinutes * 60 * 1000 <= windowEnd.getTime()) {
      const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60 * 1000);
      const busy = busyRangesByStaff.get(avail.staff_id) ?? [];
      const overlaps = busy.some(
        (b) =>
          slotStart.getTime() < b.end.getTime() && slotEnd.getTime() > b.start.getTime()
      );
      const key = slotStart.toISOString();
      if (overlaps) {
        if (!seenBooked.has(key)) {
          seenBooked.add(key);
          booked.push({
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString(),
            staffId: avail.staff_id,
          });
        }
      } else {
        if (!seenAvailable.has(key)) {
          seenAvailable.add(key);
          available.push({
            startAt: slotStart.toISOString(),
            endAt: slotEnd.toISOString(),
            staffId: avail.staff_id,
          });
        }
      }
      slotStart = new Date(slotStart.getTime() + SLOT_STEP_MINUTES * 60 * 1000);
    }
  }

  available.sort((a, b) => a.startAt.localeCompare(b.startAt));
  booked.sort((a, b) => a.startAt.localeCompare(b.startAt));
  return { available, booked };
}
