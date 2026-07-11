import type { CanonicalProperty, EnrichResponse } from "./canonical";
import {
  GIS_SUPPORTED_PARISHES,
  inferParishFromAddress,
  parishLabel,
} from "./parish";

const ENRICH_PATH = "/api/property/enrich";

export interface EnrichResult {
  property: CanonicalProperty;
  /** Resolved parish used for lookup / messaging */
  parish: string | null;
  parishDisplay: string;
  /** True when we used geo priors only (no live parish GIS) */
  usedGeoPriorsOnly: boolean;
}

function geoOnlyProperty(address: string, parish: string): CanonicalProperty {
  return {
    parcel_id: "unknown",
    address,
    providers_used: [`${parishLabel(parish)} area priors`],
    notes: undefined,
  };
}

/**
 * Call Property Enrichment via same-origin BFF proxy.
 * Parish is always inferred from the address — not caller-overridable.
 */
export async function enrichAddress(
  address: string,
  signal?: AbortSignal,
): Promise<EnrichResult> {
  const trimmed = address.trim();
  if (!trimmed) throw new Error("Enter a street address to continue.");

  const resolved = inferParishFromAddress(trimmed);

  // No live GIS for this parish yet — seed from CIE geo priors, don't call Orleans.
  if (resolved && !GIS_SUPPORTED_PARISHES.has(resolved)) {
    return {
      property: geoOnlyProperty(trimmed, resolved),
      parish: resolved,
      parishDisplay: parishLabel(resolved),
      usedGeoPriorsOnly: true,
    };
  }

  const body: { address: string; parish?: string } = { address: trimmed };
  if (resolved) body.parish = resolved;

  const res = await fetch(ENRICH_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  let payload: EnrichResponse;
  try {
    payload = (await res.json()) as EnrichResponse;
  } catch {
    throw new Error(`Enrichment failed (${res.status}). Try again in a moment.`);
  }

  if (!res.ok || !payload.ok || !payload.property) {
    throw new Error(payload.error || `Enrichment failed (${res.status}).`);
  }

  const metaParish = payload.meta?.parish || resolved;
  return {
    property: payload.property,
    parish: metaParish ?? null,
    parishDisplay: parishLabel(metaParish),
    usedGeoPriorsOnly: false,
  };
}
