import { useSyncExternalStore } from "react";
import { bookingStore } from "@/lib/schedule/bookingStore";
import { TIME_SLOTS } from "@/lib/schedule/constants";
import { formatDateKey, isSlotBlockedByBooking } from "@/lib/schedule/timeUtils";
import { getClientById } from "@/mocks/clients";
import type { Booking } from "@/types/booking";

export function useBookings() {
  const bookings = useSyncExternalStore(
    bookingStore.subscribe,
    bookingStore.getSnapshot,
    bookingStore.getSnapshot,
  );

  return bookings;
}

export function useBookingsForDate(date: Date | null) {
  const bookings = useBookings();
  if (!date) return [];

  const dateKey = formatDateKey(date);
  return bookings.filter((booking) => booking.date === dateKey);
}

export function useBookedSlotsForDate(date: Date | null): string[] {
  const bookings = useBookingsForDate(date);
  if (!date) return [];

  return TIME_SLOTS.filter((slot) =>
    bookings.some((booking) =>
      isSlotBlockedByBooking(slot, booking.startTime, booking.endTime),
    ),
  );
}

export function useAvailableSlots(date: Date | null) {
  const bookedSlots = useBookedSlotsForDate(date);
  if (!date) return [];

  return TIME_SLOTS.filter((slot) => !bookedSlots.includes(slot));
}

export function getBookingClientFirstName(booking: Booking): string {
  const fullName = getClientById(booking.clientId)?.name ?? "Unknown";
  return fullName.split(" ")[0];
}

export function getBookingClientName(booking: Booking): string {
  return getClientById(booking.clientId)?.name ?? "Unknown client";
}
