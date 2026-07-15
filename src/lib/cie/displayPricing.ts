/**
 * Marketing $/sqft displays derived from CIE Model Registry pins.
 * Ranges span typical complexity bands (low → medium time multipliers).
 */

import laborModel020 from "./models/labor-model-0.2.0.json";
import pricingModel020 from "./models/pricing-0.2.0.json";
import {
  serviceTierModifiers,
  type EstimatorService,
  type PricingTier,
} from "./quote";

export const marketingTierLabels: Record<PricingTier, string> = {
  refresh: "Refresh",
  standard: "Standard",
  deep: "Deep Clean",
};

const ESTIMATOR_IDS = ["residential", "airbnb", "move-in-out"] as const;

const TIER_TO_SERVICE_TYPE = {
  refresh: "light",
  standard: "standard",
  deep: "deep",
} as const;

const DAY_HOURS = laborModel020.cleaner_day_hours;
const HOURLY_RATE = pricingModel020.hourly_rate;
const MINIMUM_PRICE = pricingModel020.minimum_price;

/** Typical complexity span for brochure ranges (low → medium). */
const COMPLEXITY_MIN = laborModel020.score_bands.low.time_multiplier;
const COMPLEXITY_MAX = laborModel020.score_bands.medium.time_multiplier;

function sqftPerCleanerDay(tier: PricingTier): number {
  const key = TIER_TO_SERVICE_TYPE[tier];
  return laborModel020.service_types[key].sqft_per_cleaner_day;
}

/** Base $/sqft before job-type modifiers: hourly ÷ (sqft/day ÷ day hours). */
export function basePerSqft(tier: PricingTier): number {
  return HOURLY_RATE / (sqftPerCleanerDay(tier) / DAY_HOURS);
}

export function isEstimatorServiceId(id: string): id is EstimatorService {
  return (ESTIMATOR_IDS as readonly string[]).includes(id);
}

export function servicePerSqft(service: EstimatorService, tier: PricingTier): number {
  return basePerSqft(tier) * serviceTierModifiers[service][tier];
}

export function servicePerSqftRange(
  service: EstimatorService,
  tier: PricingTier,
): { min: number; max: number } {
  const base = servicePerSqft(service, tier);
  return {
    min: base * COMPLEXITY_MIN,
    max: base * COMPLEXITY_MAX,
  };
}

export function formatPerSqft(rate: number): string {
  return `$${rate.toFixed(2)}/sqft`;
}

/** e.g. $0.23–0.26/sqft */
export function formatPerSqftRange(min: number, max: number): string {
  const lo = min.toFixed(2);
  const hi = max.toFixed(2);
  if (lo === hi) return `$${lo}/sqft`;
  return `$${lo}–${hi}/sqft`;
}

export function formatServicePerSqftRange(
  service: EstimatorService,
  tier: PricingTier,
): string {
  const { min, max } = servicePerSqftRange(service, tier);
  return formatPerSqftRange(min, max);
}

export type PerSqftMatrix = Record<PricingTier, string>;

/** CIE-derived $/sqft range matrix for estimator services. */
export function getEstimatorPerSqftMatrix(service: EstimatorService): PerSqftMatrix {
  return {
    refresh: formatServicePerSqftRange(service, "refresh"),
    standard: formatServicePerSqftRange(service, "standard"),
    deep: formatServicePerSqftRange(service, "deep"),
  };
}

/**
 * Display cell for services pricing table / cards.
 * Estimator → $/sqft range; window → NOLA pane/window rates; other → custom scope.
 */
export function getDisplayPrice(serviceId: string, tier: PricingTier): string {
  if (isEstimatorServiceId(serviceId)) {
    return formatServicePerSqftRange(serviceId, tier);
  }
  if (serviceId === "window-cleaning") {
    switch (tier) {
      case "refresh":
        return "$10/window";
      case "standard":
        return "$13/window";
      case "deep":
        return "$16/window";
    }
  }
  return "Custom";
}

/** Headline price on service cards (standard tier for estimator services). */
export function getServiceHeadlinePrice(serviceId: string): string {
  if (isEstimatorServiceId(serviceId)) {
    return formatServicePerSqftRange(serviceId, "standard");
  }
  if (serviceId === "window-cleaning") return "$13/window";
  if (serviceId === "post-construction") return "Custom scope";
  if (serviceId === "commercial") return "Custom scope";
  return "Get estimate";
}

export function getServicePriceNote(serviceId: string): string {
  if (isEstimatorServiceId(serviceId)) {
    return `$${MINIMUM_PRICE} minimum · get estimate`;
  }
  if (serviceId === "window-cleaning") {
    return "Interior + exterior · Refresh $10 · Deep $16";
  }
  if (serviceId === "post-construction") return "Scoped to project — get estimate";
  if (serviceId === "commercial") return "Scheduled to your space — get estimate";
  return `$${MINIMUM_PRICE} minimum · get estimate`;
}

export function getPricingTableRow(serviceId: string): PerSqftMatrix | null {
  if (isEstimatorServiceId(serviceId)) {
    return getEstimatorPerSqftMatrix(serviceId);
  }
  if (serviceId === "window-cleaning") {
    return {
      refresh: "$10/window",
      standard: "$13/window",
      deep: "$16/window",
    };
  }
  if (serviceId === "commercial" || serviceId === "post-construction") {
    return { refresh: "Custom", standard: "Custom", deep: "Custom" };
  }
  return null;
}

export const pricingFootnote =
  "Rates shown as $/sqft ranges for typical homes. Your address estimate adjusts for layout and condition; a $120 minimum applies.";
