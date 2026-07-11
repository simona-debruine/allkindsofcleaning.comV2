export interface PropertyFacts {
  finished_sqft?: number;
  parcel_sqft?: number;
  year_built?: number;
  stories?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking_score?: number;
  travel_score?: number;
}

export interface CleaningProfile {
  hardwood_probability?: number;
  tile_probability?: number;
  carpet_probability?: number;
  glass_showers?: number;
  ceiling_height?: string;
  historic_trim?: number;
  pet_hair_prior?: number;
  clutter_prior?: number;
}

export interface ComplexityVector {
  historic: number;
  luxury: number;
  layout: number;
  density: number;
  parking: number;
  travel: number;
}

export interface LaborEstimate {
  estimated_lu: number;
  complexity_vector: ComplexityVector;
  complexity_sum: number;
  time_multiplier: number;
  labor_model: string;
}

export interface HoursEstimate {
  estimated_hours: number;
  crew_productivity: string;
  crew_size: number | undefined;
}

export interface PriceEstimate {
  price: number;
  pricing: string;
  currency: string;
}

export interface CieQuote extends LaborEstimate, HoursEstimate, PriceEstimate {
  geo_id: string;
  neighborhood_name: string;
  explanation: string;
  service_modifier: number;
  base_price: number;
  finished_sqft: number;
}
