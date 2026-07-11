import profileDefaults from "./models/expected-cleaning-profile-0.1.0.json";
import type { CleaningProfile, PropertyFacts } from "./types";

export interface NeighborhoodCieConfig {
  id: string;
  name: string;
  geo_id: string;
  averageSqft: number;
  /** Default property facts when only sqft is known */
  propertyDefaults: Omit<PropertyFacts, "finished_sqft">;
  /** Geo-specific cleaning profile priors (merged over CIE defaults) */
  profile: CleaningProfile;
  explanation: string;
}

const defaults = profileDefaults.defaults;

function profile(overrides: CleaningProfile): CleaningProfile {
  return { ...defaults, ...overrides };
}

/**
 * UI neighborhoods mapped to CIE geo_ids and feature-driven cleaning priors.
 * Priors encode local factors (historic trim, parking, travel) until Expected
 * Cleaning Profiles are served from the CIE API.
 */
export const cieNeighborhoods: NeighborhoodCieConfig[] = [
  {
    id: "metairie-club-gardens",
    name: "Metairie Club Gardens",
    geo_id: "nsa:jefferson:metairie_club_gardens",
    averageSqft: 2200,
    propertyDefaults: {
      year_built: 1975,
      stories: 1,
      bedrooms: 4,
      bathrooms: 3,
      parking_score: 3,
      travel_score: 3,
    },
    profile: profile({
      hardwood_probability: 0.45,
      glass_showers: 0.45,
      historic_trim: 0.2,
      clutter_prior: 0.3,
    }),
    explanation:
      "Large open rooms and suburban parking keep travel and layout complexity moderate.",
  },
  {
    id: "garden-district",
    name: "Garden District",
    geo_id: "nsa:orleans:garden_district",
    averageSqft: 2600,
    propertyDefaults: {
      year_built: 1890,
      stories: 2,
      bedrooms: 4,
      bathrooms: 3,
      parking_score: 7,
      travel_score: 5,
    },
    profile: profile({
      hardwood_probability: 0.75,
      glass_showers: 0.55,
      historic_trim: 0.85,
      clutter_prior: 0.4,
    }),
    explanation:
      "Historic homes raise trim and finish complexity; parking and tall ceilings add labor units.",
  },
  {
    id: "audubon",
    name: "Audubon",
    geo_id: "nsa:orleans:audubon_-_university",
    averageSqft: 2800,
    propertyDefaults: {
      year_built: 1920,
      stories: 2,
      bedrooms: 4,
      bathrooms: 3,
      parking_score: 5,
      travel_score: 4,
    },
    profile: profile({
      hardwood_probability: 0.7,
      glass_showers: 0.5,
      historic_trim: 0.7,
      clutter_prior: 0.35,
    }),
    explanation:
      "University-area historic stock with elevated hardwood and trim priors.",
  },
  {
    id: "uptown",
    name: "Uptown",
    geo_id: "nsa:orleans:uptown",
    averageSqft: 2400,
    propertyDefaults: {
      year_built: 1935,
      stories: 2,
      bedrooms: 3,
      bathrooms: 2,
      parking_score: 6,
      travel_score: 4,
    },
    profile: profile({
      hardwood_probability: 0.65,
      glass_showers: 0.45,
      historic_trim: 0.55,
      clutter_prior: 0.4,
    }),
    explanation:
      "Mixed historic and renovated homes with moderate layout and density complexity.",
  },
  {
    id: "touro",
    name: "Touro",
    geo_id: "nsa:orleans:touro",
    averageSqft: 2100,
    propertyDefaults: {
      year_built: 1945,
      stories: 2,
      bedrooms: 3,
      bathrooms: 2,
      parking_score: 6,
      travel_score: 4,
    },
    profile: profile({
      hardwood_probability: 0.55,
      glass_showers: 0.4,
      historic_trim: 0.45,
      clutter_prior: 0.4,
    }),
    explanation: "Compact urban lots with mid-century stock and street-parking friction.",
  },
  {
    id: "central-business-district",
    name: "Central Business District",
    geo_id: "nsa:orleans:central_business_district",
    averageSqft: 1400,
    propertyDefaults: {
      year_built: 1995,
      stories: 1,
      bedrooms: 2,
      bathrooms: 2,
      parking_score: 8,
      travel_score: 5,
    },
    profile: profile({
      hardwood_probability: 0.3,
      tile_probability: 0.45,
      glass_showers: 0.5,
      historic_trim: 0.15,
      clutter_prior: 0.35,
    }),
    explanation:
      "Condo and loft layouts with higher parking/travel scores and lower historic trim.",
  },
  {
    id: "lakeview",
    name: "Lakeview",
    geo_id: "nsa:orleans:lakeview",
    averageSqft: 2300,
    propertyDefaults: {
      year_built: 1965,
      stories: 1,
      bedrooms: 3,
      bathrooms: 2,
      parking_score: 4,
      travel_score: 4,
    },
    profile: profile({
      hardwood_probability: 0.4,
      glass_showers: 0.4,
      historic_trim: 0.25,
      clutter_prior: 0.35,
    }),
    explanation: "Post-rebuild suburban stock with open plans and easier crew access.",
  },
  {
    id: "french-quarter",
    name: "French Quarter",
    geo_id: "nsa:orleans:french_quarter",
    averageSqft: 1600,
    propertyDefaults: {
      year_built: 1850,
      stories: 2,
      bedrooms: 2,
      bathrooms: 2,
      parking_score: 9,
      travel_score: 6,
    },
    profile: profile({
      hardwood_probability: 0.6,
      glass_showers: 0.35,
      historic_trim: 0.9,
      clutter_prior: 0.45,
    }),
    explanation:
      "Very high historic and parking complexity; narrow access increases travel and density scores.",
  },
  {
    id: "mandeville",
    name: "Mandeville",
    geo_id: "nsa:st_tammany:mandeville",
    averageSqft: 2500,
    propertyDefaults: {
      year_built: 1990,
      stories: 1,
      bedrooms: 4,
      bathrooms: 3,
      parking_score: 2,
      travel_score: 6,
    },
    profile: profile({
      hardwood_probability: 0.4,
      glass_showers: 0.5,
      historic_trim: 0.15,
      clutter_prior: 0.3,
    }),
    explanation: "Northshore suburban homes with low parking friction but longer travel.",
  },
  {
    id: "covington",
    name: "Covington",
    geo_id: "nsa:st_tammany:covington",
    averageSqft: 2400,
    propertyDefaults: {
      year_built: 1985,
      stories: 1,
      bedrooms: 3,
      bathrooms: 2,
      parking_score: 2,
      travel_score: 7,
    },
    profile: profile({
      hardwood_probability: 0.35,
      glass_showers: 0.45,
      historic_trim: 0.2,
      clutter_prior: 0.3,
    }),
    explanation: "Consistent suburban layouts with elevated Northshore travel scores.",
  },
];

export function getCieNeighborhood(id: string): NeighborhoodCieConfig {
  return cieNeighborhoods.find((n) => n.id === id) ?? cieNeighborhoods[0];
}
