import { seedBookings, SEED_BOOKING_ID_PREFIXES } from "@/mocks/bookings";
import { clients, getClientById } from "@/mocks/clients";
import type { Booking, BookingRequest, Client } from "@/types/booking";
import { formatDateKey, isSlotBlockedByBooking } from "./timeUtils";
import { TIME_SLOTS } from "./constants";

const STORAGE_KEY = "akoc-bookings";

type Listener = () => void;

function loadPersistedBookings(): Booking[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

function mergeBookings(seed: Booking[], persisted: Booking[]): Booking[] {
  const byId = new Map<string, Booking>();

  for (const booking of seed) {
    byId.set(booking.id, booking);
  }

  for (const booking of persisted) {
    if (booking.id.startsWith("booking-sarah-")) continue;
    const isSeed = SEED_BOOKING_ID_PREFIXES.some((prefix) => booking.id.startsWith(prefix));
    if (!isSeed) {
      byId.set(booking.id, booking);
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}

class BookingStore {
  private bookings: Booking[] = mergeBookings(seedBookings, loadPersistedBookings());
  private listeners = new Set<Listener>();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("storage", this.handleStorageChange);
    }
  }

  private handleStorageChange = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    this.bookings = mergeBookings(seedBookings, loadPersistedBookings());
    this.emit();
  };

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => this.bookings;

  private emit() {
    for (const listener of this.listeners) {
      listener();
    }
  }

  getBookings(): Booking[] {
    return this.bookings;
  }

  getBookingsForDate(date: string): Booking[] {
    return this.bookings.filter((booking) => booking.date === date);
  }

  getBookedSlotsForDate(date: string): string[] {
    const booked = new Set<string>();

    for (const booking of this.getBookingsForDate(date)) {
      for (const slot of TIME_SLOTS) {
        if (isSlotBlockedByBooking(slot, booking.startTime, booking.endTime)) {
          booked.add(slot);
        }
      }
    }

    return Array.from(booked);
  }

  isSlotBooked(date: string, slot: string): boolean {
    return this.getBookingsForDate(date).some((booking) =>
      isSlotBlockedByBooking(slot, booking.startTime, booking.endTime),
    );
  }

  findOrCreateClient(request: BookingRequest): Client {
    const normalizedEmail = request.email.trim().toLowerCase();
    const existing = clients.find(
      (client) => client.email.toLowerCase() === normalizedEmail,
    );

    if (existing) return existing;

    const newClient: Client = {
      id: `client-${Date.now()}`,
      name: request.name.trim(),
      email: request.email.trim(),
      phone: request.phone.trim(),
      address: request.address.trim(),
    };

    clients.push(newClient);
    return newClient;
  }

  addBooking(request: BookingRequest): Booking {
    const client = request.clientId
      ? getClientById(request.clientId) ?? this.findOrCreateClient(request)
      : this.findOrCreateClient(request);

    const endTime = request.endTime ?? request.startTime;
    const booking: Booking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      clientId: client.id,
      date: request.date,
      startTime: request.startTime,
      endTime,
      service: request.service,
      cleaningLevel: request.cleaningLevel,
      status: "pending",
      notes: request.notes,
      createdAt: new Date().toISOString(),
    };

    this.bookings = [...this.bookings, booking].sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.startTime.localeCompare(b.startTime);
    });

    const persisted = loadPersistedBookings().filter((item) => item.id !== booking.id);
    persisted.push(booking);
    persistBookings(persisted);
    this.emit();

    return booking;
  }
}

export const bookingStore = new BookingStore();
