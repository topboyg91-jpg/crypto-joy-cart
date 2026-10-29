/**
 * 24-hour proxy inventory.
 *
 * The storefront sells fixed 24-hour proxy slots. When an external
 * provisioning API is wired up, this module becomes the seam: replace the
 * static array with a fetch from the provider (or a cached copy) and keep the
 * ProxyListing shape so the store, cart and checkout keep working unchanged.
 */

export type ProxyType = "Residential" | "Datacenter" | "Mobile";

export type ProxyListing = {
  id: string;
  name: string;
  type: ProxyType;
  countryGroup: "usa" | "europe" | "asia";
  country: string;
  /** State (USA) or region (elsewhere). */
  region: string;
  city: string;
  protocol: string;
  speed: string;
  /** Slots available in the next 24-hour window. */
  ips: number;
  /** USD price for one 24-hour proxy. */
  price: number;
};

export const PROXY_LISTINGS: ProxyListing[] = [
  // United States
  { id: "usa-dallas-res", name: "Dallas Residential", type: "Residential", countryGroup: "usa", country: "United States", region: "Texas", city: "Dallas", protocol: "SOCKS5 / HTTPS", speed: "1 Gbps", ips: 12, price: 4.5 },
  { id: "usa-nyc-res", name: "New York Residential", type: "Residential", countryGroup: "usa", country: "United States", region: "New York", city: "New York City", protocol: "SOCKS5 / HTTPS", speed: "500 Mbps", ips: 8, price: 6 },
  { id: "usa-miami-res", name: "Miami Residential", type: "Residential", countryGroup: "usa", country: "United States", region: "Florida", city: "Miami", protocol: "SOCKS5 / HTTPS", speed: "500 Mbps", ips: 10, price: 5.25 },
  { id: "usa-la-mobile", name: "Los Angeles Mobile 4G", type: "Mobile", countryGroup: "usa", country: "United States", region: "California", city: "Los Angeles", protocol: "SOCKS5", speed: "1 Gbps", ips: 6, price: 7.5 },
  { id: "usa-ashburn-dc", name: "Ashburn Datacenter", type: "Datacenter", countryGroup: "usa", country: "United States", region: "Virginia", city: "Ashburn", protocol: "SOCKS5", speed: "1 Gbps", ips: 24, price: 2.25 },
  { id: "usa-chicago-dc", name: "Chicago Datacenter", type: "Datacenter", countryGroup: "usa", country: "United States", region: "Illinois", city: "Chicago", protocol: "SOCKS5 / HTTPS", speed: "1 Gbps", ips: 16, price: 2 },
  // Europe
  { id: "eu-frankfurt-dc", name: "Frankfurt Datacenter", type: "Datacenter", countryGroup: "europe", country: "Germany", region: "Hesse", city: "Frankfurt", protocol: "SOCKS5 / HTTPS", speed: "1 Gbps", ips: 30, price: 2 },
  { id: "eu-amsterdam-res", name: "Amsterdam Residential", type: "Residential", countryGroup: "europe", country: "Netherlands", region: "North Holland", city: "Amsterdam", protocol: "SOCKS5 / HTTPS", speed: "500 Mbps", ips: 14, price: 4.75 },
  { id: "eu-london-res", name: "London Residential", type: "Residential", countryGroup: "europe", country: "United Kingdom", region: "England", city: "London", protocol: "SOCKS5 / HTTPS", speed: "1 Gbps", ips: 9, price: 5.5 },
  { id: "eu-paris-dc", name: "Paris Datacenter", type: "Datacenter", countryGroup: "europe", country: "France", region: "Île-de-France", city: "Paris", protocol: "SOCKS5", speed: "1 Gbps", ips: 18, price: 2.25 },
  { id: "eu-zurich-res", name: "Zurich Residential", type: "Residential", countryGroup: "europe", country: "Switzerland", region: "Zurich", city: "Zurich", protocol: "SOCKS5 / HTTPS", speed: "500 Mbps", ips: 5, price: 6.25 },
  { id: "eu-warsaw-dc", name: "Warsaw Datacenter", type: "Datacenter", countryGroup: "europe", country: "Poland", region: "Masovia", city: "Warsaw", protocol: "SOCKS5", speed: "1 Gbps", ips: 20, price: 1.75 },
  // Asia
  { id: "ap-singapore-dc", name: "Singapore Datacenter", type: "Datacenter", countryGroup: "asia", country: "Singapore", region: "Singapore", city: "Singapore", protocol: "SOCKS5 / HTTPS", speed: "1 Gbps", ips: 22, price: 2.5 },
  { id: "ap-tokyo-res", name: "Tokyo Residential", type: "Residential", countryGroup: "asia", country: "Japan", region: "Kanto", city: "Tokyo", protocol: "SOCKS5 / HTTPS", speed: "1 Gbps", ips: 7, price: 6.5 },
  { id: "ap-hongkong-dc", name: "Hong Kong Datacenter", type: "Datacenter", countryGroup: "asia", country: "Hong Kong", region: "Hong Kong", city: "Hong Kong", protocol: "SOCKS5", speed: "1 Gbps", ips: 12, price: 3.25 },
  { id: "ap-mumbai-mobile", name: "Mumbai Mobile 4G", type: "Mobile", countryGroup: "asia", country: "India", region: "Maharashtra", city: "Mumbai", protocol: "SOCKS5", speed: "500 Mbps", ips: 8, price: 5 },
];

export const COUNTRY_GROUPS = [
  { value: "usa", label: "United States" },
  { value: "europe", label: "Europe" },
  { value: "asia", label: "Asia" },
] as const;

export function getListing(id: string): ProxyListing | undefined {
  return PROXY_LISTINGS.find((l) => l.id === id);
}

export function locationLabel(listing: ProxyListing): string {
  return `${listing.city}, ${listing.region}`;
}
