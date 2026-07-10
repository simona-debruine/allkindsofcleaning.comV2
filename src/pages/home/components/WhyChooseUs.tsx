import { useEffect, useRef, useState } from "react";

const stats = [
  { number: 500, suffix: "+", label: "Happy Clients" },
  { number: 10, suffix: "+", label: "Years Experience" },
  { number: 100, suffix: "%", label: "Satisfaction Rate" },
  { number: 25, suffix: "+", label: "Expert Cleaners" },
];

const features = [
  {
    icon: "ri-shield-check-line",
    title: "Licensed & Insured",
    description: "Full coverage and trained staff give you complete peace of mind every time we enter your property.",
    color: "bg-primary-100 text-primary-600",
  },
  {
    icon: "ri-plant-line",
    title: "Eco-Friendly Products",
    description: "We use non-toxic, biodegradable cleaning solutions that are safe for your family, pets, and the planet.",
    color: "bg-accent-100 text-accent-600",
  },
  {
    icon: "ri-award-line",
    title: "Satisfaction Guaranteed",
    description: "Not happy with something? Let us know within 24 hours and we will return to make it right at no extra cost.",
    color: "bg-secondary-100 text-secondary-600",
  },
  {
    icon: "ri-time-line",
    title: "Flexible Scheduling",
    description: "Morning, evening, or weekend appointments available. We work around your schedule, not the other way around.",
    color: "bg-primary-100 text-primary-600",
  },
];

function useCountUp(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const start = performance.now();
            const animate = (now: number) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.floor(eased * end));
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

function StatItem({ number, suffix, label }: { number: number; suffix: string; label: string }) {
  const { count, ref } = useCountUp(number);
  return (
    <div ref={ref} className="text-center">
      <div className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-primary-600 mb-1">
        {count}{suffix}
      </div>
      <div className="text-foreground-600 text-sm md:text-base font-medium">{label}</div>
    </div>
  );
}

export default function WhyChooseUs() {
  return (
    <section id="about" className="w-full py-16 md:py-24 bg-background-100">
      <div className="w-full px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-16 md:mb-20">
          {stats.map((stat) => (
            <StatItem key={stat.label} number={stat.number} suffix={stat.suffix} label={stat.label} />
          ))}
        </div>

        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-100 text-accent-700 text-xs font-medium tracking-wide uppercase mb-4">
            Why Choose Us
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground-950 tracking-tight mb-4">
            The Clean You Can Count On
          </h2>
          <p className="text-foreground-600 text-base md:text-lg leading-relaxed">
            We do not just clean surfaces. We build trust, one sparkling room at a time.
            Here is what sets All Kinds of Cleaning apart from the rest.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 md:p-7 rounded-xl bg-background-50 border border-background-200/70 hover:shadow-sm transition-all duration-300"
            >
              <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl ${feature.color} mb-5`}>
                <i className={`${feature.icon} text-xl md:text-2xl`} />
              </div>
              <h3 className="font-heading font-semibold text-lg text-foreground-950 mb-2">
                {feature.title}
              </h3>
              <p className="text-foreground-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}