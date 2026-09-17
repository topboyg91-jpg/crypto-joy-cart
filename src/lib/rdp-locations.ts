/** Locations customers can pick when ordering an RDP plan. */
export type LocationRegion = {
  /** Country or US state name shown in the first dropdown. */
  area: string;
  /** Short code appended to the label, e.g. "TX" or "DE". */
  code: string;
  cities: string[];
};

export const USA_LOCATIONS: LocationRegion[] = [
  { area: "California", code: "CA", cities: ["Los Angeles", "San Jose", "San Francisco", "Sacramento"] },
  { area: "Texas", code: "TX", cities: ["Dallas", "Houston", "Austin", "San Antonio"] },
  { area: "New York", code: "NY", cities: ["New York City", "Buffalo", "Albany"] },
  { area: "Florida", code: "FL", cities: ["Miami", "Orlando", "Tampa", "Jacksonville"] },
  { area: "Illinois", code: "IL", cities: ["Chicago", "Springfield"] },
  { area: "Georgia", code: "GA", cities: ["Atlanta", "Savannah"] },
  { area: "Washington", code: "WA", cities: ["Seattle", "Spokane"] },
  { area: "Arizona", code: "AZ", cities: ["Phoenix", "Tucson"] },
  { area: "Colorado", code: "CO", cities: ["Denver", "Colorado Springs"] },
  { area: "New Jersey", code: "NJ", cities: ["Newark", "Jersey City"] },
  { area: "Virginia", code: "VA", cities: ["Ashburn", "Richmond"] },
  { area: "Nevada", code: "NV", cities: ["Las Vegas", "Reno"] },
  { area: "Ohio", code: "OH", cities: ["Columbus", "Cleveland"] },
  { area: "Michigan", code: "MI", cities: ["Detroit", "Grand Rapids"] },
  { area: "Massachusetts", code: "MA", cities: ["Boston", "Worcester"] },
];

export const EUROPE_LOCATIONS: LocationRegion[] = [
  { area: "Germany", code: "DE", cities: ["Frankfurt", "Berlin", "Munich", "Nuremberg"] },
  { area: "Netherlands", code: "NL", cities: ["Amsterdam", "Rotterdam"] },
  { area: "United Kingdom", code: "UK", cities: ["London", "Manchester"] },
  { area: "France", code: "FR", cities: ["Paris", "Marseille", "Lyon"] },
  { area: "Spain", code: "ES", cities: ["Madrid", "Barcelona"] },
  { area: "Italy", code: "IT", cities: ["Milan", "Rome"] },
  { area: "Poland", code: "PL", cities: ["Warsaw", "Krakow"] },
  { area: "Sweden", code: "SE", cities: ["Stockholm"] },
  { area: "Switzerland", code: "CH", cities: ["Zurich", "Geneva"] },
  { area: "Romania", code: "RO", cities: ["Bucharest"] },
];

export const ASIA_LOCATIONS: LocationRegion[] = [
  { area: "Singapore", code: "SG", cities: ["Singapore"] },
  { area: "Japan", code: "JP", cities: ["Tokyo", "Osaka"] },
  { area: "Hong Kong", code: "HK", cities: ["Hong Kong"] },
  { area: "South Korea", code: "KR", cities: ["Seoul"] },
  { area: "India", code: "IN", cities: ["Mumbai", "Bangalore", "Delhi"] },
  { area: "UAE", code: "AE", cities: ["Dubai"] },
  { area: "Indonesia", code: "ID", cities: ["Jakarta"] },
];

/** Picks the location set that matches a plan, falling back to every location. */
export function locationsForPlan(slugOrName: string): LocationRegion[] {
  const key = slugOrName.toLowerCase();
  if (key.includes("usa") || key.includes("united states")) return USA_LOCATIONS;
  if (key.includes("europe")) return EUROPE_LOCATIONS;
  if (key.includes("asia")) return ASIA_LOCATIONS;
  return [...USA_LOCATIONS, ...EUROPE_LOCATIONS, ...ASIA_LOCATIONS];
}

export function locationLabel(region: LocationRegion, city: string): string {
  return `${city}, ${region.code}`;
}
