import { cieNeighborhoods, getCieNeighborhood, type NeighborhoodCieConfig } from "./neighborhoods";
import type { CanonicalProperty } from "./canonical";
import type { CleaningProfile, PropertyFacts } from "./types";

const MAX_REASONABLE_LIVING_SQFT = 12000;

function fieldValue<T>(field?: { value: T } | null): T | null {
  if (!field || field.value === undefined || field.value === null) return null;
  return field.value;
}

function fieldConfidence(field?: { confidence?: number } | null): number {
  return field?.confidence ?? 0;
}

/** Infer CIE neighborhood / geo priors from enrichment + address text. */
export function resolveNeighborhood(
  property: CanonicalProperty,
  address: string,
): NeighborhoodCieConfig {
  if (property.geo_id) {
    const byGeo = cieNeighborhoods.find((n) => n.geo_id === property.geo_id);
    if (byGeo) return byGeo;
  }

  const haystack = [
    address,
    property.address,
    fieldValue(property.subdivision),
    property.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const aliases: { id: string; needles: string[] }[] = [
    { id: "garden-district", needles: ["garden district", "garden-district"] },
    { id: "french-quarter", needles: ["french quarter", "vieux carre", "vieux carré"] },
    { id: "audubon", needles: ["audubon", "university area"] },
    { id: "uptown", needles: ["uptown", "magazine st", "carrollton"] },
    { id: "touro", needles: ["touro"] },
    { id: "lakeview", needles: ["lakeview"] },
    {
      id: "central-business-district",
      needles: ["cbd", "central business", "warehouse district", "downtown"],
    },
    { id: "metairie-club-gardens", needles: ["metairie", "club gardens"] },
    { id: "mandeville", needles: ["mandeville"] },
    { id: "covington", needles: ["covington"] },
  ];

  for (const alias of aliases) {
    if (alias.needles.some((n) => haystack.includes(n))) {
      return getCieNeighborhood(alias.id);
    }
  }

  return cieNeighborhoods[0];
}

export interface EnrichmentDerived {
  neighborhoodId: string;
  neighborhood: NeighborhoodCieConfig;
  propertyFacts: PropertyFacts;
  cleaningProfile: CleaningProfile;
  /** Fields missing or low-confidence that the user should confirm */
  thinFields: string[];
  enrichmentNotes: string[];
  usedParcelFallback: boolean;
  livingSqftSource: "finished_sqft" | "parcel_sqft" | "geo_average" | "default";
  sourceParish: string | null;
  sourceParishDisplay: string;
}

export interface DeriveOptions {
  parish?: string | null;
  parishDisplay?: string;
  usedGeoPriorsOnly?: boolean;
}

/**
 * Map canonical enrichment → CIE property facts + geo cleaning profile.
 * Living area prefers finished_sqft; parcel_sqft only when plausible; else geo average.
 */
export function deriveFromEnrichment(
  property: CanonicalProperty,
  address: string,
  options: DeriveOptions = {},
): EnrichmentDerived {
  const neighborhood = resolveNeighborhood(property, address);
  const thinFields: string[] = [];
  const enrichmentNotes: string[] = [];

  const sourceParish = options.parish ?? null;
  const sourceParishDisplay =
    options.parishDisplay ||
    (sourceParish ? sourceParish.replace(/_/g, " ") : "area averages");

  if (!options.usedGeoPriorsOnly) {
    enrichmentNotes.push(`Details from ${sourceParishDisplay}.`);
  }

  const finished = fieldValue(property.finished_sqft);
  const finishedConf = fieldConfidence(property.finished_sqft);
  const parcel = fieldValue(property.parcel_sqft);
  const beds = fieldValue(property.bedrooms);
  const baths = fieldValue(property.bathrooms);
  const year = fieldValue(property.year_built);
  const stories = fieldValue(property.stories);

  let livingSqft: number;
  let livingSqftSource: EnrichmentDerived["livingSqftSource"];
  let usedParcelFallback = false;

  if (typeof finished === "number" && finished > 200 && finishedConf > 0) {
    livingSqft = Math.round(finished);
    livingSqftSource = "finished_sqft";
    if (options.usedGeoPriorsOnly) {
      enrichmentNotes.push(
        `Details from ${sourceParishDisplay} — parcel GIS is not connected for this parish yet; using local area averages.`,
      );
    }
  } else if (
    typeof parcel === "number" &&
    parcel > 200 &&
    parcel <= MAX_REASONABLE_LIVING_SQFT
  ) {
    livingSqft = Math.round(parcel);
    livingSqftSource = "parcel_sqft";
    usedParcelFallback = true;
    thinFields.push("finished_sqft");
    if (options.usedGeoPriorsOnly) {
      enrichmentNotes.push(
        `Details from ${sourceParishDisplay} — parcel GIS is not connected for this parish yet.\nHeated living area missing — using parcel size as a temporary stand-in. Confirm living area.`,
      );
    } else {
      enrichmentNotes.push(
        "Heated living area missing — using parcel size as a temporary stand-in. Confirm living area.",
      );
    }
  } else {
    livingSqft = neighborhood.averageSqft;
    livingSqftSource = "geo_average";
    thinFields.push("finished_sqft");
    if (typeof parcel === "number" && parcel > MAX_REASONABLE_LIVING_SQFT) {
      if (options.usedGeoPriorsOnly) {
        enrichmentNotes.push(
          `Details from ${sourceParishDisplay} — parcel GIS is not connected for this parish yet.\nParcel is ${parcel.toLocaleString()} sq ft (lot, not living area). Confirm heated living area.`,
        );
      } else {
        enrichmentNotes.push(
          `Parcel is ${parcel.toLocaleString()} sq ft (lot, not living area). Confirm heated living area.`,
        );
      }
    } else if (options.usedGeoPriorsOnly) {
      enrichmentNotes.push(
        `Details from ${sourceParishDisplay} — parcel GIS is not connected for this parish yet\nUsing local area averages seeded from ${neighborhood.name} average (${neighborhood.averageSqft.toLocaleString()} sq ft).`,
      );
    } else {
      enrichmentNotes.push(
        `Living area not in parish records — seeded from ${neighborhood.name} average (${neighborhood.averageSqft.toLocaleString()} sq ft).`,
      );
    }
  }

  if (beds == null) thinFields.push("bedrooms");
  if (baths == null) thinFields.push("bathrooms");
  if (stories == null) thinFields.push("stories");

  const propertyFacts: PropertyFacts = {
    finished_sqft: livingSqft,
    parcel_sqft: typeof parcel === "number" ? parcel : undefined,
    year_built: typeof year === "number" ? year : neighborhood.propertyDefaults.year_built,
    stories: typeof stories === "number" ? stories : neighborhood.propertyDefaults.stories,
    bedrooms: typeof beds === "number" ? beds : neighborhood.propertyDefaults.bedrooms,
    bathrooms: typeof baths === "number" ? baths : neighborhood.propertyDefaults.bathrooms,
    parking_score: neighborhood.propertyDefaults.parking_score,
    travel_score: neighborhood.propertyDefaults.travel_score,
  };

  return {
    neighborhoodId: neighborhood.id,
    neighborhood,
    propertyFacts,
    cleaningProfile: { ...neighborhood.profile },
    thinFields: [...new Set(thinFields)],
    enrichmentNotes,
    usedParcelFallback,
    livingSqftSource,
    sourceParish,
    sourceParishDisplay,
  };
}

export function isFieldThin(thinFields: string[], key: string): boolean {
  return thinFields.includes(key);
}
