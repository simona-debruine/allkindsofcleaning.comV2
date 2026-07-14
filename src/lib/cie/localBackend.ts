/**
 * Local CIE API adapter — implements docs/api.md shapes while AWS HTTP is pending.
 */

import type { CanonicalProperty } from "./canonical";
import {
  CIE_DEFAULT_PINS,
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
import type { EnrichResult } from "./canonical";
import { deriveFromEnrichment } from "./fromCanonical";
import { estimateHours, estimateLaborUnits, estimatePrice } from "./labor";
import { cieNeighborhoods, getCieNeighborhood } from "./neighborhoods";
import {
  GIS_SUPPORTED_PARISHES,
  inferParishFromAddress,
  parishLabel,
} from "./parish";

const PE_PROXY_DEFAULT = "/api/property/enrich";

/** Prefer Amplify build env VITE_ENRICH_BFF_URL (Function URL); else Vite BFF path. */
function propertyEnrichEndpoint(): string {
  const fromEnv = (
    (import.meta as ImportMeta & { env?: Record<string, string> }).env
      ?.VITE_ENRICH_BFF_URL || ""
  ).trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return PE_PROXY_DEFAULT;
}

function geoOnlyProperty(address: string, parish: string): CanonicalProperty {
  return {
    parcel_id: "unknown",
    address,
    providers_used: [`${parishLabel(parish)} area priors`],
  };
}

function resolveNeighborhoodId(geoId: string): string {
  return cieNeighborhoods.find((n) => n.geo_id === geoId)?.id ?? cieNeighborhoods[0].id;
}

/** POST /property/enrich — delegates to PEE (Vite BFF / Amplify Function). */
export async function localPropertyEnrich(
  req: PropertyEnrichRequest,
  signal?: AbortSignal,
): Promise<PropertyEnrichResponse> {
  const trimmed = req.address.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a street address to continue." };
  }

  const resolved =
    (req.parish && req.parish.length > 0 ? req.parish : null) ||
    inferParishFromAddress(trimmed);

  if (resolved && !GIS_SUPPORTED_PARISHES.has(resolved)) {
    const property = geoOnlyProperty(trimmed, resolved);
    const derived = deriveFromEnrichment(property, trimmed, {
      parish: resolved,
      parishDisplay: parishLabel(resolved),
      usedGeoPriorsOnly: true,
    });
    return {
      ok: true,
      property,
      geo_id: derived.neighborhood.geo_id,
      meta: { parish: resolved, service: "cie-local", version: "local" },
    };
  }

  const body: { address: string; parish?: string } = { address: trimmed };
  if (resolved) body.parish = resolved;

  const res = await fetch(propertyEnrichEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  let payload: PropertyEnrichResponse;
  try {
    payload = (await res.json()) as PropertyEnrichResponse;
  } catch {
    return { ok: false, error: `Enrichment failed (${res.status}). Try again in a moment.` };
  }

  if (!res.ok || !payload.ok || !payload.property) {
    return { ok: false, error: payload.error || `Enrichment failed (${res.status}).` };
  }

  const metaParish = payload.meta?.parish || resolved;
  const derived = deriveFromEnrichment(payload.property, trimmed, {
    parish: metaParish,
    parishDisplay: parishLabel(metaParish),
    usedGeoPriorsOnly: false,
  });

  return {
    ...payload,
    geo_id: payload.geo_id || derived.neighborhood.geo_id,
    meta: { ...payload.meta, parish: metaParish },
  };
}

/** POST /expected-cleaning-profile */
export async function localExpectedCleaningProfile(
  req: ExpectedCleaningProfileRequest,
): Promise<ExpectedCleaningProfileResponse> {
  const match = getCieNeighborhood(resolveNeighborhoodId(req.geo_id));
  return {
    geo_id: match.geo_id,
    labor_model_version: CIE_DEFAULT_PINS.labor_model,
    expected_cleaning_profile: { ...match.profile },
  };
}

/** POST /estimate-labor */
export async function localEstimateLabor(
  req: EstimateLaborRequest,
): Promise<EstimateLaborResponse> {
  return estimateLaborUnits(
    req.property_facts,
    req.cleaning_profile,
    req.labor_model ?? CIE_DEFAULT_PINS.labor_model,
    req.service_type ?? "standard",
  );
}

/** POST /estimate-price — crew hours then dynamic pricing */
export async function localEstimatePrice(
  req: EstimatePriceRequest,
): Promise<EstimatePriceResponse> {
  const hours = estimateHours(
    req.estimated_lu,
    req.crew_productivity ?? CIE_DEFAULT_PINS.crew_productivity,
  );
  const priced = estimatePrice(
    hours.estimated_hours,
    req.pricing ?? CIE_DEFAULT_PINS.pricing,
  );
  return { ...hours, ...priced };
}

/** Vertical slice matching Architecture docs until CIE HTTP ships. */
export async function localCreateEstimate(
  req: CreateEstimateRequest,
  signal?: AbortSignal,
): Promise<CreateEstimateResponse | { ok: false; error: string }> {
  const enrich = await localPropertyEnrich({ address: req.address }, signal);
  if (!enrich.ok || !enrich.property) {
    return { ok: false, error: enrich.error || "Enrichment failed." };
  }

  const parish = enrich.meta?.parish ?? null;
  const usedGeoPriorsOnly =
    Boolean(parish && !GIS_SUPPORTED_PARISHES.has(parish)) ||
    Boolean(enrich.property.providers_used?.some((p) => /area priors/i.test(p)));

  const derived = deriveFromEnrichment(enrich.property, req.address, {
    parish,
    parishDisplay: parishLabel(parish),
    usedGeoPriorsOnly,
  });

  const geoId = req.geo_id || enrich.geo_id || derived.neighborhood.geo_id;
  const profileRec = await localExpectedCleaningProfile({ geo_id: geoId });
  const cleaningProfile = {
    ...profileRec.expected_cleaning_profile,
    ...req.cleaning_profile,
  };

  const propertyFacts = {
    ...derived.propertyFacts,
    ...req.property_facts,
  };

  const pins = {
    labor_model: req.labor_model ?? CIE_DEFAULT_PINS.labor_model,
    crew_productivity: req.crew_productivity ?? CIE_DEFAULT_PINS.crew_productivity,
    expected_cleaning_profile:
      req.expected_cleaning_profile_version ?? CIE_DEFAULT_PINS.expected_cleaning_profile,
    pricing: req.pricing ?? CIE_DEFAULT_PINS.pricing,
  };

  const labor = await localEstimateLabor({
    property_facts: propertyFacts,
    cleaning_profile: cleaningProfile,
    service_type: req.service_type,
    labor_model: pins.labor_model,
  });

  const pricing = await localEstimatePrice({
    estimated_lu: labor.estimated_lu,
    crew_productivity: pins.crew_productivity,
    pricing: pins.pricing,
  });

  return {
    ok: true,
    property: enrich.property,
    geo_id: geoId,
    neighborhood_name: derived.neighborhood.name,
    parish: derived.sourceParish,
    parish_display: derived.sourceParishDisplay,
    used_geo_priors_only: usedGeoPriorsOnly,
    cleaning_profile: cleaningProfile,
    labor,
    pricing,
    pins,
    thin_fields: derived.thinFields,
    enrichment_notes: derived.enrichmentNotes,
    explanation: derived.neighborhood.explanation,
    finished_sqft: Number(propertyFacts.finished_sqft ?? 0),
    property_facts: propertyFacts,
  };
}

/** Bridge for legacy enrichAddress() */
export async function enrichResultFromLocal(
  address: string,
  signal?: AbortSignal,
): Promise<EnrichResult> {
  const res = await localPropertyEnrich({ address }, signal);
  if (!res.ok || !res.property) {
    throw new Error(res.error || "Enrichment failed.");
  }
  const parish = res.meta?.parish ?? null;
  return {
    property: res.property,
    parish,
    parishDisplay: parishLabel(parish),
    usedGeoPriorsOnly:
      Boolean(parish && !GIS_SUPPORTED_PARISHES.has(parish)) ||
      Boolean(res.property.providers_used?.some((p) => /area priors/i.test(p))),
  };
}
