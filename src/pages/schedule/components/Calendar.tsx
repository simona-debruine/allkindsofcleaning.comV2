import { useState, useMemo } from "react";

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  className?: string;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Calendar({ selectedDate, onSelectDate, className = "" }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const prevDays: { day: number; month: "prev" | "current" | "next"; date: Date }[] = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevDays.push({
        day: daysInPrevMonth - i,
        month: "prev",
        date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
      });
    }

    const currentDays: { day: number; month: "prev" | "current" | "next"; date: Date }[] = [];
    for (let i = 1; i <= daysInMonth; i++) {
      currentDays.push({
        day: i,
        month: "current",
        date: new Date(currentYear, currentMonth, i),
      });
    }

    const totalSoFar = prevDays.length + currentDays.length;
    const remaining = 42 - totalSoFar;
    const nextDays: { day: number; month: "prev" | "current" | "next"; date: Date }[] = [];
    for (let i = 1; i <= remaining; i++) {
      nextDays.push({
        day: i,
        month: "next",
        date: new Date(currentYear, currentMonth + 1, i),
      });
    }

    return [...prevDays, ...currentDays, ...nextDays];
  }, [currentMonth, currentYear]);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const isSameDate = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isToday = (date: Date) => isSameDate(date, today);
  const isSelected = (date: Date) => selectedDate ? isSameDate(date, selectedDate) : false;
  const isPast = (date: Date) => date.getTime() < today.getTime();

  return (
    <div className={`bg-background-100 rounded-xl border border-background-200/70 p-4 md:p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background-200/70 text-foreground-600 transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <i className="ri-arrow-left-s-line text-lg" />
        </button>
        <h3 className="font-heading font-semibold text-base text-foreground-950">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-background-200/70 text-foreground-600 transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <i className="ri-arrow-right-s-line text-lg" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-foreground-400 py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5">
        {days.map((item, idx) => {
          const past = isPast(item.date);
          const todayFlag = isToday(item.date);
          const selectedFlag = isSelected(item.date);
          const currentMonthFlag = item.month === "current";

          return (
            <button
              key={idx}
              type="button"
              disabled={past || !currentMonthFlag}
              onClick={() => onSelectDate(item.date)}
              className={`
                aspect-square flex items-center justify-center rounded-md text-sm font-medium transition-all cursor-pointer
                ${selectedFlag
                  ? "bg-primary-500 text-white"
                  : todayFlag && currentMonthFlag
                    ? "bg-accent-100 text-accent-700 border border-accent-300"
                    : currentMonthFlag
                      ? past
                        ? "text-foreground-300 cursor-not-allowed"
                        : "text-foreground-700 hover:bg-background-200/70"
                      : "text-foreground-300 cursor-default"
                }
              `}
            >
              {item.day}
            </button>
          );
        })}
      </div>
    </div>
  );
}