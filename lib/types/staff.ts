/**
 * Staff and availability entities — see docs/DATA_MODEL.md § staff, staff_availability, staff_blocked_dates
 */

import type { StaffRole } from "./enums";

export interface Staff {
  id: string;
  authUserId: string | null;
  name: string;
  email: string;
  telegramChatId: string | null;
  whatsappPhone: string | null;
  role: StaffRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAvailability {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0–6
  startTime: string; // "HH:mm" or ISO time
  endTime: string;
  createdAt: string;
}

export interface StaffBlockedDate {
  id: string;
  staffId: string;
  date: string; // "YYYY-MM-DD"
  reason: string | null;
  createdAt: string;
}
