import { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { services } from "@/mocks/services";
import {
  getDisplayPrice,
  getPricingTableRow,
  isEstimatorServiceId,
  marketingTierLabels,
  pricingFootnote,
  tierScopeTasks,
  type PricingTier,
} from "@/lib/cie";

interface ImageCarouselProps {
  images: { url: string; alt: string }[];
  serviceId: string;
}

function ImageCarousel({ images, serviceId }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((prevIdx) => (prevIdx - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, images.length, current]);

  // Preload adjacent slides for snappier arrow navigation
  useEffect(() => {
    if (images.length <= 1) return;
    const adjacent = [
      images[(current + 1) % images.length],
      images[(current - 1 + images.length) % images.length],
    ];
    for (const img of adjacent) {
      const preload = new Image();
      preload.src = img.url;
    }
  }, [current, images]);

  if (images.length === 0) return null;

  const active = images[current];

  return (
    <div className="relative w-full aspect-[16/10] overflow-hidden rounded-t-xl group/carousel">
      <img
        key={`${serviceId}-${current}`}
        alt={active.alt}
        className="absolute inset-0 w-full h-full object-cover"
        src={active.url}
      />
      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-90 md:opacity-0 md:group-hover/carousel:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
          >
            <i className="ri-arrow-left-s-line text-xl" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors opacity-90 md:opacity-0 md:group-hover/carousel:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
          >
            <i className="ri-arrow-right-s-line text-xl" />
          </button>
          {images.length <= 12 ? (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  aria-label={`Show image ${idx + 1}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    idx === current ? "bg-white w-4" : "bg-white/50 hover:bg-white/70"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrent(idx);
                  }}
                  type="button"
                />
              ))}
            </div>
          ) : (
            <span className="absolute bottom-3 right-3 z-10 rounded-md bg-black/45 px-2 py-0.5 text-[10px] font-medium text-white tabular-nums">
              {current + 1} / {images.length}
            </span>
          )}
        </>
      )}
    </div>
  );
}

function getTierTaskBandClass(band: PricingTier): string {
  switch (band) {
    case "refresh":
      return "bg-accent-100 text-accent-950 border-2 border-transparent";
    case "standard":
      return "bg-primary-100 text-primary-950 border-2 border-transparent";
    case "deep":
      return "bg-primary-400 text-primary-950 border-2 border-transparent";
  }
}

function getTierButtonClass(tier: PricingTier, isActive: boolean): string {
  const base =
    "px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border-2";

  if (!isActive) {
    return `${base} bg-background-100 border-background-200/70 text-foreground-600 hover:border-accent-300 hover:text-accent-700`;
  }

  switch (tier) {
    case "refresh":
      return `${base} bg-accent-100 border-accent-300 text-accent-800`;
    case "standard":
      return `${base} bg-primary-100 border-primary-300 text-primary-900`;
    case "deep":
      return `${base} bg-primary-400 border-primary-300 text-primary-900`;
  }
}

const faqs = [
  {
    question: "What areas do you service?",
    answer:
      "We proudly serve the Greater New Orleans region, Northshore, and Mississippi Gulf Coast. From the New Orleans West Bank through southeast Louisiana and the Mississippi Gulf Coast, our professional cleaning team brings spotless results.",
  },
  {
    question: "Do I need to be home during the cleaning?",
    answer:
      "Not at all. Many of our clients provide a key or entry code. Our team is fully background-checked, bonded, and insured for your peace of mind.",
  },
  {
    question: "What cleaning products do you use?",
    answer:
      "We use eco-friendly, non-toxic, biodegradable cleaning solutions that are safe for children, pets, and allergy-sensitive individuals.",
  },
  {
    question: "How do I get a quote?",
    answer:
      "Use our cost estimator with your address, or call us at (769) 926-0646. Estimates adjust for your home; a $120 minimum applies.",
  },
];

export default function ServicesPage() {
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [activeTier, setActiveTier] = useState<PricingTier>("standard");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const tierColumns: { band: PricingTier; tasks: readonly string[] }[] = [
    { band: "refresh", tasks: tierScopeTasks.refresh },
    { band: "standard", tasks: tierScopeTasks.standard },
    { band: "deep", tasks: tierScopeTasks.deep },
  ];

  const includedBands = new Set<PricingTier>(
    activeTier === "refresh"
      ? ["refresh"]
      : activeTier === "standard"
        ? ["refresh", "standard"]
        : ["refresh", "standard", "deep"],
  );

  return (
    <main className="bg-background-50 text-foreground-950 min-h-screen">
      {/* Hero */}
      <section className="relative w-full pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
        <div className="absolute inset-0">
          <img
            alt="Professional cleaning service"
            className="w-full h-full object-cover object-center"
            src="https://readdy.ai/api/search-image?query=Professional%20cleaning%20service%20team%20with%20eco-friendly%20supplies%20in%20a%20bright%20modern%20luxury%20home%20interior%2C%20soft%20warm%20natural%20lighting%2C%20clean%20minimal%20aesthetic%20with%20warm%20neutral%20cream%20and%20white%20tones%2C%20editorial%20photography%20with%20soft%20shadows&width=1600&height=700&seq=services-hero-v2&orientation=landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/30" />
        </div>
        <div className="relative z-10 w-full px-6 lg:px-10 max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
            <span className="text-white text-xs font-medium tracking-widest uppercase">
              Impeccable Standards Delivered
            </span>
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-5">
            Services That{" "}
            <span className="font-light italic text-accent-400">Sparkle</span>
          </h1>
          <p className="text-white/75 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Residential homes, Airbnb/Vacation rentals, personal and commercial
            offices, and move in/move out cleanings — priced by the square foot.
            Choose Refresh, Standard, or Deep Clean.
          </p>
        </div>
      </section>

      {/* Tier Selector */}
      <section className="w-full px-6 lg:px-10 pt-12 md:pt-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            <span className="text-xs font-medium tracking-widest uppercase text-foreground-400 mr-2 hidden sm:inline">
              Choose Your Level
            </span>
            {(Object.keys(marketingTierLabels) as PricingTier[]).map((tier) => (
              <button
                key={tier}
                className={getTierButtonClass(tier, activeTier === tier)}
                onClick={() => setActiveTier(tier)}
                type="button"
              >
                {marketingTierLabels[tier]}
              </button>
            ))}
          </div>
          <div className="mt-6 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {tierColumns.map(({ band, tasks }) => {
              const included = includedBands.has(band);
              return (
                <div
                  key={band}
                  className={`transition-opacity ${included ? "opacity-100" : "opacity-40"}`}
                >
                  <p className="text-xs font-semibold tracking-wide uppercase text-foreground-500 mb-3 text-center">
                    {marketingTierLabels[band]}
                  </p>
                  <ul className="flex flex-col gap-2">
                    {tasks.map((task) => (
                      <li
                        key={task}
                        className={`flex items-center gap-2 text-sm rounded-full px-4 py-2.5 ${getTierTaskBandClass(band)}`}
                      >
                        <i
                          className={`ri-check-line flex-shrink-0 ${
                            band === "refresh"
                              ? "text-accent-600"
                              : band === "standard"
                                ? "text-primary-600"
                                : "text-primary-900"
                          }`}
                        />
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="w-full py-12 md:py-20 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 md:mb-14">
            <span className="text-xs font-medium tracking-widest uppercase text-primary-600 mb-2 block">
              What We Do
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground-950 tracking-tight">
              Services We{" "}
              <span className="italic font-light text-primary-500">Provide</span>
            </h2>
            <p className="text-foreground-600 text-sm md:text-base mt-3 max-w-xl">
              Tailored solutions for every space — choose your service and your
              clean.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {services.map((service) => {
              const tierPrice = getDisplayPrice(service.id, activeTier);
              return (
                <div
                  key={service.id}
                  className="group rounded-xl bg-background-50 border border-background-200/70 overflow-hidden hover:border-primary-200 hover:shadow-sm transition-all duration-300"
                >
                  {/* Tag */}
                  <div className="relative">
                    <ImageCarousel images={service.images} serviceId={service.id} />
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-foreground-800 text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-md">
                      {service.tag}
                    </span>
                    {service.popular && (
                      <span className="absolute top-3 right-3 bg-accent-500 text-white text-[10px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-md">
                        Most Popular
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-2">
                      <i className={`${service.icon} text-primary-500 text-sm`} />
                      <h3 className="font-heading font-semibold text-base md:text-lg text-foreground-950">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-foreground-600 text-sm leading-relaxed mb-4">
                      {service.description}
                    </p>

                    {/* Features */}
                    <ul className="space-y-1.5 mb-5">
                      {service.features.map((feature, fIdx) => (
                        <li
                          key={fIdx}
                          className="flex items-start gap-2 text-sm text-foreground-700"
                        >
                          <i className="ri-check-line text-primary-500 mt-0.5 flex-shrink-0" />
                          <span>{feature.text}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Price & CTA */}
                    <div className="flex items-end justify-between gap-4 pt-4 border-t border-background-200/70">
                      <div>
                        <span className="text-xl font-bold text-foreground-950">
                          {tierPrice}
                        </span>
                        <p className="text-[11px] text-foreground-400 mt-0.5">
                          {service.priceNote}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        {isEstimatorServiceId(service.id) && (
                          <Link
                            to={`/estimate?service=${service.id}`}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-accent-500 text-accent-700 text-xs font-semibold rounded-md hover:bg-accent-50 transition-colors whitespace-nowrap"
                          >
                            Get Estimate
                            <i className="ri-calculator-line" />
                          </Link>
                        )}
                        <Link
                          to="/schedule"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary-500 text-white text-xs font-semibold rounded-md hover:bg-primary-600 transition-colors whitespace-nowrap"
                        >
                          Book Now
                          <i className="ri-arrow-right-line" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section className="w-full py-16 md:py-24 bg-background-100 px-6 lg:px-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-widest uppercase text-accent-600 mb-2 block">
              Transparent Pricing
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground-950 tracking-tight">
              Simple, Honest{" "}
              <span className="italic font-light text-accent-500">Pricing</span>
            </h2>
            <p className="text-foreground-600 text-sm md:text-base mt-3 max-w-lg mx-auto">
              {pricingFootnote}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-background-200/70">
                  <th className="text-left py-3 px-4 text-xs font-medium text-foreground-400 uppercase tracking-wide">
                    Service Type
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-foreground-400 uppercase tracking-wide">
                    Refresh
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-foreground-400 uppercase tracking-wide">
                    Standard
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-foreground-400 uppercase tracking-wide">
                    Deep Clean
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  "residential",
                  "airbnb",
                  "move-in-out",
                  "commercial",
                  "post-construction",
                  "window-cleaning",
                ].map((serviceId) => {
                  const service = services.find((s) => s.id === serviceId);
                  if (!service) return null;
                  const prices = getPricingTableRow(service.id);
                  if (!prices) return null;
                  return (
                    <tr
                      key={service.id}
                      className="border-b border-background-200/40 hover:bg-background-50/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <i className={`${service.icon} text-primary-500 text-sm`} />
                          <span className="text-sm font-medium text-foreground-950">
                            {service.title.split(" /")[0].replace(" Cleaning", "").replace(" Turnover", "")}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-foreground-700">
                        {prices.refresh}
                      </td>
                      <td className="py-4 px-4 text-center text-sm font-semibold text-foreground-950">
                        {prices.standard}
                      </td>
                      <td className="py-4 px-4 text-center text-sm text-foreground-700">
                        {prices.deep}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Link
              to="/estimate"
              className="inline-flex items-center gap-1.5 px-6 py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors"
            >
              Get Your Estimate
              <i className="ri-calculator-line" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="w-full py-16 md:py-24 px-6 lg:px-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-medium tracking-widest uppercase text-accent-600 mb-2 block">
              Got Questions?
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground-950 tracking-tight">
              Frequently Asked{" "}
              <span className="italic font-light text-accent-500">Questions</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-background-50 border border-background-200/70 overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-left"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  type="button"
                >
                  <h3 className="font-heading font-semibold text-sm md:text-base text-foreground-950">
                    {faq.question}
                  </h3>
                  <i
                    className={`ri-add-line text-primary-500 text-lg flex-shrink-0 transition-transform ${
                      openFaq === idx ? "rotate-45" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 md:px-6 pb-5 md:pb-6">
                    <p className="text-foreground-600 text-sm leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative w-full py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            alt="Clean modern interior"
            className="w-full h-full object-cover object-center"
            src="https://readdy.ai/api/search-image?query=Bright%20sparkling%20clean%20modern%20kitchen%20and%20living%20room%20interior%20with%20natural%20sunlight%20streaming%20through%20large%20windows%2C%20fresh%20white%20and%20warm%20cream%20tones%2C%20minimalist%20clean%20aesthetic%2C%20editorial%20interior%20photography%20with%20soft%20warm%20lighting&width=1600&height=600&seq=services-cta-v2&orientation=landscape"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/20" />
        </div>
        <div className="relative z-10 w-full px-6 lg:px-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white leading-tight mb-3">
              Ready to Get Started?
            </h2>
            <p className="text-white/75 text-base max-w-md">
              Book your cleaning today and enjoy a spotless space tomorrow. Free
              quotes, no obligation.
            </p>
          </div>
          <Link
            to="/schedule"
            className="inline-flex items-stretch bg-white rounded-full overflow-hidden hover:shadow-lg transition-all group"
          >
            <span className="px-6 py-3.5 text-sm font-semibold text-foreground-950 whitespace-nowrap flex items-center">
              Book a Cleaning
            </span>
            <span className="w-[3.25rem] bg-primary-500 flex items-center justify-center group-hover:bg-primary-600 transition-colors">
              <i className="ri-arrow-right-up-line text-white text-base" />
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}