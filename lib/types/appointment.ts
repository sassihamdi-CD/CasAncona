/**
 * Appointment entity — see docs/DATA_MODEL.md § appointments
 */

import type { AppointmentStatus } from "./enums";
import type { ConsultationType } from "./enums";

export interface Appointment {
  id: string;
  serviceId: string;
  consultationType: ConsultationType;
  assignedStaffId: string | null;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  clientMessage: string | null;
  requestedStartAt: string; // ISO 8601 UTC
  durationMinutes: number;
  status: AppointmentStatus;
  stripeSessionId: string | null;
  stripePaymentIntentId: string | null;
  amountPaidCents: number | null;
  currency: string | null;
  videoRoomId: string | null;
  videoRoomUrl: string | null;
  /** Storage path in bucket passport-documents, e.g. {id}/passport.jpg */
  passportDocumentPath: string | null;
  createdAt: string;
  updatedAt: string;
}

/** For confirmation page (post-payment); minimal + video link */
export interface AppointmentConfirmation {
  id: string;
  serviceName: string;
  requestedStartAt: string;
  durationMinutes: number;
  videoRoomUrl: string | null;
  status: AppointmentStatus;
}
