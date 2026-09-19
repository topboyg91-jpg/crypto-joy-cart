import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe2, Menu, Search, ShieldCheck, ShoppingCart, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { isAdminUnlocked } from "@/lib/admin-gate";
import { useCart } from "@/lib/cart";
import { ProductImage } from "@/lib/product-image";
import {
  categoriesQuery,
  money,
  priceRange,
  productsQuery,
  settingsMap,
  settingsQuery,
} from "@/lib/store";

/** Admin link only appears once this browser has unlocked the admin password. */
function AdminFooterLink() {
  const [show, setShow] = useState(false);
  useEffect(() => setShow(isAdminUnlocked()), []);
  if (!show) return null;
  return (
    <Link to="/admin" className="text-primary hover:underline">
      Admin
    </Link>
  );
}

const NAV = [
  { label: "HOME", to: "/" },
  { label: "ORDER TRACKING", to: "/order-tracking" },
  { label: "PAYMENT & DELIVERY", to: "/payment-and-delivery" },
  { label: "HOW DELIVERY WORKS", to: "/delivery-method" },
  { label: "DELIVERY TIME", to: "/delivery-time" },
  { label: "SETUP & ACCESS", to: "/shipping-and-packaging" },
  { label: "ABOUT US", to: "/about" },
  { label: "CONTACT US", to: "/contact" },
  { label: "MESSAGE TRACKING", to: "/message-tracking" },

] as const;

export function useSettings() {
  const { data } = useQuery(settingsQuery);
  return settingsMap(data);
}

export function SiteHeader() {
  const navigate = useNavigate();
  const cart = useCart();
  const settings = useSettings();
  const { data: categories } = useQuery(categoriesQuery);
  const [term, setTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/", search: { q: term || undefined, category: category === "all" ? undefined : category } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-5 px-5">
        <Link to="/" className="mr-auto flex items-center gap-3 text-primary">
          <span className="grid h-10 w-10 place-items-center rounded border border-primary/50 bg-primary/10">
            <Globe2 className="h-5 w-5" />
          </span>
          <span className="text-lg font-black uppercase tracking-[0.16em]">{settings.store_name || "DeepProxy"}</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex text-sm text-muted-foreground">
          <Link to="/" className="text-primary">Proxy store</Link>
          <Link to="/order-tracking" className="hover:text-foreground">Orders</Link>
          <Link to="/payment-and-delivery" className="hover:text-foreground">Delivery</Link>
          <Link to="/contact" className="hover:text-foreground">Support</Link>
        </nav>
        <Link to="/cart" className="relative flex h-10 items-center gap-2 rounded border border-primary/60 px-4 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground">
          <ShoppingCart className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {cart.count > 0 && <span className="rounded bg-primary px-1.5 text-xs text-primary-foreground">{cart.count}</span>}
        </Link>
        <button onClick={() => setMenuOpen((v) => !v)} className="grid h-10 w-10 place-items-center rounded border border-border lg:hidden" aria-label="Toggle menu">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {menuOpen && (
        <nav className="grid gap-1 border-t border-border bg-card px-5 py-4 lg:hidden">
          {NAV.slice(0, 8).map((item) => <Link key={item.to} to={item.to} className="rounded px-3 py-2 text-sm hover:bg-accent">{item.label}</Link>)}
        </nav>
      )}
      <div className="hidden">
        <form onSubmit={submit}>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {(categories ?? []).map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <input value={term} onChange={(e) => setTerm(e.target.value)} />
          <button type="submit"><Search /></button>
        </form>
      </div>
    </header>
  );
}

/** Right-hand column: search, grouped categories and a product list. */
export function ShopSidebar() {
  const navigate = useNavigate();
  const settings = useSettings();
  const symbol = settings.currency_symbol ?? "$";
  const { data: categories } = useQuery(categoriesQuery);
  const { data: products } = useQuery(productsQuery);
  const [term, setTerm] = useState("");

  const groups = new Map<string, typeof categories>();
  for (const c of categories ?? []) {
    if (!c.is_active) continue;
    const list = groups.get(c.group_label) ?? [];
    list.push(c);
    groups.set(c.group_label, list);
  }

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-8 text-sm">
      <section>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase border-b border-border pb-2">
          Search products
        </h3>
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/", search: { q: term || undefined } });
          }}
        >
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={settings.search_placeholder ?? "Search…"}
            aria-label="Search products"
            className="flex-1 min-w-0 px-3 py-1.5 border border-border rounded bg-card outline-none"
          />
          <button className="px-4 py-1.5 bg-primary text-primary-foreground rounded text-xs font-semibold">
            Search
          </button>
        </form>
      </section>

      <section>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase border-b border-border pb-2">
          RDP categories
        </h3>
        <div className="mt-3 space-y-4">
          {[...groups.entries()].map(([group, list]) => (
            <div key={group}>
              <p className="text-primary font-semibold">{group}</p>
              <ul className="mt-1 space-y-1">
                {(list ?? []).map((c) => (
                  <li key={c.id}>
                    <Link
                      to="/"
                      search={{ category: c.slug }}
                      className="block pl-3 py-1 border-b border-border/60 text-foreground/75 hover:text-primary"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase border-b border-border pb-2">
          Popular plans
        </h3>
        <ul className="mt-3 space-y-3">
          {(products ?? [])
            .filter((p) => p.is_active)
            .slice(0, 5)
            .map((p) => (
              <li key={p.id}>
                <Link to="/product/$slug" params={{ slug: p.slug }} className="flex gap-3 group">
                  <ProductImage src={p.image_url} name={p.name} className="block h-12 w-12 shrink-0 rounded" />
                  <span className="min-w-0">
                    <span className="block text-primary font-semibold text-[13px] leading-tight group-hover:underline">
                      {p.name}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{priceRange(p, symbol)}</span>
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </aside>
  );
}

export function SiteFooter() {
  const settings = useSettings();
  return (
    <footer className="border-t border-border bg-card mt-10">
      <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>{settings.footer_text ?? ""}</p>
        <div className="flex gap-4">
          <Link to="/payment-and-delivery" className="text-primary hover:underline">
            Payment
          </Link>
          <Link to="/order-tracking" className="text-primary hover:underline">
            Track order
          </Link>
          <AdminFooterLink />
        </div>
      </div>
    </footer>
  );
}

export function PageBackground({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex flex-col bg-background">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}

/** Page shell with the shop sidebar on the right, like the storefront layout. */
export function PageWithSidebar({ children }: { children: ReactNode }) {
  return (
    <PageBackground>
      <main className="mx-auto max-w-7xl px-6 py-8 flex flex-col lg:flex-row gap-10">
        <div className="flex-1 min-w-0">{children}</div>
        <ShopSidebar />
      </main>
    </PageBackground>
  );
}

/** Simple content page shell used by the informational routes. */
export function InfoPage({ title, lead, children }: { title: string; lead?: string; children: ReactNode }) {
  return (
    <PageBackground>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h2 className="text-3xl font-bold text-primary">{title}</h2>
        {lead && <p className="mt-3 text-foreground/70">{lead}</p>}
        <div className="mt-8 space-y-6">{children}</div>
      </main>
    </PageBackground>
  );
}

export function InfoCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-card/90 backdrop-blur border border-border rounded p-5">
      <h3 className="font-semibold text-primary">{title}</h3>
      <div className="mt-2 text-sm text-foreground/75 space-y-2">{children}</div>
    </section>
  );
}

/** Renders the lightweight markdown used by editable content pages. */
export function RichText({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-sm text-foreground/80">
      {blocks.map((block, i) => (
        <p key={i} className="leading-relaxed">
          {block.split("\n").map((line, j) => (
            <span key={j} className="block">
              {renderInline(line)}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

function renderInline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="text-foreground font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}
