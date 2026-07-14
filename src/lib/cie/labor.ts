/**
 * TypeScript port of cleaning-intelligence-engine/engine/labor.py (Architecture v1.0).
 * Labor Units depend only on property facts + cleaning profile + labor-model version
 * (+ service type for 0.2+).
 */

import laborModel010 from "./models/labor-model-0.1.0.json";
import laborModel020 from "./models/labor-model-0.2.0.json";
import crewProductivity010 from "./models/crew-productivity-0.1.0.json";
import crewProductivity020 from "./models/crew-productivity-0.2.0.json";
import pricingModel010 from "./models/pricing-0.1.0.json";
import pricingModel020 from "./models/pricing-0.2.0.json";
import type {
  CleaningProfile,
  ComplexityVector,
  HoursEstimate,
  LaborEstimate,
  PriceEstimate,
  PropertyFacts,
} from "./types";

/** CIE labor intensity — maps from site tiers refresh/standard/deep. */
export type ServiceType = "deep" | "standard" | "light";

type LaborModelJson = typeof laborModel010 | typeof laborModel020;
type CrewJson = typeof crewProductivity010 | typeof crewProductivity020;
type PricingJson = typeof pricingModel010 | typeof pricingModel020;

const MODELS = {
  "labor-model": {
    "0.1.0": laborModel010 as LaborModelJson,
    "0.2.0": laborModel020 as LaborModelJson,
  },
  "crew-productivity": {
    "0.1.0": crewProductivity010 as CrewJson,
    "0.2.0": crewProductivity020 as CrewJson,
  },
  pricing: {
    "0.1.0": pricingModel010 as PricingJson,
    "0.2.0": pricingModel020 as PricingJson,
  },
} as const;

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function inferComplexity(
  propertyFacts: PropertyFacts,
  cleaningProfile: CleaningProfile,
): ComplexityVector {
  const year = propertyFacts.year_built ?? 1980;
  const sqft = Number(propertyFacts.finished_sqft ?? propertyFacts.parcel_sqft ?? 1500);
  const stories = Number(propertyFacts.stories ?? 1);
  const historicTrim = Number(cleaningProfile.historic_trim ?? 0.25);
  const hardwood = Number(cleaningProfile.hardwood_probability ?? 0.35);
  const glass = Number(cleaningProfile.glass_showers ?? 0.4);
  const clutter = Number(cleaningProfile.clutter_prior ?? 0.35);

  const historic =
    clamp((1980 - Number(year)) / 20.0, 0, 10) * 0.5 + historicTrim * 10 * 0.5;
  const luxury = clamp(hardwood * 4 + glass * 4 + Math.max(0, (sqft - 2000) / 500), 0, 10);
  const layout = clamp(stories * 2.5 + Number(propertyFacts.bedrooms ?? 3) * 0.5, 0, 10);
  const density = clamp(clutter * 10, 0, 10);
  const parking = Number(propertyFacts.parking_score ?? 5);
  const travel = Number(propertyFacts.travel_score ?? 4);

  return {
    historic: round2(historic),
    luxury: round2(luxury),
    layout: round2(layout),
    density: round2(density),
    parking: round2(parking),
    travel: round2(travel),
  };
}

export function complexitySum(vector: ComplexityVector): number {
  return Object.values(vector).reduce((a, b) => a + b, 0);
}

export function timeMultiplier(total: number, model: LaborModelJson): number {
  const bands = model.score_bands;
  if (total <= bands.low.max_complexity_sum) return bands.low.time_multiplier;
  if (total <= bands.medium.max_complexity_sum) return bands.medium.time_multiplier;
  if (total <= bands.high.max_complexity_sum) return bands.high.time_multiplier;
  return bands.very_high.time_multiplier;
}

function resolveServiceType(
  model: LaborModelJson,
  serviceType?: ServiceType | null,
): ServiceType | "legacy" {
  const services = "service_types" in model ? model.service_types : undefined;
  if (!services) return "legacy";
  const key =
    (serviceType ||
      ("default_service_type" in model ? model.default_service_type : undefined) ||
      "standard") as ServiceType;
  if (!(key in services)) {
    throw new Error(`Unknown service_type ${serviceType}; expected deep|standard|light`);
  }
  return key;
}

function baseHoursForSqft(
  sqft: number,
  model: LaborModelJson,
  serviceType: ServiceType | "legacy",
): number {
  const services = "service_types" in model ? model.service_types : undefined;
  if (services && serviceType !== "legacy") {
    const daySqft = Number(services[serviceType].sqft_per_cleaner_day);
    const dayHours = Number(
      "cleaner_day_hours" in model ? model.cleaner_day_hours : 8,
    );
    return sqft / (daySqft / dayHours);
  }
  const base = Number(
    "labor" in model && model.labor && "base_lu_per_100_sqft" in model.labor
      ? model.labor.base_lu_per_100_sqft
      : 4,
  );
  return (sqft / 100.0) * base;
}

export function estimateLaborUnits(
  propertyFacts: PropertyFacts,
  cleaningProfile: CleaningProfile,
  laborModelVersion = "0.2.0",
  serviceType?: ServiceType | null,
): LaborEstimate {
  const model = MODELS["labor-model"][laborModelVersion as "0.1.0" | "0.2.0"];
  if (!model) throw new Error(`Unknown labor model version: ${laborModelVersion}`);

  const sqft = Number(propertyFacts.finished_sqft ?? propertyFacts.parcel_sqft ?? 1500);
  const resolved = resolveServiceType(model, serviceType);
  const vector = inferComplexity(propertyFacts, cleaningProfile);
  const total = complexitySum(vector);
  const mult = timeMultiplier(total, model);
  const baseHours = baseHoursForSqft(sqft, model, resolved);
  const lu = Math.round(baseHours * mult * 10) / 10;

  const out: LaborEstimate = {
    estimated_lu: lu,
    complexity_vector: vector,
    complexity_sum: round2(total),
    time_multiplier: mult,
    labor_model: laborModelVersion,
    sqft_used: sqft,
  };
  if (resolved !== "legacy") {
    out.service_type = resolved;
    const services = (model as typeof laborModel020).service_types;
    const daySqft = Number(services[resolved].sqft_per_cleaner_day);
    const dayHours = Number((model as typeof laborModel020).cleaner_day_hours ?? 8);
    out.sqft_per_cleaner_day = daySqft;
    out.sqft_per_hour = Math.round((daySqft / dayHours) * 10000) / 10000;
  }
  return out;
}

export function estimateHours(
  estimatedLu: number,
  crewProductivityVersion = "0.2.0",
): HoursEstimate {
  const crew = MODELS["crew-productivity"][crewProductivityVersion as "0.1.0" | "0.2.0"];
  if (!crew) throw new Error(`Unknown crew productivity version: ${crewProductivityVersion}`);

  const hours = Math.round((estimatedLu / crew.labor_units_per_hour) * 100) / 100;
  return {
    estimated_hours: hours,
    crew_productivity: crewProductivityVersion,
    crew_size: crew.crew_size,
  };
}

export function estimatePrice(
  estimatedHours: number,
  pricingVersion = "0.2.0",
): PriceEstimate {
  const pricing = MODELS.pricing[pricingVersion as "0.1.0" | "0.2.0"];
  if (!pricing) throw new Error(`Unknown pricing version: ${pricingVersion}`);

  const raw = estimatedHours * pricing.hourly_rate;
  let price = Math.max(pricing.minimum_price, raw);
  const roundTo = pricing.round_to || 1;
  price = Math.round(price / roundTo) * roundTo;

  return {
    price,
    pricing: pricingVersion,
    currency: pricing.currency ?? "USD",
  };
}
