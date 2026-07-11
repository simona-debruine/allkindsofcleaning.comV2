import type { EnrichParish } from "./canonical";

export const PARISH_LABELS: Record<string, string> = {
  orleans: "Orleans Parish",
  st_charles: "St. Charles Parish",
  jefferson: "Jefferson Parish",
  st_tammany: "St. Tammany Parish",
};

/** Parishes with a live County GIS provider in Property Enrichment Engine */
export const GIS_SUPPORTED_PARISHES = new Set(["orleans", "st_charles"]);

export function parishLabel(id: string | null | undefined): string {
  if (!id) return "Unknown parish";
  return PARISH_LABELS[id] ?? id.replace(/_/g, " ");
}

/**
 * Infer parish from address text so we never route Covington/Metairie
 * through Orleans GIS.
 */
export function inferParishFromAddress(address: string): EnrichParish | null {
  const a = address.toUpperCase();

  if (
    /\bST\.?\s*CHARLES\b/.test(a) ||
    /\bSAINT\s+CHARLES\b/.test(a) ||
    /\bDESTREHAN\b|\bLULING\b|\bHAHNVILLE\b|\bNORCO\b|\bBOUTTE\b|\bMONTZ\b/.test(a)
  ) {
    return "st_charles";
  }

  if (
    /\bST\.?\s*TAMMANY\b/.test(a) ||
    /\bSAINT\s+TAMMANY\b/.test(a) ||
    /\bCOVINGTON\b|\bMANDEVILLE\b|\bSLIDELL\b|\bMADISONVILLE\b|\bABILA\b|\b70433\b|\b70448\b|\b70458\b|\b70471\b/.test(
      a,
    )
  ) {
    return "st_tammany";
  }

  if (
    /\bJEFFERSON\b|\bMETAIRIE\b|\bKENNER\b|\bGRETNA\b|\bHARAHAN\b|\bRIVER\s*RIDGE\b|\b7000[0-9]\b|\b70001\b|\b70002\b|\b70003\b|\b70005\b|\b70006\b/.test(
      a,
    )
  ) {
    return "jefferson";
  }

  if (/\bNEW\s+ORLEANS\b|\bNOLA\b|\bORLEANS\b|\b7011[0-9]\b|\b701[2-3][0-9]\b/.test(a)) {
    return "orleans";
  }

  return null;
}
