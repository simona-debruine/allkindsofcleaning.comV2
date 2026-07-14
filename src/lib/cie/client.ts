/**
 * CIE API client — call remote CIE when configured, else local adapter.
 *
 * Production (Amplify): set VITE_CIE_API_URL to the CIE API Gateway base
 *   e.g. https://xxxx.execute-api.us-east-1.amazonaws.com/prod
 * or serve under same-origin `/api/cie` via Amplify Function.
 *
 * Local: omit URL → uses localBackend (contracts in docs/api.md).
 */

import {
  CIE_PATHS,
  type CreateEstimateRequest,
  type CreateEstimateResponse,
  type EstimateLaborRequest,
  type EstimateLaborResponse,
  type EstimatePriceRequest,
  type EstimatePriceResponse,
  type ExpectedCleaningProfileRequest,
  type ExpectedCleaningProfileResponse,
  type PropertyEnrichRequest,
  type PropertyEnrichResponse,
} from "./contract";
import {
  localCreateEstimate,
  localEstimateLabor,
  localEstimatePrice,
  localExpectedCleaningProfile,
  localPropertyEnrich,
} from "./localBackend";

function cieBaseUrl(): string {
  const raw =
    (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_CIE_API_URL ||
    "";
  return raw.replace(/\/$/, "");
}

function useRemote(): boolean {
  return cieBaseUrl().length > 0;
}

async function postJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const res = await fetch(`${cieBaseUrl()}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  let payload: T & { ok?: boolean; error?: string };
  try {
    payload = (await res.json()) as T & { ok?: boolean; error?: string };
  } catch {
    throw new Error(`CIE ${path} failed (${res.status}).`);
  }
  if (!res.ok) {
    throw new Error(
      (payload && typeof payload === "object" && "error" in payload && payload.error) ||
        `CIE ${path} failed (${res.status}).`,
    );
  }
  return payload;
}

export async function propertyEnrich(
  req: PropertyEnrichRequest,
  signal?: AbortSignal,
): Promise<PropertyEnrichResponse> {
  if (!useRemote()) return localPropertyEnrich(req, signal);
  return postJson<PropertyEnrichResponse>(CIE_PATHS.propertyEnrich, req, signal);
}

export async function expectedCleaningProfile(
  req: ExpectedCleaningProfileRequest,
  signal?: AbortSignal,
): Promise<ExpectedCleaningProfileResponse> {
  if (!useRemote()) return localExpectedCleaningProfile(req);
  return postJson<ExpectedCleaningProfileResponse>(
    CIE_PATHS.expectedCleaningProfile,
    req,
    signal,
  );
}

export async function estimateLabor(
  req: EstimateLaborRequest,
  signal?: AbortSignal,
): Promise<EstimateLaborResponse> {
  if (!useRemote()) return localEstimateLabor(req);
  return postJson<EstimateLaborResponse>(CIE_PATHS.estimateLabor, req, signal);
}

export async function estimatePriceQuote(
  req: EstimatePriceRequest,
  signal?: AbortSignal,
): Promise<EstimatePriceResponse> {
  if (!useRemote()) return localEstimatePrice(req);
  return postJson<EstimatePriceResponse>(CIE_PATHS.estimatePrice, req, signal);
}

/**
 * Vertical slice: address → enrich → profile → labor → price.
 * Prefer this from the estimate page so UI stays endpoint-oriented.
 */
export async function createEstimate(
  req: CreateEstimateRequest,
  signal?: AbortSignal,
): Promise<CreateEstimateResponse> {
  if (!useRemote()) {
    const local = await localCreateEstimate(req, signal);
    if (!local.ok) throw new Error(local.error);
    return local;
  }

  // Remote: orchestrate one-responsibility endpoints (CIE may later offer a composite).
  const enrich = await propertyEnrich({ address: req.address }, signal);
  if (!enrich.ok || !enrich.property) {
    throw new Error(enrich.error || "Enrichment failed.");
  }

  const geoId = req.geo_id || enrich.geo_id;
  if (!geoId) throw new Error("CIE enrich response missing geo_id.");

  const profileRec = await expectedCleaningProfile(
    { geo_id: geoId, property_facts: req.property_facts },
    signal,
  );

  const cleaningProfile = {
    ...profileRec.expected_cleaning_profile,
    ...req.cleaning_profile,
  };

  const labor = await estimateLabor(
    {
      property_facts: req.property_facts ?? {},
      cleaning_profile: cleaningProfile,
      service_type: req.service_type,
      labor_model: req.labor_model,
    },
    signal,
  );

  const pricing = await estimatePriceQuote(
    {
      estimated_lu: labor.estimated_lu,
      crew_productivity: req.crew_productivity,
      pricing: req.pricing,
    },
    signal,
  );

  return {
    ok: true,
    property: enrich.property,
    geo_id: geoId,
    neighborhood_name: enrich.property.address,
    parish: enrich.meta?.parish ?? null,
    parish_display: enrich.meta?.parish ?? "",
    used_geo_priors_only: false,
    cleaning_profile: cleaningProfile,
    labor,
    pricing,
    pins: {
      labor_model: labor.labor_model,
      crew_productivity: pricing.crew_productivity,
      expected_cleaning_profile: profileRec.labor_model_version,
      pricing: pricing.pricing,
    },
    thin_fields: [],
    enrichment_notes: [],
    explanation: "",
    finished_sqft: Number(req.property_facts?.finished_sqft ?? 0),
    property_facts: req.property_facts ?? {},
  };
}

export function isCieRemoteConfigured(): boolean {
  return useRemote();
}
