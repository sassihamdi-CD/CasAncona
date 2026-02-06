/**
 * Shared types — single source of truth for data model and API contract.
 * See docs/DATA_MODEL.md and docs/API.md.
 */

export { AppointmentStatus, StaffRole, DayOfWeek, ConsultationType } from "./enums";

export type { Service, ServicePublic } from "./service";
export type { Staff, StaffAvailability, StaffBlockedDate } from "./staff";
export type { Appointment, AppointmentConfirmation } from "./appointment";
export type { AvailableSlot } from "./slot";

export type {
  GetServicesResponse,
  GetServiceResponse,
  GetSlotsQuery,
  GetSlotsResponse,
  CreateBookingBody,
  CreateBookingResponse,
  GetBookingConfirmQuery,
  GetBookingConfirmResponse,
  GetAdminAppointmentsQuery,
  GetAdminAppointmentsResponse,
  GetAdminAppointmentResponse,
  PatchAdminAppointmentBody,
  PatchAdminAppointmentResponse,
  GetAdminServicesResponse,
  GetAdminServiceResponse,
  CreateAdminServiceBody,
  PatchAdminServiceBody,
  CreateAdminServiceResponse,
  PatchAdminServiceResponse,
  ApiError,
} from "./api";
