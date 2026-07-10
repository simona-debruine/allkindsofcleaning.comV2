import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

interface BookingDetails {
  date: string;
  time: string;
  service: string;
  name: string;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function BookingConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const state = location.state as BookingDetails | undefined;
    if (state && state.date && state.time) {
      setBooking(state);
    }
    // Trigger entrance animation
    const timer = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(timer);
  }, [location.state]);

  // If no booking data, redirect to schedule
  useEffect(() => {
    if (!booking && !location.state) {
      const timer = setTimeout(() => {
        navigate("/schedule", { replace: true });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [booking, location.state, navigate]);

  return (
    <main className="bg-background-50 text-foreground-950 min-h-screen">
      <Navbar />

      {/* Hero — celebratory gradient banner */}
      <section className="relative w-full pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            alt="Clean bright interior space"
            className="w-full h-full object-cover object-center"
            src="https://readdy.ai/api/search-image?query=Bright%20sunlit%20spacious%20living%20room%20with%20fresh%20white%20linens%20and%20green%20plants%2C%20soft%20morning%20light%20streaming%20through%20large%20windows%2C%20warm%20beige%20and%20cream%20interior%20design%2C%20peaceful%20serene%20atmosphere%2C%20editorial%20home%20photography%20with%20soft%20focus%20background&width=1600&height=600&seq=thankyou-hero&orientation=landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/40" />
        </div>

        <div className="relative z-10 w-full px-6 lg:px-10 max-w-3xl mx-auto text-center">
          {/* Animated checkmark */}
          <div
            className={`mx-auto mb-8 w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent-500/20 border-2 border-accent-400 flex items-center justify-center transition-all duration-700 ${
              fadeIn ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <div className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-accent-500 text-white">
              <i className="ri-check-line text-2xl md:text-3xl" />
            </div>
          </div>

          <h1
            className={`font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-4 transition-all duration-700 delay-100 ${
              fadeIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            Booking Confirmed!
          </h1>
          <p
            className={`text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
              fadeIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            {booking
              ? `Thanks, ${booking.name}! We have received your cleaning appointment request.`
              : "Your booking request has been received."}
          </p>
        </div>
      </section>

      {/* Booking details card */}
      <section className="w-full px-6 lg:px-10 -mt-10 relative z-20">
        <div className="max-w-2xl mx-auto">
          <div
            className={`bg-background-50 rounded-xl border border-background-200/70 p-6 md:p-8 shadow-sm transition-all duration-700 delay-300 ${
              fadeIn ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
            }`}
          >
            {booking ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent-100 text-accent-600">
                    <i className="ri-calendar-check-line text-lg" />
                  </div>
                  <h2 className="font-heading font-semibold text-lg text-foreground-950">
                    Your Booking Summary
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-4 rounded-lg bg-background-100">
                    <span className="text-sm text-foreground-500 font-medium">Service</span>
                    <span className="text-sm font-semibold text-foreground-950">{booking.service || "Not specified"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-4 rounded-lg bg-background-100">
                    <span className="text-sm text-foreground-500 font-medium">Date</span>
                    <span className="text-sm font-semibold text-foreground-950">{formatDisplayDate(booking.date)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-4 rounded-lg bg-background-100">
                    <span className="text-sm text-foreground-500 font-medium">Time</span>
                    <span className="text-sm font-semibold text-foreground-950">{booking.time}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-10 h-10 mx-auto mb-4 flex items-center justify-center rounded-full bg-accent-100 text-accent-600">
                  <i className="ri-loader-4-line text-lg animate-spin" />
                </div>
                <p className="text-sm text-foreground-500">
                  Redirecting to booking page...
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What happens next */}
      <section className="w-full py-16 md:py-24 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div
            className={`text-center mb-12 transition-all duration-700 delay-400 ${
              fadeIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <span className="inline-flex items-center gap-2 bg-secondary-100 border border-secondary-200/60 rounded-full px-4 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-500" />
              <span className="text-secondary-800 text-xs font-medium tracking-widest uppercase">Next Steps</span>
            </span>
            <h2 className="font-heading font-bold text-2xl md:text-3xl text-foreground-950 mb-4">
              What Happens Next?
            </h2>
            <p className="text-foreground-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
              Here's what to expect after submitting your booking request.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {[
              {
                step: "01",
                icon: "ri-mail-check-line",
                title: "Confirmation Email",
                description:
                  "You'll receive an email within a few minutes confirming we received your booking request. Check your spam folder if you don't see it.",
                color: "bg-primary-100 text-primary-600",
              },
              {
                step: "02",
                icon: "ri-phone-line",
                title: "We'll Reach Out Within 24 Hours",
                description:
                  "Our team will review your request and contact you via phone or email to confirm availability, discuss your specific needs, and provide a final quote.",
                color: "bg-accent-100 text-accent-600",
              },
              {
                step: "03",
                icon: "ri-sparkling-line",
                title: "Cleaning Day",
                description:
                  "Our professional cleaners arrive on time, fully equipped with eco-friendly products. Sit back, relax, and enjoy your freshly cleaned space!",
                color: "bg-secondary-100 text-secondary-600",
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className={`flex items-start gap-4 md:gap-5 p-5 md:p-6 rounded-xl bg-background-100 border border-background-200/70 transition-all duration-700 ${
                  fadeIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: `${500 + i * 150}ms` }}
              >
                <div className={`w-10 h-10 md:w-12 md:h-12 flex-shrink-0 flex items-center justify-center rounded-xl ${item.color}`}>
                  <i className={`${item.icon} text-lg md:text-xl`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-foreground-400 tracking-widest">{item.step}</span>
                    <h3 className="font-heading font-semibold text-sm md:text-base text-foreground-950">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-xs md:text-sm text-foreground-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 transition-all duration-700 delay-800 ${
              fadeIn ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors whitespace-nowrap text-center"
            >
              Back to Home
            </Link>
            <Link
              to="/services"
              className="w-full sm:w-auto px-6 py-3 rounded-md border border-background-300/60 bg-background-50 text-foreground-700 text-sm font-medium hover:bg-background-100 transition-colors whitespace-nowrap text-center"
            >
              Explore Services
            </Link>
            <Link
              to="/schedule"
              className="w-full sm:w-auto px-6 py-3 rounded-md border border-background-300/60 bg-background-50 text-foreground-700 text-sm font-medium hover:bg-background-100 transition-colors whitespace-nowrap text-center"
            >
              Book Another
            </Link>
          </div>
        </div>
      </section>

      {/* Contact reassurance bar */}
      <section className="w-full bg-background-100 border-t border-background-200/70 py-12 md:py-16 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-heading font-semibold text-lg text-foreground-950 mb-2">
            Have Questions?
          </h3>
          <p className="text-sm text-foreground-500 mb-6">
            We're here to help. Reach out anytime before your appointment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:7699260646"
              className="flex items-center gap-2 text-sm font-medium text-foreground-700 hover:text-primary-600 transition-colors"
            >
              <i className="ri-phone-line" />
              (769) 926-0646
            </a>
            <span className="hidden sm:inline text-foreground-300">|</span>
            <a
              href="mailto:booking@allkindsofcleaning.com"
              className="flex items-center gap-2 text-sm font-medium text-foreground-700 hover:text-primary-600 transition-colors"
            >
              <i className="ri-mail-line" />
              booking@allkindsofcleaning.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}