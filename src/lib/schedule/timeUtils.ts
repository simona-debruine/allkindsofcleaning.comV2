import { TIME_SLOTS } from "./constants";

function parseTimeToMinutes(time: string): number {
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isSlotWithinRange(
  slot: string,
  startTime: string,
  endTime: string,
): boolean {
  const slotMinutes = parseTimeToMinutes(slot);
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (slotMinutes < 0 || startMinutes < 0 || endMinutes < 0) return false;
  return slotMinutes >= startMinutes && slotMinutes < endMinutes;
}

/** Blocks the booking window plus 1 hour before start for travel time. */
export function isSlotBlockedByBooking(
  slot: string,
  startTime: string,
  endTime: string,
): boolean {
  const slotMinutes = parseTimeToMinutes(slot);
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (slotMinutes < 0 || startMinutes < 0 || endMinutes < 0) return false;

  const travelStartMinutes = startMinutes - 60;
  return slotMinutes >= travelStartMinutes && slotMinutes < endMinutes;
}

export function getSlotsInRange(startTime: string, endTime: string): string[] {
  return TIME_SLOTS.filter((slot) => isSlotWithinRange(slot, startTime, endTime));
}

export function getNextSlot(time: string): string | undefined {
  const index = TIME_SLOTS.indexOf(time as (typeof TIME_SLOTS)[number]);
  if (index === -1 || index === TIME_SLOTS.length - 1) return undefined;
  return TIME_SLOTS[index + 1];
}
