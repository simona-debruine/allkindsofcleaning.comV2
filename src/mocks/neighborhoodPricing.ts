export type PricingTier = "refresh" | "standard" | "deep";
export type EstimatorService = "residential" | "airbnb" | "move-in-out";

export interface TierPricing {
  perSqftMin: number;
  perSqftMax: number;
  example2000Min: number;
  example2000Max: number;
  localFactor: string;
}

export interface NeighborhoodPricing {
  id: string;
  name: string;
  averageSqft: number;
  refresh: TierPricing;
  standard: TierPricing;
  deep: TierPricing;
}

export const estimatorServices: Record<
  EstimatorService,
  { title: string; description: string; icon: string }
> = {
  residential: {
    title: "Residential Home Cleaning",
    description: "Comprehensive cleaning for your home based on local neighborhood rates.",
    icon: "ri-home-smile-line",
  },
  airbnb: {
    title: "Airbnb / Vacation Rental Turnover",
    description: "Turnover cleaning estimates with a modest premium for linen refresh and inspection-ready standards.",
    icon: "ri-hotel-bed-line",
  },
  "move-in-out": {
    title: "Move In / Move Out Cleaning",
    description: "Deep-clean focused estimates for empty homes, adjusted for move-in and move-out scope.",
    icon: "ri-truck-line",
  },
};

/** Service-specific multipliers applied to base neighborhood per-sqft rates */
export const serviceTierModifiers: Record<EstimatorService, Record<PricingTier, number>> = {
  residential: { refresh: 1, standard: 1, deep: 1 },
  airbnb: { refresh: 1.1, standard: 1.08, deep: 1.05 },
  "move-in-out": { refresh: 0.75, standard: 1.12, deep: 1 },
};

export const tierLabels: Record<PricingTier, string> = {
  refresh: "Quick Refresh",
  standard: "Standard Clean",
  deep: "Deep Clean",
};

export const neighborhoods: NeighborhoodPricing[] = [
  {
    id: "metairie-club-gardens",
    name: "Metairie Club Gardens",
    averageSqft: 2200,
    refresh: {
      perSqftMin: 0.06,
      perSqftMax: 0.08,
      example2000Min: 120,
      example2000Max: 160,
      localFactor: "Large open rooms allow rapid vacuuming and floor mopping.",
    },
    standard: {
      perSqftMin: 0.09,
      perSqftMax: 0.11,
      example2000Min: 180,
      example2000Max: 220,
      localFactor: "Large layout and numerous light fixtures add steady physical detailing time.",
    },
    deep: {
      perSqftMin: 0.14,
      perSqftMax: 0.16,
      example2000Min: 280,
      example2000Max: 320,
      localFactor: "Suburban open spaces speed up moving furniture but extensive cabinet rows add time.",
    },
  },
  {
    id: "garden-district",
    name: "Garden District",
    averageSqft: 2600,
    refresh: {
      perSqftMin: 0.12,
      perSqftMax: 0.15,
      example2000Min: 240,
      example2000Max: 300,
      localFactor: "High ceilings require extra tall dusting; delicate surfaces slow down wiping.",
    },
    standard: {
      perSqftMin: 0.18,
      perSqftMax: 0.22,
      example2000Min: 360,
      example2000Max: 440,
      localFactor: "Intricate historical baseboard carvings and complex crystal light fixtures require slow work.",
    },
    deep: {
      perSqftMin: 0.28,
      perSqftMax: 0.32,
      example2000Min: 560,
      example2000Max: 640,
      localFactor: "Intricate tile grout patterns and heavy antique furniture require slow manual handling.",
    },
  },
  {
    id: "audubon",
    name: "Audubon",
    averageSqft: 2300,
    refresh: {
      perSqftMin: 0.09,
      perSqftMax: 0.12,
      example2000Min: 180,
      example2000Max: 240,
      localFactor: "Multi-level floor plans mean moving vacuum equipment up and down stairs.",
    },
    standard: {
      perSqftMin: 0.14,
      perSqftMax: 0.17,
      example2000Min: 280,
      example2000Max: 340,
      localFactor: "Multi-story homes with many doors and decorative trim slow down the wall-switch wiping.",
    },
    deep: {
      perSqftMin: 0.22,
      perSqftMax: 0.26,
      example2000Min: 440,
      example2000Max: 520,
      localFactor: "Large window counts with extensive blinds significantly prolong the detailed sill wiping.",
    },
  },
  {
    id: "uptown",
    name: "Uptown",
    averageSqft: 1950,
    refresh: {
      perSqftMin: 0.1,
      perSqftMax: 0.13,
      example2000Min: 200,
      example2000Max: 260,
      localFactor: "Street parking constraints can limit a cleaner's equipment-carrying speed.",
    },
    standard: {
      perSqftMin: 0.15,
      perSqftMax: 0.18,
      example2000Min: 300,
      example2000Max: 360,
      localFactor: "High ceilings require cleaners to bring and move taller A-frame ladders for ceiling fans.",
    },
    deep: {
      perSqftMin: 0.23,
      perSqftMax: 0.27,
      example2000Min: 460,
      example2000Max: 540,
      localFactor: "High ceilings require safety ladders to safely clean top cabinet shelves and window valances.",
    },
  },
  {
    id: "touro",
    name: "Touro",
    averageSqft: 2050,
    refresh: {
      perSqftMin: 0.1,
      perSqftMax: 0.13,
      example2000Min: 200,
      example2000Max: 260,
      localFactor: "Historic baseboards and old window frames require meticulous surface dusting.",
    },
    standard: {
      perSqftMin: 0.15,
      perSqftMax: 0.18,
      example2000Min: 300,
      example2000Max: 360,
      localFactor: "Older multi-layered baseboards collect thick dust and require hand-scrubbing.",
    },
    deep: {
      perSqftMin: 0.23,
      perSqftMax: 0.27,
      example2000Min: 460,
      example2000Max: 540,
      localFactor: "Aged tile grout lines require deep chemical dwell times and specialized brush scrubbing.",
    },
  },
  {
    id: "central-business-district",
    name: "Central Business District",
    averageSqft: 1000,
    refresh: {
      perSqftMin: 0.15,
      perSqftMax: 0.18,
      example2000Min: 300,
      example2000Max: 360,
      localFactor: "High-rise access times and paid parking garage fees are baked into the rate.",
    },
    standard: {
      perSqftMin: 0.2,
      perSqftMax: 0.24,
      example2000Min: 400,
      example2000Max: 480,
      localFactor: "Modern premium stainless-steel appliances require meticulous streak-free exterior buffing.",
    },
    deep: {
      perSqftMin: 0.3,
      perSqftMax: 0.35,
      example2000Min: 600,
      example2000Max: 700,
      localFactor: "Industrial appliances and floor-to-ceiling glass interior sills demand expert streak-free finishes.",
    },
  },
  {
    id: "lakeview",
    name: "Lakeview",
    averageSqft: 2250,
    refresh: {
      perSqftMin: 0.07,
      perSqftMax: 0.09,
      example2000Min: 140,
      example2000Max: 180,
      localFactor: "Flat, modern surface finishes make counter wiping and mopping very fast.",
    },
    standard: {
      perSqftMin: 0.1,
      perSqftMax: 0.13,
      example2000Min: 200,
      example2000Max: 260,
      localFactor: "Modern simple baseboard shapes and standard heights make detailing quick.",
    },
    deep: {
      perSqftMin: 0.15,
      perSqftMax: 0.19,
      example2000Min: 300,
      example2000Max: 380,
      localFactor: "Modern standard layouts make moving furniture and wiping standard blinds highly predictable.",
    },
  },
  {
    id: "french-quarter",
    name: "French Quarter",
    averageSqft: 1000,
    refresh: {
      perSqftMin: 0.18,
      perSqftMax: 0.22,
      example2000Min: 360,
      example2000Max: 440,
      localFactor: "Severe parking restrictions and complex building layouts yield highest premium.",
    },
    standard: {
      perSqftMin: 0.24,
      perSqftMax: 0.28,
      example2000Min: 480,
      example2000Max: 560,
      localFactor: "Extreme ceiling heights and fragile antique fixtures push tracking times and risk rates up.",
    },
    deep: {
      perSqftMin: 0.35,
      perSqftMax: 0.42,
      example2000Min: 700,
      example2000Max: 840,
      localFactor: "Fragile historic cabinetry and non-standard window frame sizes mandate slow delicate work.",
    },
  },
  {
    id: "mandeville",
    name: "Mandeville",
    averageSqft: 2200,
    refresh: {
      perSqftMin: 0.05,
      perSqftMax: 0.07,
      example2000Min: 100,
      example2000Max: 140,
      localFactor: "Driveway parking and seamless layouts permit rapid maintenance cleaning.",
    },
    standard: {
      perSqftMin: 0.08,
      perSqftMax: 0.1,
      example2000Min: 160,
      example2000Max: 200,
      localFactor: "Standard suburban home layouts allow predictable and speedy baseboard wiping.",
    },
    deep: {
      perSqftMin: 0.12,
      perSqftMax: 0.15,
      example2000Min: 240,
      example2000Max: 300,
      localFactor: "Fast turnaround time due to uniform modern building materials and accessible cabinet layouts.",
    },
  },
  {
    id: "covington",
    name: "Covington",
    averageSqft: 2150,
    refresh: {
      perSqftMin: 0.05,
      perSqftMax: 0.07,
      example2000Min: 100,
      example2000Max: 140,
      localFactor: "Low-density suburban travel times allow baseline local standard rates.",
    },
    standard: {
      perSqftMin: 0.08,
      perSqftMax: 0.1,
      example2000Min: 160,
      example2000Max: 200,
      localFactor: "Low-density travel allows standard flat rates for comprehensive detailing.",
    },
    deep: {
      perSqftMin: 0.12,
      perSqftMax: 0.15,
      example2000Min: 240,
      example2000Max: 300,
      localFactor: "Consistent suburban home layouts allow teams to utilize standard equipment efficiently.",
    },
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface CostEstimate {
  min: number;
  max: number;
  perSqftMin: number;
  perSqftMax: number;
  localFactor: string;
}

export function calculateEstimate(
  neighborhood: NeighborhoodPricing,
  tier: PricingTier,
  sqft: number,
  service: EstimatorService,
): CostEstimate {
  const tierData = neighborhood[tier];
  const modifier = serviceTierModifiers[service][tier];
  const perSqftMin = tierData.perSqftMin * modifier;
  const perSqftMax = tierData.perSqftMax * modifier;

  return {
    min: Math.round(perSqftMin * sqft),
    max: Math.round(perSqftMax * sqft),
    perSqftMin,
    perSqftMax,
    localFactor: tierData.localFactor,
  };
}

export function parseEstimatorService(value: string | null): EstimatorService {
  if (value === "airbnb" || value === "move-in-out") return value;
  return "residential";
}
