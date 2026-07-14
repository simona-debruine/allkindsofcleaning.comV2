/**
 * Property enrichment — CIE contract POST /property/enrich
 * (delegates to Property Enrichment Engine via BFF or local adapter).
 */

import { enrichResultFromLocal } from "./localBackend";
import type { EnrichResult } from "./canonical";

export type { EnrichResult };

/**
 * Infer parish from address and enrich via CIE local/remote client.
 * Parish is always inferred from the address — not caller-overridable.
 */
export async function enrichAddress(
  address: string,
  signal?: AbortSignal,
): Promise<EnrichResult> {
  return enrichResultFromLocal(address, signal);
}
