import { processSteps } from "@/mocks/processSteps";

export default function ProcessSection() {
  return (
    <section id="process" className="w-full py-16 md:py-24 bg-background-50">
      <div className="w-full px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-secondary-100 text-secondary-700 text-xs font-medium tracking-wide uppercase mb-4">
            How It Works
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground-950 tracking-tight mb-4">
            Three Steps to a Spotless Space
          </h2>
          <p className="text-foreground-600 text-base md:text-lg leading-relaxed">
            Getting your home or office professionally cleaned has never been easier.
            Our streamlined process takes the hassle out of maintaining a pristine environment.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[16.67%] right-[16.67%] h-px bg-background-300/60" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10">
            {processSteps.map((step, index) => (
              <div key={step.id} className="relative text-center">
                {/* Step number badge */}
                <div className="relative z-10 w-14 h-14 md:w-16 md:h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-primary-500 text-white font-heading font-bold text-lg md:text-xl shadow-sm">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                  <i className={`${step.icon} text-xl`} />
                </div>

                <h3 className="font-heading font-semibold text-xl md:text-2xl text-foreground-950 mb-3">
                  {step.title}
                </h3>
                <p className="text-foreground-600 text-sm md:text-base leading-relaxed max-w-sm mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}