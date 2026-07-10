import { useState, useLayoutEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAvailableSlots, useBookedSlotsForDate, useBookingsForDate } from "@/hooks/useBookings";
import { bookingStore } from "@/lib/schedule/bookingStore";
import Calendar from "./components/Calendar";
import TimeSlotPicker from "./components/TimeSlotPicker";
import BookingsPanel from "./components/BookingsPanel";

const serviceTypes = [
  "Residential Cleaning",
  "Airbnb / Vacation Rental Turnover",
  "Commercial Cleaning",
  "Move In / Move Out Cleaning",
  "Post-Construction Cleaning",
  "Window Cleaning",
];

const FORM_URL = "https://readdy.ai/api/form/d9824m7k7gok24d49vig";

function getTodayDate(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default function SchedulePage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedDate, setSelectedDate] = useState<Date | null>(getTodayDate);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const availableSlots = useAvailableSlots(selectedDate);
  const dateBookings = useBookingsForDate(selectedDate);
  const bookedSlots = useBookedSlotsForDate(selectedDate);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const honeypot = (formData.get("website_alt") as string || "").trim();
    if (honeypot !== "") {
      setStatus("success");
      form.reset();
      setSelectedDate(getTodayDate());
      setSelectedTime(null);
      return;
    }

    formData.delete("website_alt");

    setStatus("loading");
    setErrorMsg("");

    try {
      const response = await fetch(FORM_URL, {
        method: "POST",
        body: formData,
      });
      const responseText = await response.text();

      let parsed: Record<string, unknown> | null = null;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = null;
      }

      const serverMsg =
        (parsed?.meta as Record<string, string> | undefined)?.message ||
        (parsed?.meta as Record<string, string> | undefined)?.detail ||
        (parsed?.message as string) ||
        responseText;

      const isSuccess =
        response.ok &&
        parsed?.code === "OK" &&
        !serverMsg.toLowerCase().includes("spam") &&
        !serverMsg.toLowerCase().includes("form data is spam");

      if (isSuccess) {
        const date = formatDateForInput(selectedDate);
        const time = selectedTime || "";
        const service = (formData.get("service") as string) || "";
        const name = (formData.get("name") as string) || "";

        bookingStore.addBooking({
          date,
          startTime: time,
          service,
          name,
          email: (formData.get("email") as string) || "",
          phone: (formData.get("phone") as string) || "",
          address: (formData.get("address") as string) || "",
          notes: (formData.get("notes") as string) || "",
        });

        const bookingData = { date, time, service, name };
        form.reset();
        setSelectedDate(getTodayDate());
        setSelectedTime(null);
        setStatus("idle");
        navigate("/booking-confirmation", { state: bookingData });
      } else {
        setStatus("error");
        setErrorMsg(serverMsg || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  const formatDateForInput = (date: Date | null) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date: Date | null) => {
    if (!date) return "Select a date";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <main className="bg-background-50 text-foreground-950 min-h-screen">
      {/* Hero Header */}
      <section className="relative w-full pt-32 pb-12 md:pt-40 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            alt="Clean home interior"
            className="w-full h-full object-cover object-center"
            src="https://readdy.ai/api/search-image?query=Bright%20airy%20clean%20modern%20living%20room%20with%20soft%20natural%20sunlight%20and%20fresh%20flowers%20on%20coffee%20table%2C%20white%20and%20light%20blue%20color%20palette%2C%20minimalist%20interior%20design%2C%20warm%20and%20welcoming%20atmosphere%2C%20editorial%20photography&width=1600&height=600&seq=schedule-hero&orientation=landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
        </div>
        <div className="relative z-10 w-full px-6 lg:px-10 max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
            <span className="text-white text-xs font-medium tracking-widest uppercase">Easy Booking</span>
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
            Book Your <span className="font-light italic">Cleaning</span>
          </h1>
          <p className="text-white/75 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Pick a date and time that works for you. We will confirm your appointment within 24 hours.
          </p>
        </div>
      </section>

      {/* Booking Section */}
      <section className="w-full py-16 md:py-24 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
            {/* Left column — Calendar and available times */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <Calendar
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                }}
              />

              <TimeSlotPicker
                selectedTime={selectedTime}
                onSelectTime={setSelectedTime}
                availableSlots={availableSlots}
                bookedSlots={bookedSlots}
              />
            </div>

            {/* Right column — booking form and scheduled bookings */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="bg-background-100 rounded-xl p-6 md:p-8 border border-background-200/70">
                <h2 className="font-heading font-semibold text-xl text-foreground-950 mb-1">
                  Complete Your Booking
                </h2>
                <p className="text-sm text-foreground-500 mb-6">
                  Fill in your details and we will get back to you within 24 hours.
                </p>

                <form
                  data-readdy-form="d9824m7k7gok24d49vig"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  {/* Hidden fields for date & time */}
                  <input type="hidden" name="date" value={formatDateForInput(selectedDate)} />
                  <input type="hidden" name="time" value={selectedTime || ""} />

                  {/* Service Type */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="service">
                      Service Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    >
                      <option value="">Select a service</option>
                      {serviceTypes.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="name">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="email">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="phone">
                        Phone Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                        placeholder="(769) 926-0646"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="address">
                        Service Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="address"
                        name="address"
                        type="text"
                        required
                        className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                        placeholder="123 Main St, City, State"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="notes">
                      Additional Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 resize-none"
                      placeholder="Tell us about your space, number of rooms, pets, or any special requests..."
                    />
                    <div className="text-xs text-foreground-400 mt-1">Max 500 characters</div>
                  </div>

                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website_alt"
                    className="hp-field"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    readOnly
                  />

                  <button
                    type="submit"
                    disabled={status === "loading" || !selectedDate || !selectedTime}
                    className="w-full px-6 py-3 rounded-md bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {status === "loading" ? "Submitting..." : "Request Appointment"}
                  </button>

                  {(!selectedDate || !selectedTime) && (
                    <p className="text-xs text-foreground-400 text-center">
                      Please select a date and time before submitting.
                    </p>
                  )}

                  {status === "success" && (
                    <div className="p-3 rounded-md bg-accent-100 text-accent-800 text-sm">
                      Thank you! We have received your booking request and will contact you within 24 hours to confirm.
                    </div>
                  )}

                  {status === "error" && errorMsg && (
                    <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                      {errorMsg}
                    </div>
                  )}
                </form>
              </div>

              {selectedDate && (
                <BookingsPanel
                  bookings={dateBookings}
                  dateLabel={formatDisplayDate(selectedDate)}
                />
              )}
            </div>
          </div>

          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-background-100 rounded-xl border border-background-200/70 py-8 md:py-10 px-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                <i className="ri-phone-line text-xl" />
              </div>
              <div>
                <p className="text-xs text-foreground-500 uppercase tracking-wide">Call Us</p>
                <a href="tel:7699260646" className="text-foreground-950 font-medium hover:text-primary-600 transition-colors">
                  (769) 926-0646
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent-100 text-accent-600">
                <i className="ri-mail-line text-xl" />
              </div>
              <div>
                <p className="text-xs text-foreground-500 uppercase tracking-wide">Email Us</p>
                <a href="mailto:booking@allkindsofcleaning.com" className="text-foreground-950 font-medium hover:text-primary-600 transition-colors">
                  booking@allkindsofcleaning.com
                </a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-secondary-100 text-secondary-600">
                <i className="ri-calendar-check-line text-xl" />
              </div>
              <div>
                <p className="text-xs text-foreground-500 uppercase tracking-wide">Availability</p>
                <p className="text-foreground-950 font-medium">Mon - Sat, 8AM - 8PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}