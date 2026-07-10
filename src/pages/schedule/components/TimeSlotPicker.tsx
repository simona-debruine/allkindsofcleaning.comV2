import { TIME_SLOTS } from "@/lib/schedule/constants";

interface TimeSlotPickerProps {
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  availableSlots: string[];
  bookedSlots?: string[];
}

export default function TimeSlotPicker({
  selectedTime,
  onSelectTime,
  availableSlots,
  bookedSlots = [],
}: TimeSlotPickerProps) {
  const hasDateSelected = availableSlots.length > 0 || bookedSlots.length > 0;

  return (
    <div className="bg-background-100 rounded-xl border border-background-200/70 p-4 md:p-5">
      <h3 className="font-heading font-semibold text-base text-foreground-950 mb-4">
        Available Times
      </h3>

      {!hasDateSelected ? (
        <p className="text-sm text-foreground-400 italic">
          Select a date to see available time slots.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {TIME_SLOTS.map((slot) => {
            const isBooked = bookedSlots.includes(slot);
            const isAvailable = availableSlots.includes(slot);
            const isSelected = selectedTime === slot;

            if (!isAvailable && !isBooked) return null;

            return (
              <button
                key={slot}
                type="button"
                disabled={isBooked}
                onClick={() => onSelectTime(slot)}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-all
                  ${isBooked
                    ? "bg-background-200 text-foreground-400 border border-background-300/40 cursor-not-allowed line-through"
                    : isSelected
                      ? "bg-primary-500 text-white cursor-pointer"
                      : "bg-background-50 border border-background-300/60 text-foreground-700 hover:border-primary-300 hover:text-primary-600 cursor-pointer"
                  }
                `}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
