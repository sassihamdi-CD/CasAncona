/**
 * Consistent API error responses — see docs/API.md § Error shape
 */

import type { ApiError } from "@/lib/types";

export function apiError(
  status: number,
  error: string,
  message: string,
  details?: unknown
): Response {
  const body: ApiError = { error, message };
  if (details !== undefined) body.details = details;
  return Response.json(body, { status });
}

export function badRequest(message: string, details?: unknown): Response {
  return apiError(400, "BAD_REQUEST", message, details);
}

export function unauthorized(message = "Unauthorized"): Response {
  return apiError(401, "UNAUTHORIZED", message);
}

export function forbidden(message = "Forbidden"): Response {
  return apiError(403, "FORBIDDEN", message);
}

export function notFound(message = "Not found"): Response {
  return apiError(404, "NOT_FOUND", message);
}

export function conflict(message: string, details?: unknown): Response {
  return apiError(409, "CONFLICT", message, details);
}

export function serverError(message = "Internal server error"): Response {
  return apiError(500, "INTERNAL_ERROR", message);
}

export function serviceUnavailable(
  message = "Service unavailable. Try again later."
): Response {
  return apiError(503, "SERVICE_UNAVAILABLE", message);
}
