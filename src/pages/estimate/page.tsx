import { useLayoutEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  calculateEstimate,
  estimatorServices,
  formatCurrency,
  neighborhoods,
  parseEstimatorService,
  tierLabels,
  type EstimatorService,
  type PricingTier,
} from "@/mocks/neighborhoodPricing";

const estimatorServiceIds: EstimatorService[] = ["residential", "airbnb", "move-in-out"];
const tierIds: PricingTier[] = ["refresh", "standard", "deep"];

export default function EstimatePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialService = parseEstimatorService(searchParams.get("service"));

  const [service, setService] = useState<EstimatorService>(initialService);
  const [neighborhoodId, setNeighborhoodId] = useState(neighborhoods[0].id);
  const [tier, setTier] = useState<PricingTier>("standard");
  const [sqft, setSqft] = useState(neighborhoods[0].averageSqft);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const neighborhood = useMemo(
    () => neighborhoods.find((n) => n.id === neighborhoodId) ?? neighborhoods[0],
    [neighborhoodId],
  );

  const estimate = useMemo(
    () => calculateEstimate(neighborhood, tier, sqft, service),
    [neighborhood, tier, sqft, service],
  );

  const serviceInfo = estimatorServices[service];

  const handleNeighborhoodChange = (id: string) => {
    setNeighborhoodId(id);
    const next = neighborhoods.find((n) => n.id === id);
    if (next) setSqft(next.averageSqft);
  };

  const handleServiceChange = (next: EstimatorService) => {
    setService(next);
    setSearchParams({ service: next }, { replace: true });
  };

  return (
    <main className="bg-background-50 text-foreground-950 min-h-screen">
      <section className="relative w-full pt-32 pb-12 md:pt-40 md:pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            alt="Bright sunlit modern home interior after professional cleaning"
            className="w-full h-full object-cover object-center"
            src={`${__BASE_PATH__}estimate-hero.jpg`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/30 to-black/45" />
        </div>
        <div className="relative z-10 w-full px-6 lg:px-10 max-w-7xl mx-auto">
          <span className="inline-flex items-center gap-2 bg-white/10 border border-white/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
            <span className="text-white text-xs font-medium tracking-widest uppercase">Cost Estimator</span>
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
            Get Your <span className="font-light italic">Estimate</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
            Neighborhood-based pricing for residential, Airbnb turnover, and move in / move out cleaning
            across Greater New Orleans and the Northshore.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-16 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-background-100 rounded-xl border border-background-200/70 p-6 md:p-8">
              <h2 className="font-heading font-semibold text-xl text-foreground-950 mb-6">
                Build Your Estimate
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-2">
                    Service Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {estimatorServiceIds.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleServiceChange(id)}
                        className={`px-3 py-3 rounded-lg text-left text-sm font-medium border transition-all ${
                          service === id
                            ? "bg-primary-500 border-primary-500 text-white"
                            : "bg-background-50 border-background-200/70 text-foreground-700 hover:border-primary-200"
                        }`}
                      >
                        <i className={`${estimatorServices[id].icon} mr-1.5`} />
                        {id === "move-in-out" ? "Move In/Out" : id === "airbnb" ? "Airbnb" : "Residential"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="neighborhood">
                    Neighborhood
                  </label>
                  <select
                    id="neighborhood"
                    value={neighborhoodId}
                    onChange={(e) => handleNeighborhoodChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  >
                    {neighborhoods.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-1.5" htmlFor="sqft">
                    Square Footage
                  </label>
                  <input
                    id="sqft"
                    type="number"
                    min={500}
                    max={10000}
                    step={50}
                    value={sqft}
                    onChange={(e) => setSqft(Math.max(500, Number(e.target.value) || 500))}
                    className="w-full px-4 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  />
                  <p className="text-xs text-foreground-400 mt-1.5">
                    Defaults to {neighborhood.averageSqft.toLocaleString()} sq ft, the average home size in {neighborhood.name}. Adjust if needed.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground-700 mb-2">
                    Cleaning Tier
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tierIds.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTier(t)}
                        className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                          tier === t
                            ? "bg-primary-500 border-primary-500 text-white"
                            : "bg-background-50 border-background-200/70 text-foreground-600 hover:border-primary-200"
                        }`}
                      >
                        {tierLabels[t]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-background-100 rounded-xl border border-background-200/70 p-6 md:p-8">
              <h3 className="font-heading font-semibold text-lg text-foreground-950 mb-4">
                Neighborhood Rate Guide
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-sm">
                  <thead>
                    <tr className="border-b border-background-200/70">
                      <th className="text-left py-2 pr-4 text-xs font-medium text-foreground-400 uppercase tracking-wide">
                        Tier
                      </th>
                      <th className="text-right py-2 px-2 text-xs font-medium text-foreground-400 uppercase tracking-wide">
                        Per Sq Ft
                      </th>
                      <th className="text-right py-2 pl-2 text-xs font-medium text-foreground-400 uppercase tracking-wide">
                        Avg {neighborhood.averageSqft.toLocaleString()} Sq Ft
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tierIds.map((t) => {
                      const data = neighborhood[t];
                      return (
                        <tr
                          key={t}
                          className={`border-b border-background-200/50 ${tier === t ? "bg-primary-50/60" : ""}`}
                        >
                          <td className="py-3 pr-4 font-medium text-foreground-800">{tierLabels[t]}</td>
                          <td className="py-3 px-2 text-right text-foreground-600">
                            ${data.perSqftMin.toFixed(2)} – ${data.perSqftMax.toFixed(2)}
                          </td>
                          <td className="py-3 pl-2 text-right text-foreground-600">
                            {formatCurrency(Math.round(data.perSqftMin * neighborhood.averageSqft))} – {formatCurrency(Math.round(data.perSqftMax * neighborhood.averageSqft))}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-primary-500 rounded-xl p-6 md:p-8 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <i className={`${serviceInfo.icon} text-xl`} />
                  <span className="text-sm font-medium text-white/80">{serviceInfo.title}</span>
                </div>
                <p className="text-white/75 text-sm mb-6">{serviceInfo.description}</p>

                <p className="text-xs uppercase tracking-widest text-white/60 mb-1">Estimated Range</p>
                <p className="font-heading font-bold text-3xl md:text-4xl mb-1">
                  {formatCurrency(estimate.min)} – {formatCurrency(estimate.max)}
                </p>
                <p className="text-sm text-white/75 mb-6">
                  ${estimate.perSqftMin.toFixed(2)} – ${estimate.perSqftMax.toFixed(2)} per sq ft · {sqft.toLocaleString()} sq ft
                </p>

                <div className="rounded-lg bg-white/10 border border-white/20 p-4 mb-6">
                  <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
                    Local Factor — {neighborhood.name}
                  </p>
                  <p className="text-sm text-white/90 leading-relaxed">{estimate.localFactor}</p>
                </div>

                <Link
                  to="/schedule"
                  className="block w-full text-center px-6 py-3 rounded-md bg-white text-primary-600 font-medium text-sm hover:bg-white/90 transition-colors"
                >
                  Book This Service
                </Link>
              </div>

              <div className="bg-background-100 rounded-xl border border-background-200/70 p-5 text-sm text-foreground-600 leading-relaxed">
                <p className="font-medium text-foreground-800 mb-2">About these estimates</p>
                <p>
                  Rates reflect local market research by neighborhood, including parking access, ceiling height,
                  historic detailing, and travel time. Airbnb and move in / move out services apply modest
                  scope adjustments on top of the base residential rates.
                </p>
                <p className="mt-3">
                  Final quotes may vary based on home condition, add-ons, and frequency. Contact us for a
                  firm quote.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
