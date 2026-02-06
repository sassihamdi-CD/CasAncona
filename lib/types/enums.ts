/**
 * Shared enums aligned with DATA_MODEL.md.
 * Use these in both API routes and frontend.
 */

export const AppointmentStatus = {
  PENDING_PAYMENT: "pending_payment",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
} as const;

export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

export const ConsultationType = {
  IN_PERSON: "in_person",
  ONLINE: "online",
} as const;

export type ConsultationType =
  (typeof ConsultationType)[keyof typeof ConsultationType];

export const StaffRole = {
  ADMIN: "admin",
  LAWYER: "lawyer",
} as const;

export type StaffRole = (typeof StaffRole)[keyof typeof StaffRole];

/** 0 = Sunday, 1 = Monday, … 6 = Saturday (matches DB) */
export const DayOfWeek = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];
