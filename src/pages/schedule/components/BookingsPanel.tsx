import type { Booking } from "@/types/booking";
import { getBookingClientFirstName } from "@/hooks/useBookings";

interface BookingsPanelProps {
  bookings: Booking[];
  dateLabel: string;
  className?: string;
}

const statusStyles: Record<Booking["status"], string> = {
  confirmed: "bg-accent-100 text-accent-700",
  pending: "bg-secondary-100 text-secondary-700",
  cancelled: "bg-background-200 text-foreground-400",
  completed: "bg-primary-100 text-primary-700",
};

export default function BookingsPanel({ bookings, dateLabel, className = "" }: BookingsPanelProps) {
  return (
    <div className={`bg-background-100 rounded-xl border border-background-200/70 p-4 md:p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading font-semibold text-base text-foreground-950">
          Scheduled Bookings
        </h3>
        <span className="inline-flex items-center gap-1.5 text-xs text-foreground-500">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
          Live
        </span>
      </div>

      {!bookings.length ? (
        <p className="text-sm text-foreground-400 italic">
          No bookings on {dateLabel}. All time slots are open.
        </p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="rounded-lg border border-background-200/70 bg-background-50 p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground-950">
                    {getBookingClientFirstName(booking)}
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    {booking.service}
                  </p>
                  {booking.cleaningLevel && (
                    <p className="text-xs text-foreground-500 mt-0.5">
                      {booking.cleaningLevel}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
