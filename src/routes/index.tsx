import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Gauge, MapPin, Search, ShieldCheck, Timer, Wifi } from "lucide-react";
import { PageBackground, useSettings } from "@/components/site-chrome";
import { Button } from "@/components/ui/button";
import { useCart, cartItemFromListing } from "@/lib/cart";
import { COUNTRY_GROUPS, PROXY_LISTINGS, type ProxyListing } from "@/lib/proxy-inventory";
import { money } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DeepProxy — 24-hour residential, datacenter & mobile proxies" },
      { name: "description", content: "Buy private 24-hour proxies by country, state, and city. Crypto checkout with Bitcoin and Monero." },
      { property: "og:title", content: "DeepProxy — 24-hour private proxy inventory" },
      { property: "og:description", content: "Location-targeted 24-hour proxies with instant access and crypto payment." },
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
  const cart = useCart();
  const navigate = useNavigate();
  const symbol = settings.currency_symbol ?? "$";
  const [country, setCountry] = useState("all");
  const [region, setRegion] = useState("all");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");

  const byCountry = useMemo(
    () => (country === "all" ? PROXY_LISTINGS : PROXY_LISTINGS.filter((l) => l.countryGroup === country)),
    [country],
  );
  const regionOptions = useMemo(
    () => [...new Set(byCountry.map((l) => l.region))].sort(),
    [byCountry],
  );
  const cityOptions = useMemo(
    () =>
      [...new Set((region === "all" ? byCountry : byCountry.filter((l) => l.region === region)).map((l) => l.city))].sort(),
    [byCountry, region],
  );
  const visible = byCountry
    .filter((l) => (region === "all" ? true : l.region === region))
    .filter((l) => (city === "all" ? true : l.city === city))
    .filter((l) => (type === "all" ? true : l.type === type))
    .filter((l) => {
      if (!query) return true;
      const text = `${l.name} ${l.city} ${l.region} ${l.country} ${l.type}`.toLowerCase();
      return text.includes(query.toLowerCase());
    });

  const buy = (listing: ProxyListing) => {
    cart.add(cartItemFromListing(listing));
    navigate({ to: "/checkout" });
  };

  return (
    <PageBackground>
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.25fr_0.75fr] lg:py-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/50 px-3 py-1.5 text-xs font-bold text-primary">
              <Timer className="h-4 w-4" /> 24-hour proxies — no subscriptions
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">
              Premium <span className="text-primary">24-Hour Proxies</span><br />from around the world
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              Pick a country, state, and city. Each proxy runs for exactly 24 hours — pay in crypto and get instant access.
            </p>
            <Button asChild className="mt-7 h-12 px-7 font-black"><a href="#inventory">Browse inventory</a></Button>
          </div>
          <div className="grid content-center gap-3">
            {[
              [Globe2Icon, "Global coverage", "USA, Europe and Asia"],
              [Wifi, "Residential, datacenter & mobile", "Private connections"],
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
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Live inventory</p><h2 className="mt-1 text-3xl font-black">Proxy Store</h2></div>
          <p className="text-sm text-muted-foreground">{visible.length} proxies available for the next 24 hours</p>
        </div>

        <div className="grid gap-3 rounded-t border border-border bg-panel p-4 text-primary-foreground md:grid-cols-2 lg:grid-cols-5">
          <select value={country} onChange={(e) => { setCountry(e.target.value); setRegion("all"); setCity("all"); }} aria-label="Country" className="h-11 rounded border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">All countries</option>{COUNTRY_GROUPS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={region} onChange={(e) => { setRegion(e.target.value); setCity("all"); }} aria-label="State or region" className="h-11 rounded border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">All states / regions</option>{regionOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select value={city} onChange={(e) => setCity(e.target.value)} aria-label="City" className="h-11 rounded border border-border bg-background px-3 text-sm text-foreground" disabled={region === "all"}>
            <option value="all">All cities</option>{cityOptions.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} aria-label="Proxy type" className="h-11 rounded border border-border bg-background px-3 text-sm text-foreground">
            <option value="all">All proxy types</option><option value="Residential">Residential</option><option value="Datacenter">Datacenter</option><option value="Mobile">Mobile</option>
          </select>
          <label className="flex h-11 items-center gap-2 rounded border border-border bg-background px-3">
            <Search className="h-4 w-4 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search inventory" className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none" />
          </label>
        </div>

        <div className="overflow-x-auto rounded-b border-x border-b border-border bg-panel text-primary-foreground">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-panel-strong text-xs uppercase text-foreground">
              <tr><th className="px-4 py-4">Proxy</th><th className="px-4 py-4">Location</th><th className="px-4 py-4">Type</th><th className="px-4 py-4">Protocol</th><th className="px-4 py-4">Speed</th><th className="px-4 py-4">IPs</th><th className="px-4 py-4">Price / 24h</th><th className="px-4 py-4" /></tr>
            </thead>
            <tbody className="text-panel-strong">
              {visible.map((listing) => (
                <tr key={listing.id} className="border-t border-border/50 hover:bg-background/5">
                  <td className="px-4 py-4"><p className="font-bold">{listing.name}</p><p className="mt-1 text-xs opacity-65">24-hour access</p></td>
                  <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{listing.city}, {listing.region} — {listing.country}</span></td>
                  <td className="px-4 py-4">{listing.type}</td>
                  <td className="px-4 py-4">{listing.protocol}</td>
                  <td className="px-4 py-4"><span className="inline-flex items-center gap-1.5 rounded border border-panel-strong/40 px-2 py-1"><Gauge className="h-4 w-4" />{listing.speed}</span></td>
                  <td className="px-4 py-4">{listing.ips}</td>
                  <td className="px-4 py-4 font-black">{money(listing.price, symbol)}</td>
                  <td className="px-4 py-4"><Button size="sm" className="w-full font-black" onClick={() => buy(listing)}>BUY</Button></td>
                </tr>
              ))}
              {visible.length === 0 && <tr><td colSpan={8} className="px-4 py-12 text-center">No proxies match these filters.</td></tr>}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Every listing is a single private IP rented for 24 hours from payment confirmation. Replacement or refund is handled through <a className="text-primary hover:underline" href="/contact">support</a>.
        </p>
      </main>
    </PageBackground>
  );
}

function Globe2Icon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}
