import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe2, Gauge, MapPin, Search, ShieldCheck, Wifi } from "lucide-react";
import { useMemo, useState } from "react";
import { PageBackground, useSettings } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { categoriesQuery, money, productsQuery } from "@/lib/store";
import { locationsForPlan } from "@/lib/rdp-locations";

type ShopSearch = { q?: string; category?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    q: typeof search.q === "string" && search.q ? search.q : undefined,
    category: typeof search.category === "string" && search.category ? search.category : undefined,
  }),
  head: () => ({
    meta: [
      { title: "DeepProxy — residential and datacenter proxy store" },
      { name: "description", content: "Buy private residential and datacenter proxies by country, state, and city with crypto checkout." },
      { property: "og:title", content: "DeepProxy — private proxy inventory" },
      { property: "og:description", content: "Location-targeted private proxies with instant access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://www.deepshop.space/" },
    ],
    links: [{ rel: "canonical", href: "https://www.deepshop.space/" }],
  }),
  component: ProxyStore,
});

function ProxyStore() {
  const settings = useSettings();
  const symbol = settings.currency_symbol ?? "$";
  const { data: products, isLoading } = useQuery(productsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const [country, setCountry] = useState("all");
  const [state, setState] = useState("all");
  const [city, setCity] = useState("all");
  const [network, setNetwork] = useState("all");
  const [query, setQuery] = useState("");

  const active = (products ?? []).filter((product) => product.is_active);
  const regions = useMemo(() => {
    const seen = new Map<string, ReturnType<typeof locationsForPlan>[number]>();
    for (const product of active) {
      for (const region of locationsForPlan(product.slug)) seen.set(`${region.area}-${region.code}`, region);
    }
    return [...seen.values()];
  }, [active]);
  const countries = [
    { value: "usa", label: "United States" },
    { value: "europe", label: "Europe" },
    { value: "asia", label: "Asia" },
  ];
  const matchingRegions = country === "all"
    ? regions
    : regions.filter((region) => {
        const pool = locationsForPlan(country);
        return pool.some((candidate) => candidate.code === region.code);
      });
  const matchingCities = state === "all" ? [] : matchingRegions.find((region) => region.code === state)?.cities ?? [];
  const visible = active.filter((product) => {
    const text = `${product.name} ${product.description}`.toLowerCase();
    if (query && !text.includes(query.toLowerCase())) return false;
    if (country !== "all" && !product.slug.includes(country) && !product.name.toLowerCase().includes(country)) return false;
    if (network !== "all" && !text.includes(network)) return false;
    return true;
  });

  return (
    <PageBackground>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.25fr_0.75fr] lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-3 py-1.5 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" /> Private access available
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
              Premium <span className="text-primary">Residential Proxies</span><br />from around the world
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Choose a country, state, and city. Get private access with clear terms and crypto payment.
            </p>
            <Button asChild className="mt-7 h-12 px-7 font-black"><a href="#inventory">Browse inventory</a></Button>
          </div>
          <div className="grid content-center gap-3">
            {[
              [Globe2, "Global coverage", "USA, Europe and Asia"],
              [Wifi, "Residential & datacenter", "Private connections"],
              [ShieldCheck, "Secure checkout", "Bitcoin and Monero"],
            ].map(([Icon, title, copy]) => (
              <div key={String(title)} className="flex items-center gap-4 rounded border border-border bg-background/60 p-4">
                <span className="grid h-11 w-11 place-items-center rounded border border-primary/40 bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                <div><p className="font-bold">{String(title)}</p><p className="text-sm text-muted-foreground">{String(copy)}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main id="inventory" className="mx-auto w-full max-w-7xl px-5 py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Live catalogue</p><h2 className="mt-1 text-3xl font-black">Proxy Store</h2></div>
          <p className="text-sm text-muted-foreground">{visible.length} plans available</p>
        </div>

        <div className="grid gap-3 rounded-t border border-border bg-panel p-4 text-primary-foreground md:grid-cols-2 lg:grid-cols-5">
          <select value={country} onChange={(e) => { setCountry(e.target.value); setState("all"); setCity("all"); }} aria-label="Country" className="h-11 rounded border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">All countries</option>{countries.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={state} onChange={(e) => { setState(e.target.value); setCity("all"); }} aria-label="State or country" className="h-11 rounded border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">All states / regions</option>{matchingRegions.map((region) => <option key={region.code} value={region.code}>{region.area}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City" className="h-11 rounded border border-border bg-background px-3 text-sm text-foreground" disabled={state === "all"}>
            <option value="all">All cities</option>{matchingCities.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select value={network} onChange={(e) => setNetwork(e.target.value)} aria-label="Proxy type" className="h-11 rounded border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">All proxy types</option><option value="residential">Residential</option><option value="admin">Datacenter</option><option value="vps">VPS</option>
          </select>
          <label className="flex h-11 items-center gap-2 rounded border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search inventory" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" />
          </label>
        </div>

        <div className="overflow-x-auto rounded-b border-x border-b border-border bg-panel text-primary-foreground">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-panel-strong text-xs uppercase text-foreground">
              <tr><th className="px-4 py-4">Plan</th><th className="px-4 py-4">Coverage</th><th className="px-4 py-4">Type</th><th className="px-4 py-4">Protocol</th><th className="px-4 py-4">Speed</th><th className="px-4 py-4">Price</th><th className="px-4 py-4" /></tr>
            </thead>
            <tbody className="text-panel-strong">
              {visible.map((product, index) => {
                const locations = locationsForPlan(product.slug);
                const tier = product.product_prices[0];
                const category = (categories ?? []).find((entry) => entry.id === product.category_id)?.name ?? "Private proxy";
                return (
                  <tr key={product.id} className="border-t border-border/50 hover:bg-background/5">
                    <td className="px-4 py-4"><p className="font-bold">{product.name}</p><p className="mt-1 text-xs opacity-65">Private access</p></td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{locations.length} regions</span></td>
                    <td className="px-4 py-4">{category}</td><td className="px-4 py-4">SOCKS5 / HTTPS</td>
                    <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 rounded border border-panel-strong/40 px-2 py-1"><Gauge className="h-4 w-4" />{index % 2 ? "1 Gbps" : "500 Mbps"}</span></td>
                    <td className="px-4 py-4 font-black">{tier ? money(Number(tier.price), symbol) : "—"}</td>
                    <td className="px-4 py-4"><Button asChild size="sm" className="w-full font-black"><Link to="/product/$slug" params={{ slug: product.slug }}>BUY</Link></Button></td>
                  </tr>
                );
              })}
              {!isLoading && visible.length === 0 && <tr><td colSpan={7} className="px-4 py-12 text-center">No proxy plans match these filters.</td></tr>}
              {isLoading && <tr><td colSpan={7} className="px-4 py-12 text-center">Loading inventory…</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </PageBackground>
  );
}