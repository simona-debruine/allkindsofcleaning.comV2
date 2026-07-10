import { useState, type FormEvent } from "react";

const serviceTypes = [
  "Residential Cleaning",
  "Airbnb / Vacation Rental Turnover",
  "Commercial Cleaning",
  "Move In / Move Out Cleaning",
  "Post-Construction Cleaning",
  "Window Cleaning",
];

const FORM_URL = "https://readdy.ai/api/form/d97vcu2g3iubr452i8kg";

export default function ContactCTA() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Honeypot check
    const honeypot = (formData.get("phone_alt") as string || "").trim();
    if (honeypot !== "") {
      setStatus("success");
      form.reset();
      return;
    }

    // Remove honeypot from payload
    formData.delete("phone_alt");

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
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setErrorMsg(serverMsg || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please check your connection and try again.");
    }
  };

  return (
    <section id="contact" className="w-full py-16 md:py-24 bg-primary-500">
      <div className="w-full px-6 lg:px-10 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Left side - CTA text */}
          <div className="text-white">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium tracking-wide uppercase mb-4">
              Get Started
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl tracking-tight mb-4">
              Ready for a Spotless Space?
            </h2>
            <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8">
              Tell us what you need and we will get back to you within 24 hours
              with a free, no-obligation quote. Your clean space is just one message away.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/15">
                  <i className="ri-phone-line text-white text-lg" />
                </div>
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wide">Phone</div>
                  <a href="tel:7699260646" className="text-white font-medium hover:underline">(769) 926-0646</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/15">
                  <i className="ri-mail-line text-white text-lg" />
                </div>
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wide">Email</div>
                  <a href="mailto:booking@allkindsofcleaning.com" className="text-white font-medium hover:underline">booking@allkindsofcleaning.com</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/15">
                  <i className="ri-map-pin-line text-white text-lg" />
                </div>
                <div>
                  <div className="text-white/60 text-xs uppercase tracking-wide">Service Area</div>
                  <div className="text-white font-medium">Greater Metropolitan Area</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="bg-background-50 rounded-xl p-6 md:p-8 shadow-lg">
            <h3 className="font-heading font-semibold text-xl text-foreground-950 mb-6">
              Request a Free Quote
            </h3>

            <form
              data-readdy-form="d97vcu2g3iubr452i8kg"
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="name">
                    Full Name
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
                    Email Address
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="service">
                    Service Type
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
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="message">
                  Message (optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 resize-none"
                  placeholder="Tell us about your space and any specific needs..."
                />
                <div className="text-xs text-foreground-400 mt-1">Max 500 characters</div>
              </div>

              {/* Honeypot */}
              <input
                type="text"
                name="phone_alt"
                className="hp-field"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                readOnly
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full px-6 py-3 rounded-md bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {status === "loading" ? "Sending..." : "Request My Quote"}
              </button>

              {status === "success" && (
                <div className="p-3 rounded-md bg-accent-100 text-accent-800 text-sm">
                  Thank you! We have received your request and will contact you within 24 hours.
                </div>
              )}

              {status === "error" && errorMsg && (
                <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}