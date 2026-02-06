/**
 * Available slot — computed by API, not stored. See docs/DATA_MODEL.md § Slot computation
 */

export interface AvailableSlot {
  startAt: string; // ISO 8601 UTC
  endAt: string;
  staffId?: string; // Optional; omit for "office" slots (any lawyer)
}
