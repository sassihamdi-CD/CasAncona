/**
 * Map DB rows (snake_case) to API/TS entities (camelCase).
 * Single place so we stay in sync with docs/DATA_MODEL.md.
 */

import type { Service } from "@/lib/types";
import type { Appointment } from "@/lib/types";
import type { Staff, StaffAvailability, StaffBlockedDate } from "@/lib/types";
import type { Database } from "@/lib/supabase/database.types";

export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type AppointmentRow = Database["public"]["Tables"]["appointments"]["Row"];
export type StaffRow = Database["public"]["Tables"]["staff"]["Row"];
export type StaffAvailabilityRow = Database["public"]["Tables"]["staff_availability"]["Row"];
export type StaffBlockedDateRow = Database["public"]["Tables"]["staff_blocked_dates"]["Row"];

type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

/** Admin create: camelCase body → DB Insert (snake_case). */
export function serviceToDbInsert(body: {
  name: string;
  nameEn?: string | null;
  nameAr?: string | null;
  nameFr?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  descriptionFr?: string | null;
  documentsRequired?: string | null;
  documentsRequiredEn?: string | null;
  documentsRequiredAr?: string | null;
  documentsRequiredFr?: string | null;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  stripePriceId?: string | null;
  active?: boolean;
  sortOrder?: number;
}): ServiceInsert {
  return {
    name: body.name,
    name_en: body.nameEn ?? null,
    name_ar: body.nameAr ?? null,
    name_fr: body.nameFr ?? null,
    description: body.description ?? null,
    description_en: body.descriptionEn ?? null,
    description_ar: body.descriptionAr ?? null,
    description_fr: body.descriptionFr ?? null,
    documents_required: body.documentsRequired ?? null,
    documents_required_en: body.documentsRequiredEn ?? null,
    documents_required_ar: body.documentsRequiredAr ?? null,
    documents_required_fr: body.documentsRequiredFr ?? null,
    duration_minutes: body.durationMinutes,
    price_cents: body.priceCents,
    currency: body.currency,
    stripe_price_id: body.stripePriceId ?? null,
    active: body.active ?? true,
    sort_order: body.sortOrder ?? 0,
  };
}

/** Admin update: camelCase body → DB Update (snake_case). Only defined keys. */
export function serviceToDbUpdate(body: {
  name?: string;
  nameEn?: string | null;
  nameAr?: string | null;
  nameFr?: string | null;
  description?: string | null;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  descriptionFr?: string | null;
  documentsRequired?: string | null;
  documentsRequiredEn?: string | null;
  documentsRequiredAr?: string | null;
  documentsRequiredFr?: string | null;
  durationMinutes?: number;
  priceCents?: number;
  currency?: string;
  stripePriceId?: string | null;
  active?: boolean;
  sortOrder?: number;
}): ServiceUpdate {
  const u: ServiceUpdate = {};
  if (body.name !== undefined) u.name = body.name;
  if (body.nameEn !== undefined) u.name_en = body.nameEn;
  if (body.nameAr !== undefined) u.name_ar = body.nameAr;
  if (body.nameFr !== undefined) u.name_fr = body.nameFr;
  if (body.description !== undefined) u.description = body.description;
  if (body.descriptionEn !== undefined) u.description_en = body.descriptionEn;
  if (body.descriptionAr !== undefined) u.description_ar = body.descriptionAr;
  if (body.descriptionFr !== undefined) u.description_fr = body.descriptionFr;
  if (body.documentsRequired !== undefined) u.documents_required = body.documentsRequired;
  if (body.documentsRequiredEn !== undefined) u.documents_required_en = body.documentsRequiredEn;
  if (body.documentsRequiredAr !== undefined) u.documents_required_ar = body.documentsRequiredAr;
  if (body.documentsRequiredFr !== undefined) u.documents_required_fr = body.documentsRequiredFr;
  if (body.durationMinutes !== undefined) u.duration_minutes = body.durationMinutes;
  if (body.priceCents !== undefined) u.price_cents = body.priceCents;
  if (body.currency !== undefined) u.currency = body.currency;
  if (body.stripePriceId !== undefined) u.stripe_price_id = body.stripePriceId;
  if (body.active !== undefined) u.active = body.active;
  if (body.sortOrder !== undefined) u.sort_order = body.sortOrder;
  return u;
}

export function mapService(row: ServiceRow): Service {
  return {
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    nameAr: row.name_ar ?? null,
    nameFr: row.name_fr ?? null,
    description: row.description,
    descriptionEn: row.description_en,
    descriptionAr: row.description_ar ?? null,
    descriptionFr: row.description_fr ?? null,
    documentsRequired: row.documents_required ?? null,
    documentsRequiredEn: row.documents_required_en ?? null,
    documentsRequiredAr: row.documents_required_ar ?? null,
    documentsRequiredFr: row.documents_required_fr ?? null,
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents,
    currency: row.currency,
    stripePriceId: row.stripe_price_id,
    active: row.active,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    serviceId: row.service_id,
    assignedStaffId: row.assigned_staff_id,
    consultationType: row.consultation_type as Appointment["consultationType"],
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    clientMessage: row.client_message,
    requestedStartAt: row.requested_start_at,
    durationMinutes: row.duration_minutes,
    status: row.status as Appointment["status"],
    stripeSessionId: row.stripe_session_id,
    stripePaymentIntentId: row.stripe_payment_intent_id,
    amountPaidCents: row.amount_paid_cents,
    currency: row.currency,
    videoRoomId: row.video_room_id,
    videoRoomUrl: row.video_room_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapStaff(row: StaffRow): Staff {
  return {
    id: row.id,
    authUserId: row.auth_user_id,
    name: row.name,
    email: row.email,
    telegramChatId: row.telegram_chat_id,
    whatsappPhone: row.whatsapp_phone,
    role: row.role as Staff["role"],
    active: row.active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapStaffAvailability(row: StaffAvailabilityRow): StaffAvailability {
  return {
    id: row.id,
    staffId: row.staff_id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    createdAt: row.created_at,
  };
}

export function mapStaffBlockedDate(row: StaffBlockedDateRow): StaffBlockedDate {
  return {
    id: row.id,
    staffId: row.staff_id,
    date: row.date,
    reason: row.reason,
    createdAt: row.created_at,
  };
}
