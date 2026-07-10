import type { Booking } from "@/types/booking";

const START_DATE = new Date(2026, 6, 13);
const END_DATE = new Date(2026, 11, 31);

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateBiweeklyBookings(
  idPrefix: string,
  clientId: string,
  startTime: string,
  endTime: string,
  service: string,
  cleaningLevel: string,
  notes: string,
): Booking[] {
  const bookings: Booking[] = [];
  const current = new Date(START_DATE);

  while (current <= END_DATE) {
    const dateKey = formatDateKey(current);
    bookings.push({
      id: `booking-${idPrefix}-${dateKey}`,
      clientId,
      date: dateKey,
      startTime,
      endTime,
      service,
      cleaningLevel,
      status: "confirmed",
      notes,
      createdAt: "2026-07-01T10:00:00.000Z",
    });

    current.setDate(current.getDate() + 14);
  }

  return bookings;
}

export const seedBookings: Booking[] = [
  ...generateBiweeklyBookings(
    "amy",
    "client-amy",
    "10:00 AM",
    "2:00 PM",
    "Residential Cleaning",
    "Deep Cleaning",
    "Biweekly recurring deep cleaning",
  ),
  ...generateBiweeklyBookings(
    "liam",
    "client-liam",
    "3:00 PM",
    "7:00 PM",
    "Office Cleaning",
    "Deep Cleaning",
    "Biweekly recurring office deep cleaning",
  ),
];

export const SEED_BOOKING_ID_PREFIXES = ["booking-amy-", "booking-liam-"] as const;
