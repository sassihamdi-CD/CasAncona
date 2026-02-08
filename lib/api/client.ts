/**
 * Frontend API client — calls Next.js API routes.
 * Uses shared types from lib/types.
 */

import type {
  GetServicesResponse,
  GetServiceResponse,
  GetSlotsResponse,
  CreateBookingBody,
  CreateBookingResponse,
  GetBookingConfirmResponse,
  ApiError,
} from "@/lib/types";

function getBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data as ApiError;
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }
  return data as T;
}

export async function fetchServices(): Promise<GetServicesResponse> {
  const res = await fetch(`${getBaseUrl()}/api/services`, {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  return handleResponse<GetServicesResponse>(res);
}

export async function fetchService(id: string): Promise<GetServiceResponse> {
  const res = await fetch(`${getBaseUrl()}/api/services/${id}`);
  return handleResponse<GetServiceResponse>(res);
}

export async function fetchSlots(
  date: string,
  serviceId: string,
  options?: { includeBooked?: boolean }
): Promise<GetSlotsResponse> {
  const params = new URLSearchParams({ date, serviceId });
  if (options?.includeBooked) params.set("includeBooked", "true");
  const res = await fetch(`${getBaseUrl()}/api/slots?${params}`);
  return handleResponse<GetSlotsResponse>(res);
}

export async function createBooking(
  body: CreateBookingBody
): Promise<CreateBookingResponse> {
  const res = await fetch(`${getBaseUrl()}/api/booking`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<CreateBookingResponse>(res);
}

export async function fetchBookingConfirmBySession(
  sessionId: string
): Promise<GetBookingConfirmResponse> {
  const res = await fetch(
    `${getBaseUrl()}/api/booking/confirm?session_id=${encodeURIComponent(sessionId)}`
  );
  return handleResponse<GetBookingConfirmResponse>(res);
}

export async function fetchBookingConfirmByAppointment(
  appointmentId: string
): Promise<GetBookingConfirmResponse> {
  const res = await fetch(
    `${getBaseUrl()}/api/booking/confirm?appointment_id=${encodeURIComponent(appointmentId)}`
  );
  return handleResponse<GetBookingConfirmResponse>(res);
}

/** Fetch confirmation: pass either sessionId (after Stripe) or appointmentId (in-person). */
export async function fetchBookingConfirm(params: {
  sessionId?: string;
  appointmentId?: string;
}): Promise<GetBookingConfirmResponse> {
  if (params.sessionId) {
    return fetchBookingConfirmBySession(params.sessionId);
  }
  if (params.appointmentId) {
    return fetchBookingConfirmByAppointment(params.appointmentId);
  }
  throw new Error("sessionId or appointmentId required");
}
