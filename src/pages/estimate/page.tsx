import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  calculateCieQuote,
  cieNeighborhoods,
  createEstimate,
  formatCurrency,
  isFieldThin,
  tierToServiceType,
  type CanonicalProperty,
  type CleaningProfile,
  type EstimatorService,
  type PricingTier,
  type PropertyFacts,
} from "@/lib/cie";
import {
  estimatorServices,
  parseEstimatorService,
  tierLabels,
} from "@/mocks/neighborhoodPricing";

const jobTypes: { id: EstimatorService; label: string }[] = [
  { id: "residential", label: "Recurring / residential" },
  { id: "airbnb", label: "Airbnb turnover" },
  { id: "move-in-out", label: "Move in / move out" },
];

const tierIds: PricingTier[] = ["refresh", "standard", "deep"];

const fieldClass =
  "w-full px-3 py-2.5 rounded-md border border-background-300/60 bg-background-50 text-foreground-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400";
const labelClass = "block text-sm font-medium text-foreground-700 mb-1.5";
const thinRing = "ring-2 ring-accent-400/70 border-accent-400";

function NumberField({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
  thin,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  hint?: string;
  thin?: boolean;
}) {
  const allowDecimal = step % 1 !== 0;
  const format = (n: number) => (Number.isFinite(n) ? String(n) : "");
  const [draft, setDraft] = useState(format(value));
  const focusedRef = useRef(false);

  useEffect(() => {
    if (!focusedRef.current) setDraft(format(value));
  }, [value]);

  const clamp = (n: number) => {
    let next = n;
    if (min != null) next = Math.max(min, next);
    if (max != null) next = Math.min(max, next);
    return next;
  };

  /** Accept Google/Zillow pastes like "2,400", "2,400 sq ft", "2400sqft". */
  const sanitize = (raw: string) => {
    let s = raw.trim().replace(/,/g, "");
    s = allowDecimal ? s.replace(/[^\d.]/g, "") : s.replace(/[^\d]/g, "");
    if (allowDecimal) {
      const dot = s.indexOf(".");
      if (dot !== -1) s = s.slice(0, dot + 1) + s.slice(dot + 1).replace(/\./g, "");
    }
    return s;
  };

  const commit = (raw: string) => {
    const cleaned = sanitize(raw);
    if (cleaned === "" || cleaned === ".") {
      const fallback = clamp(min ?? 0);
      setDraft(String(fallback));
      onChange(fallback);
      return;
    }
    const parsed = Number(cleaned);
    if (!Number.isFinite(parsed)) {
      setDraft(format(value));
      return;
    }
    const next = clamp(parsed);
    setDraft(String(next));
    onChange(next);
  };

  return (
    <div>
      <label className={labelClass} htmlFor={id}>
        {label}
        {thin ? (
          <span className="ml-2 text-[10px] uppercase tracking-wide text-accent-700 font-semibold">
            Confirm
          </span>
        ) : null}
      </label>
      <input
        id={id}
        type="text"
        inputMode={allowDecimal ? "decimal" : "numeric"}
        autoComplete="off"
        value={draft}
        onFocus={() => {
          focusedRef.current = true;
        }}
        onChange={(e) => {
          const raw = sanitize(e.target.value);
          const pattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
          if (raw !== "" && !pattern.test(raw)) return;
          setDraft(raw);
          if (raw === "" || raw === ".") return;
          const parsed = Number(raw);
          if (!Number.isFinite(parsed)) return;
          // Don't clamp while typing — e.g. clearing "2400" to type "1800"
          // would otherwise snap to min as soon as the field is empty/partial.
          if ((min == null || parsed >= min) && (max == null || parsed <= max)) {
            onChange(parsed);
          }
        }}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text");
          if (!text) return;
          e.preventDefault();
          commit(text);
        }}
        onBlur={() => {
          focusedRef.current = false;
          commit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
          }
        }}
        className={`${fieldClass} ${thin ? thinRing : ""}`}
      />
      {hint ? <p className="text-xs text-foreground-400 mt-1">{hint}</p> : null}
    </div>
  );
}

export default function EstimatePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialService = parseEstimatorService(searchParams.get("service"));

  const [address, setAddress] = useState("");
  const [service, setService] = useState<EstimatorService>(initialService);
  const [tier, setTier] = useState<PricingTier>("standard");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canonical, setCanonical] = useState<CanonicalProperty | null>(null);
  const [thinFields, setThinFields] = useState<string[]>([]);
  const [enrichmentNotes, setEnrichmentNotes] = useState<string[]>([]);
  const [neighborhoodId, setNeighborhoodId] = useState("");
  const [neighborhoodName, setNeighborhoodName] = useState("");
  const [sourceParishDisplay, setSourceParishDisplay] = useState("");
  const [explanation, setExplanation] = useState("");
  const [property, setProperty] = useState<PropertyFacts | null>(null);
  const [cleaningProfile, setCleaningProfile] = useState<CleaningProfile>({});
  const [showOverrides, setShowOverrides] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const quote = useMemo(() => {
    if (!property || !neighborhoodId) return null;
    // Local recalc mirrors CIE POST /estimate-labor + POST /estimate-price
    // (same Model Registry pins and service_type mapping).
    return calculateCieQuote({
      neighborhoodId,
      tier,
      service,
      propertyFacts: property,
      cleaningProfile,
      lockProfile: true,
    });
  }, [property, neighborhoodId, tier, service, cleaningProfile]);

  const serviceInfo = estimatorServices[service];
  const sqft = Number(property?.finished_sqft ?? 0);

  const handleServiceChange = (next: EstimatorService) => {
    setService(next);
    setSearchParams({ service: next }, { replace: true });
  };

  const handleLookup = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // Vertical slice via CIE API contract (local adapter until AWS HTTP ships).
      const est = await createEstimate({
        address,
        service_type: tierToServiceType[tier],
      });

      setCanonical(est.property);
      setProperty(est.property_facts);
      setCleaningProfile(est.cleaning_profile);
      setThinFields(est.thin_fields);
      setEnrichmentNotes(est.enrichment_notes);
      const match =
        cieNeighborhoods.find((n) => n.geo_id === est.geo_id) ?? cieNeighborhoods[0];
      setNeighborhoodId(match.id);
      setNeighborhoodName(est.neighborhood_name);
      setSourceParishDisplay(est.parish_display);
      setExplanation(est.explanation);
      setShowOverrides(est.thin_fields.length > 0);
    } catch (err) {
      setCanonical(null);
      setProperty(null);
      setError(err instanceof Error ? err.message : "Could not look up that address.");
    } finally {
      setLoading(false);
    }
  };

  const setProp = <K extends keyof PropertyFacts>(key: K, value: PropertyFacts[K]) => {
    setProperty((prev) => (prev ? { ...prev, [key]: value } : prev));
    setThinFields((prev) => prev.filter((f) => f !== key && !(key === "finished_sqft" && f === "finished_sqft")));
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
            <span className="text-white text-xs font-medium tracking-widest uppercase">
              Cost Estimator
            </span>
          </span>
          <h1 className="font-heading font-bold text-4xl md:text-5xl text-white leading-tight mb-4">
            Get Your <span className="font-light italic text-accent-400">Estimate</span>
          </h1>
          <p className="text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
            Enter an address and get a tailored cleaning estimate for Greater New Orleans and the
            Northshore.
          </p>
        </div>
      </section>

      <section className="w-full py-12 md:py-16 px-6 lg:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          <div className="lg:col-span-7 space-y-6">
            {/* Primary: address */}
            <form
              onSubmit={handleLookup}
              className="bg-background-100 rounded-xl border border-background-200/70 p-6 md:p-8 space-y-5"
            >
              <div>
                <h2 className="font-heading font-semibold text-xl text-foreground-950">
                  Property address
                </h2>
                <p className="text-sm text-foreground-500 mt-1">
                  We&apos;ll look up your property and prepare a quote
                </p>
              </div>

              <div>
                <label className={labelClass} htmlFor="address">
                  Street address
                </label>
                <input
                  id="address"
                  type="text"
                  required
                  autoComplete="street-address"
                  placeholder="e.g. 17228 River Road, Hahnville, LA"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="job-type">
                  Job type
                </label>
                <select
                  id="job-type"
                  value={service}
                  onChange={(e) => handleServiceChange(e.target.value as EstimatorService)}
                  className={fieldClass}
                >
                  {jobTypes.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground-700 mb-2">
                  Cleaning tier
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

              {error ? (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading || !address.trim()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin" />
                    Enriching property…
                  </>
                ) : (
                  <>
                    <i className="ri-search-line" />
                    Get estimate
                  </>
                )}
              </button>
            </form>

            {/* Optional overrides — autopopulated after enrichment */}
            {property && canonical ? (
              <div className="bg-background-100 rounded-xl border border-background-200/70 p-6 md:p-8">
                <button
                  type="button"
                  onClick={() => setShowOverrides((v) => !v)}
                  className="w-full flex items-center justify-between gap-3 text-left"
                >
                  <div>
                    <h2 className="font-heading font-semibold text-xl text-foreground-950">
                      Confirm details
                    </h2>
                    <p className="text-sm text-foreground-500 mt-1">
                      {thinFields.length > 0
                        ? `${thinFields.length} field${thinFields.length === 1 ? "" : "s"} need confirmation — property records were incomplete`
                        : "Filled from your property records — adjust if anything looks off"}
                    </p>
                  </div>
                  <i
                    className={`ri-arrow-${showOverrides ? "up" : "down"}-s-line text-xl text-foreground-400`}
                  />
                </button>

                {enrichmentNotes.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {enrichmentNotes.map((note) => (
                      <li
                        key={note}
                        className="text-sm text-accent-800 bg-accent-50 border border-accent-100 rounded-md px-3 py-2 whitespace-pre-line"
                      >
                        {note}
                      </li>
                    ))}
                  </ul>
                ) : null}

                {showOverrides ? (
                  <div className="mt-6 space-y-5">
                    <p className="text-xs text-foreground-400">
                      {sourceParishDisplay ? (
                        <>
                          Details from{" "}
                          <span className="font-medium text-foreground-600">{sourceParishDisplay}</span>
                          {" · "}
                        </>
                      ) : null}
                      Area: <span className="font-medium text-foreground-600">{neighborhoodName}</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <NumberField
                        id="finished_sqft"
                        label="Living area (sq ft)"
                        value={Number(property.finished_sqft ?? 0)}
                        min={400}
                        max={15000}
                        step={50}
                        thin={isFieldThin(thinFields, "finished_sqft")}
                        onChange={(n) => setProp("finished_sqft", n)}
                        hint="Heated / finished living area"
                      />
                      <NumberField
                        id="bedrooms"
                        label="Bedrooms"
                        value={Number(property.bedrooms ?? 0)}
                        min={0}
                        max={12}
                        thin={isFieldThin(thinFields, "bedrooms")}
                        onChange={(n) => setProp("bedrooms", n)}
                      />
                      <NumberField
                        id="bathrooms"
                        label="Bathrooms"
                        value={Number(property.bathrooms ?? 0)}
                        min={0}
                        max={12}
                        step={0.5}
                        thin={isFieldThin(thinFields, "bathrooms")}
                        onChange={(n) => setProp("bathrooms", n)}
                      />
                      <NumberField
                        id="stories"
                        label="Stories"
                        value={Number(property.stories ?? 1)}
                        min={1}
                        max={5}
                        step={0.5}
                        thin={isFieldThin(thinFields, "stories")}
                        onChange={(n) => setProp("stories", n)}
                      />
                    </div>

                    <p className="text-xs text-foreground-400 leading-relaxed">
                      Final quotes may vary with home condition, add-ons, and frequency.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              <div className="bg-primary-500 rounded-xl p-6 md:p-8 text-white min-h-[280px]">
                {!quote ? (
                  <div className="h-full flex flex-col justify-center text-white/80 py-8">
                    <i className="ri-map-pin-line text-3xl mb-4 text-white/60" />
                    <p className="font-heading font-semibold text-lg text-white mb-2">
                      Your quote appears here
                    </p>
                    <p className="text-sm leading-relaxed">
                      Enter an address and we&apos;ll prepare a neighborhood-aware estimate for your
                      home.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4">
                      <i className={`${serviceInfo.icon} text-xl`} />
                      <span className="text-sm font-medium text-white/80">{serviceInfo.title}</span>
                    </div>
                    <p className="text-white/75 text-sm mb-1 truncate" title={canonical?.address}>
                      {canonical?.address}
                    </p>
                    <p className="text-white/55 text-xs mb-6">
                      {neighborhoodName}
                      {sourceParishDisplay ? ` · ${sourceParishDisplay}` : ""}
                    </p>

                    <p className="text-xs uppercase tracking-widest text-white/60 mb-1">
                      Estimated Quote
                    </p>
                    <p className="font-heading font-bold text-3xl md:text-4xl mb-1">
                      {formatCurrency(quote.price)}
                    </p>
                    <p className="text-sm text-white/75 mb-1">
                      {sqft ? (quote.price / sqft).toFixed(2) : "—"} / sq ft · {sqft.toLocaleString()}{" "}
                      sq ft
                    </p>
                    <p className="text-sm text-white/75 mb-1">{tierLabels[tier]}</p>
                    <p className="text-sm text-white/75 mb-6">
                      {quote.estimated_hours.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}{" "}
                      labor hours
                    </p>

                    <div className="rounded-lg bg-white/10 border border-white/20 p-4 mb-6">
                      <p className="text-xs uppercase tracking-widest text-white/60 mb-2">
                        Local factor
                      </p>
                      <p className="text-sm text-white/90 leading-relaxed">{explanation}</p>
                    </div>

                    <Link
                      to="/schedule"
                      className="block w-full text-center px-6 py-3 rounded-md bg-white text-primary-600 font-medium text-sm hover:bg-white/90 transition-colors"
                    >
                      Book This Service
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
