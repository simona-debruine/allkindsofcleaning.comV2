import { Link } from "react-router-dom";
import { services } from "@/mocks/services";

export default function ServicesSection() {
  return (
    <section id="services" className="w-full py-16 md:py-24 bg-background-50">
      <div className="w-full px-6 lg:px-10 max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-medium tracking-wide uppercase mb-4">
            What We Do
          </span>
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-foreground-950 tracking-tight mb-4">
            Cleaning Services for Every Space
          </h2>
          <p className="text-foreground-600 text-base md:text-lg leading-relaxed mb-6">
            From cozy homes to vacation rentals and corporate offices, we bring
            the same level of dedication and attention to detail to every
            cleaning job we take on.
          </p>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            View all services
            <i className="ri-arrow-right-line" />
          </Link>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="group rounded-xl bg-background-100 border border-background-200/70 overflow-hidden hover:border-primary-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="relative w-full aspect-[16/10] overflow-hidden">
                <img
                  alt={service.images[0].alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={service.images[0].url}
                />
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-foreground-800 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-md">
                  {service.tag}
                </span>
              </div>
              <div className="p-5 md:p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary-100 text-primary-600 group-hover:bg-primary-500 group-hover:text-white transition-colors duration-300">
                    <i className={`${service.icon} text-sm`} />
                  </div>
                  <h3 className="font-heading font-semibold text-base md:text-lg text-foreground-950">
                    {service.title}
                  </h3>
                </div>
                <p className="text-foreground-600 text-sm leading-relaxed mb-4">
                  {service.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground-950">
                    {service.price}
                  </span>
                  <span className="text-[11px] text-foreground-400">
                    {service.priceNote}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}