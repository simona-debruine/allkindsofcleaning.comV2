import { testimonials } from "@/mocks/testimonials";

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="w-full py-16 md:py-24 bg-background-100">
      <div className="w-full px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium tracking-wide uppercase mb-4">
            Testimonials
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground-950 tracking-tight mb-4">
            Loved by Homeowners &amp; Businesses
          </h2>
          <p className="text-foreground-600 text-base md:text-lg leading-relaxed">
            Do not just take our word for it. Here is what our clients say about
            their experience with All Kinds of Cleaning.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {testimonials.map((t) => (
            <div
              key={t.id}
              className="p-6 md:p-7 rounded-xl bg-background-50 border border-background-200/70 hover:shadow-sm transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i
                    key={i}
                    className={i < t.rating ? "ri-star-fill text-accent-500 text-sm" : "ri-star-line text-accent-500 text-sm"}
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-foreground-700 text-sm md:text-base leading-relaxed mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center font-heading font-semibold text-sm ${t.color}`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-heading font-semibold text-sm md:text-base text-foreground-950">
                    {t.name}
                  </div>
                  <div className="text-foreground-500 text-xs md:text-sm">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}