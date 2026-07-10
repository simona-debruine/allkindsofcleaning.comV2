interface TimeSlotPickerProps {
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  availableSlots: string[];
}

export default function TimeSlotPicker({
  selectedTime,
  onSelectTime,
  availableSlots,
}: TimeSlotPickerProps) {
  return (
    <div className="bg-background-100 rounded-xl border border-background-200/70 p-4 md:p-5">
      <h3 className="font-heading font-semibold text-base text-foreground-950 mb-4">
        Available Times
      </h3>

      {availableSlots.length === 0 ? (
        <p className="text-sm text-foreground-400 italic">
          Select a date to see available time slots.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableSlots.map((slot) => {
            const isSelected = selectedTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onSelectTime(slot)}
                className={`
                  px-3 py-2 rounded-md text-sm font-medium transition-all cursor-pointer
                  ${isSelected
                    ? "bg-primary-500 text-white"
                    : "bg-background-50 border border-background-300/60 text-foreground-700 hover:border-primary-300 hover:text-primary-600"
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