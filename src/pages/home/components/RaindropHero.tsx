import { lazy, Suspense, useEffect, useState } from "react";

const RaindropCanvas = lazy(() => import("./RaindropCanvas"));

const BG_IMAGE =
  "https://readdy.ai/api/search-image?query=Bright%20modern%20luxury%20living%20room%20interior%20panoramic%20wide%20view%20with%20floor%20to%20ceiling%20windows%20natural%20sunlight%20streaming%20in%20sparkling%20clean%20white%20surfaces%20polished%20floors%20minimal%20contemporary%20furniture%20green%20plants%20pristine%20atmosphere%20editorial%20interior%20photography%20clean%20bright%20airy&width=2400&height=1000&seq=hero-clean-home-panorama-v1&orientation=landscape";

export default function RaindropHero() {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const inClass = entered ? "in" : "";

  return (
    <section className="relative w-full h-screen min-h-[640px] overflow-hidden bg-black">
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black" />
        }
      >
        <RaindropCanvas
          backgroundUrl={BG_IMAGE}
          className="absolute inset-0 w-full h-full block touch-none"
        />
      </Suspense>

      {/* dark overlay for text readability */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />

      {/* hero content */}
      <div className="pointer-events-none relative z-10 flex flex-col items-center justify-center text-center h-full px-6 text-white">
        <span
          className={`reveal delay-1 ${inClass} inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-md text-xs tracking-wider uppercase mb-6 whitespace-nowrap`}
        >
          <i className="ri-sparkling-line" />
          Professional Cleaning Services
        </span>

        <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight max-w-4xl">
          <span className={`reveal delay-2 ${inClass} block`}>See the World</span>
          <span className={`reveal delay-3 ${inClass} block italic font-light text-white/90`}>
            Through Clean Glass.
          </span>
        </h1>

        <p
          className={`reveal delay-4 ${inClass} mt-6 max-w-2xl text-base md:text-lg text-white/80 leading-relaxed`}
        >
          All Kinds of Cleaning delivers spotless residential and commercial spaces
          with eco-friendly products and trained professionals. Drag your cursor across
          the screen to wipe the glass clean and see the difference.
        </p>

        <div className={`reveal delay-5 ${inClass} mt-8 flex flex-col sm:flex-row gap-4 pointer-events-auto`}>
          <a
            href="#contact"
            className="px-7 py-3.5 rounded-md bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors whitespace-nowrap"
          >
            Get a Free Quote
          </a>
          <a
            href="#services"
            className="px-7 py-3.5 rounded-md border border-white/30 text-white font-medium text-sm hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Our Services
          </a>
        </div>
      </div>

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          filter: blur(22px);
          transition:
            opacity 1400ms cubic-bezier(0.22, 1, 0.36, 1),
            transform 1400ms cubic-bezier(0.22, 1, 0.36, 1),
            filter 1600ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: opacity, transform, filter;
        }
        .reveal.in { opacity: 1; transform: translateY(0); filter: blur(0); }

        .delay-1 { transition-delay: 100ms; }
        .delay-2 { transition-delay: 350ms; }
        .delay-3 { transition-delay: 650ms; }
        .delay-4 { transition-delay: 950ms; }
        .delay-5 { transition-delay: 1250ms; }
      `}</style>
    </section>
  );
}