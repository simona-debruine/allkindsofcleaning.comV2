import { CIE_DEFAULT_PINS } from "./contract";
import { estimateHours, estimateLaborUnits, estimatePrice, type ServiceType } from "./labor";
import { getCieNeighborhood, type NeighborhoodCieConfig } from "./neighborhoods";
import type { CieQuote, CleaningProfile, PropertyFacts } from "./types";

export type PricingTier = "refresh" | "standard" | "deep";
export type EstimatorService = "residential" | "airbnb" | "move-in-out";

/**
 * Map UI tiers → CIE labor service types (model 0.2.0 sqft/day rates).
 * refresh = light (2500/day), standard (1750/day), deep (800/day).
 */
export const tierToServiceType: Record<PricingTier, ServiceType> = {
  refresh: "light",
  standard: "standard",
  deep: "deep",
};

/** Job-type product overlay after CIE price (not part of CIE Model Registry). */
export const serviceTierModifiers: Record<EstimatorService, Record<PricingTier, number>> = {
  residential: { refresh: 1, standard: 1, deep: 1 },
  airbnb: { refresh: 1.1, standard: 1.08, deep: 1.05 },
  "move-in-out": { refresh: 0.75, standard: 1.12, deep: 1 },
};

/**
 * Optional soft tweaks on cleaning-profile priors.
 * Primary tier pricing comes from CIE service_type productivity, not these.
 */
function applyTierToProfile(profile: CleaningProfile, tier: PricingTier): CleaningProfile {
  const clutter = Number(profile.clutter_prior ?? 0.35);
  const historic = Number(profile.historic_trim ?? 0.25);
  const glass = Number(profile.glass_showers ?? 0.4);

  if (tier === "refresh") {
    return {
      ...profile,
      clutter_prior: Math.max(0.1, clutter * 0.7),
      historic_trim: Math.max(0.1, historic * 0.85),
      glass_showers: Math.max(0.15, glass * 0.85),
    };
  }

  if (tier === "deep") {
    return {
      ...profile,
      clutter_prior: Math.min(0.85, clutter * 1.3),
      historic_trim: Math.min(0.95, historic * 1.15),
      glass_showers: Math.min(0.9, glass * 1.15),
      pet_hair_prior: Math.min(0.7, Number(profile.pet_hair_prior ?? 0.3) * 1.2),
    };
  }

  return profile;
}

export interface QuoteInput {
  neighborhoodId: string;
  tier: PricingTier;
  service: EstimatorService;
  propertyFacts: PropertyFacts;
  cleaningProfile: CleaningProfile;
  laborModelVersion?: string;
  crewProductivityVersion?: string;
  pricingVersion?: string;
  /** When true, skip tier-based profile adjustments (profile already from CIE) */
  lockProfile?: boolean;
}

/**
 * Implements CIE POST /estimate-labor + POST /estimate-price locally.
 * Pins default to Model Registry versions in CIE_DEFAULT_PINS.
 */
export function calculateCieQuote(input: QuoteInput): CieQuote {
  const neighborhood = getCieNeighborhood(input.neighborhoodId);
  return quoteForNeighborhood(neighborhood, input);
}

export function quoteForNeighborhood(
  neighborhood: NeighborhoodCieConfig,
  input: Omit<QuoteInput, "neighborhoodId"> & { neighborhoodId?: string },
): CieQuote {
  const baseProfile = {
    ...neighborhood.profile,
    ...input.cleaningProfile,
  };
  const profile = input.lockProfile
    ? baseProfile
    : applyTierToProfile(baseProfile, input.tier);

  const propertyFacts: PropertyFacts = {
    ...neighborhood.propertyDefaults,
    ...input.propertyFacts,
  };

  const serviceType = tierToServiceType[input.tier];
  const laborModelVersion = input.laborModelVersion ?? CIE_DEFAULT_PINS.labor_model;
  const crewProductivityVersion =
    input.crewProductivityVersion ?? CIE_DEFAULT_PINS.crew_productivity;
  const pricingVersion = input.pricingVersion ?? CIE_DEFAULT_PINS.pricing;

  const labor = estimateLaborUnits(
    propertyFacts,
    profile,
    laborModelVersion,
    serviceType,
  );
  const hours = estimateHours(labor.estimated_lu, crewProductivityVersion);
  const priced = estimatePrice(hours.estimated_hours, pricingVersion);

  const modifier = serviceTierModifiers[input.service][input.tier];
  const roundTo = 5;
  const sqft = Number(propertyFacts.finished_sqft ?? propertyFacts.parcel_sqft ?? 0);
  const adjusted = Math.max(120, Math.round((priced.price * modifier) / roundTo) * roundTo);

  return {
    ...labor,
    ...hours,
    ...priced,
    price: adjusted,
    base_price: priced.price,
    service_modifier: modifier,
    geo_id: neighborhood.geo_id,
    neighborhood_name: neighborhood.name,
    explanation: neighborhood.explanation,
    finished_sqft: sqft,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
