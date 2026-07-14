/**
 * Cleaning Intelligence Engine HTTP API contract (Architecture v1.0).
 * Kept in sync with cleaning-intelligence-engine/docs/api.md + api/*.schema.ts.
 *
 * One responsibility per endpoint. Math is pinned by Model Registry versions —
 * the SPA must not invent LU / hours / price outside these shapes.
 */

import type { CanonicalProperty, EnrichResponse } from "./canonical";
import type {
  CleaningProfile,
  HoursEstimate,
  LaborEstimate,
  PriceEstimate,
  PropertyFacts,
} from "./types";
import type { ServiceType } from "./labor";

/** Default Model Registry pins (CIE defaults as of labor 0.2.0). */
export const CIE_DEFAULT_PINS = {
  labor_model: "0.2.0",
  crew_productivity: "0.2.0",
  expected_cleaning_profile: "0.1.0",
  pricing: "0.2.0",
} as const;

export type CeilingHeight = "standard" | "high" | "vaulted" | "unknown";

/** Matches CIE api/expected-cleaning-profile.schema.ts */
export type ExpectedCleaningProfile = CleaningProfile & {
  ceiling_height?: CeilingHeight;
};

export interface ExpectedCleaningProfileRecord {
  geo_id: string;
  labor_model_version: string;
  expected_cleaning_profile: ExpectedCleaningProfile;
}

/** Matches CIE api/geo.schema.ts */
export type GeoType =
  | "metro"
  | "parish"
  | "neighborhood"
  | "subdivision"
  | "zip"
  | "census_tract"
  | "travel_zone";

export interface GeoNode {
  geo_id: string;
  geo_type: GeoType;
  geo_name: string;
  parent_geo_id?: string | null;
  parish?: string | null;
  state?: string | null;
}

// --- POST /property/enrich (CIE delegates to Property Enrichment Engine) ---

export interface PropertyEnrichRequest {
  address: string;
  parish?: string | null;
}

export interface PropertyEnrichResponse extends EnrichResponse {
  /** CIE may attach resolved geo after enrichment */
  geo_id?: string | null;
}

// --- POST /expected-cleaning-profile ---

export interface ExpectedCleaningProfileRequest {
  geo_id: string;
  /** Optional property facts to refine priors */
  property_facts?: PropertyFacts;
}

export type ExpectedCleaningProfileResponse = ExpectedCleaningProfileRecord;

// --- POST /estimate-labor ---

export interface EstimateLaborRequest {
  property_facts: PropertyFacts;
  cleaning_profile: ExpectedCleaningProfile;
  service_type?: ServiceType;
  labor_model?: string;
}

export type EstimateLaborResponse = LaborEstimate;

// --- POST /estimate-price (hours from LU via crew productivity, then price) ---

export interface EstimatePriceRequest {
  estimated_lu: number;
  crew_productivity?: string;
  pricing?: string;
}

export type EstimatePriceResponse = HoursEstimate & PriceEstimate;

// --- Vertical-slice quote (orchestrates enrich → profile → labor → price) ---

export interface CreateEstimateRequest {
  address: string;
  /** CIE service intensity: light | standard | deep */
  service_type: ServiceType;
  /** Customer overrides after enrichment */
  property_facts?: PropertyFacts;
  geo_id?: string | null;
  cleaning_profile?: ExpectedCleaningProfile;
  labor_model?: string;
  crew_productivity?: string;
  pricing?: string;
  expected_cleaning_profile_version?: string;
}

export interface CreateEstimateResponse {
  ok: true;
  property: CanonicalProperty;
  geo_id: string;
  neighborhood_name: string;
  parish: string | null;
  parish_display: string;
  used_geo_priors_only: boolean;
  cleaning_profile: ExpectedCleaningProfile;
  labor: EstimateLaborResponse;
  pricing: EstimatePriceResponse;
  /** Pins recorded as on estimate_created events */
  pins: {
    labor_model: string;
    crew_productivity: string;
    expected_cleaning_profile: string;
    pricing: string;
  };
  thin_fields: string[];
  enrichment_notes: string[];
  explanation: string;
  finished_sqft: number;
  /** Facts used for LU (enriched + defaults + overrides) */
  property_facts: PropertyFacts;
}

export interface CieApiErrorBody {
  ok: false;
  error: string;
}

/** Paths relative to CIE API base (no /v1 prefix in Architecture docs). */
export const CIE_PATHS = {
  propertyEnrich: "/property/enrich",
  expectedCleaningProfile: "/expected-cleaning-profile",
  estimateLabor: "/estimate-labor",
  estimatePrice: "/estimate-price",
  models: "/models",
  geo: (id: string) => `/geo/${encodeURIComponent(id)}`,
  expectedHouse: (geoId: string) => `/expected-house/${encodeURIComponent(geoId)}`,
} as const;
