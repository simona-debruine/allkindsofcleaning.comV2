export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role?: string;
}

export interface Booking {
  id: string;
  clientId: string;
  date: string;
  startTime: string;
  endTime: string;
  service: string;
  cleaningLevel?: string;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
}

export interface BookingRequest {
  clientId?: string;
  date: string;
  startTime: string;
  endTime?: string;
  service: string;
  cleaningLevel?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes?: string;
}
