/**
 * API request/response DTOs — see docs/API.md
 * Use these in route handlers and in the frontend API client.
 */

import type { Appointment, AppointmentConfirmation } from "./appointment";
import type { Service } from "./service";
import type { AvailableSlot } from "./slot";

// ——— Public API ———

export interface GetServicesResponse {
  services: Service[];
}

export interface GetServiceResponse {
  service: Service;
}

export interface GetSlotsQuery {
  date: string; // YYYY-MM-DD
  serviceId: string;
}

export interface GetSlotsResponse {
  slots: AvailableSlot[];
  /** When requested with includeBooked=true: slots that are occupied (show in red). */
  bookedSlots?: AvailableSlot[];
}

export interface CreateBookingBody {
  serviceId: string;
  /** "in_person" = free at office; "online" = paid video (pay after choosing slot) */
  consultationType: "in_person" | "online";
  startAt: string; // ISO 8601 UTC
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientMessage?: string;
  /** Optional locale for redirect URLs (e.g. "it") so confirmation/cancel use /[locale]/... */
  locale?: string;
}

export interface CreateBookingResponse {
  appointmentId: string;
  /** Present only for online (paid); redirect client here to pay */
  checkoutUrl?: string;
  /** For in-person (free); present when no payment needed */
  confirmationUrl?: string;
}

export interface GetBookingConfirmQuery {
  session_id: string;
}

export interface GetBookingConfirmResponse {
  appointment: AppointmentConfirmation;
}

// ——— Admin API ———

export interface GetAdminAppointmentsQuery {
  from?: string;
  to?: string;
  status?: string;
  staffId?: string;
}

export interface GetAdminAppointmentsResponse {
  appointments: Appointment[];
}

/** Past clients aggregated from appointments (confirmed/completed). */
export interface AdminClientSummary {
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  totalPaidCents: number;
  currency: string;
  appointmentCount: number;
}

export interface GetAdminClientsResponse {
  clients: AdminClientSummary[];
  total: number;
}

export interface GetAdminAppointmentResponse {
  appointment: Appointment;
}

export interface PatchAdminAppointmentBody {
  assignedStaffId?: string | null;
  status?: string;
}

export interface PatchAdminAppointmentResponse {
  appointment: Appointment;
}

/** Admin create walk-in appointment (in person, no payment). Same slot validation as public booking. */
export interface CreateAdminAppointmentBody {
  serviceId: string;
  startAt: string; // ISO 8601 UTC
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  clientMessage?: string;
}

export interface CreateAdminAppointmentResponse {
  appointment: Appointment;
}

export interface GetAdminServicesResponse {
  services: Service[];
}

export interface GetAdminServiceResponse {
  service: Service;
}

/** Create service — all fields as in Service except id, createdAt, updatedAt */
export interface CreateAdminServiceBody {
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
}

export interface PatchAdminServiceBody {
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
}

export interface CreateAdminServiceResponse {
  service: Service;
}

export interface PatchAdminServiceResponse {
  service: Service;
}

// ——— Error (all endpoints) ———

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
