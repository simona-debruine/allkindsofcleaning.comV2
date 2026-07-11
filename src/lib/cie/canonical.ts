/** Canonical property shape from Property Enrichment Engine. */

export interface EnrichedField<T = number | string | boolean | null> {
  value: T;
  source: string;
  confidence?: number;
}

export interface CanonicalProperty {
  parcel_id: string;
  address: string;
  geo_id?: string | null;
  finished_sqft?: EnrichedField<number | null>;
  parcel_sqft?: EnrichedField<number | null>;
  bedrooms?: EnrichedField<number | null>;
  bathrooms?: EnrichedField<number | null>;
  year_built?: EnrichedField<number | null>;
  stories?: EnrichedField<number | null>;
  property_type?: EnrichedField<string | null>;
  assessed_value?: EnrichedField<number | null>;
  subdivision?: EnrichedField<string | null>;
  lat?: EnrichedField<number | null>;
  lon?: EnrichedField<number | null>;
  geometry?: EnrichedField<string | null>;
  providers_used?: string[];
  notes?: string;
}

export interface EnrichResponse {
  ok: boolean;
  property?: CanonicalProperty;
  error?: string;
  meta?: {
    service?: string;
    version?: string;
    parish?: string | null;
  };
}

export type EnrichParish = "orleans" | "st_charles" | "jefferson" | "st_tammany" | "";
