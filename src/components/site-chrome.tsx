import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Globe2, Menu, ShieldCheck, ShoppingCart, X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { isAdminUnlocked } from "@/lib/admin-gate";
import { useCart } from "@/lib/cart";
import { settingsMap, settingsQuery } from "@/lib/store";

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
  const cart = useCart();
  const settings = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);

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
          {NAV.map((item) => <Link key={item.to} to={item.to} className="rounded px-3 py-2 text-sm hover:bg-accent">{item.label}</Link>)}
        </nav>
      )}
    </header>
  );
}

/** Right-hand column: store links and quick help. */
export function ShopSidebar() {
  const links = [
    { label: "Browse proxy inventory", to: "/" },
    { label: "Order tracking", to: "/order-tracking" },
    { label: "Payment & delivery", to: "/payment-and-delivery" },
    { label: "How delivery works", to: "/delivery-method" },
    { label: "Delivery time", to: "/delivery-time" },
    { label: "Setup & access", to: "/shipping-and-packaging" },
    { label: "About us", to: "/about" },
    { label: "Contact support", to: "/contact" },
  ] as const;

  return (
    <aside className="w-full lg:w-72 shrink-0 space-y-8 text-sm">
      <section>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase border-b border-border pb-2">
          Store links
        </h3>
        <ul className="mt-3 space-y-1">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="block pl-3 py-1 border-b border-border/60 text-foreground/75 hover:text-primary"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase border-b border-border pb-2">
          Quick help
        </h3>
        <div className="mt-3 space-y-2 text-xs text-muted-foreground">
          <p className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Crypto-only checkout — Bitcoin and Monero. No cards or accounts.</span>
          </p>
          <p className="flex items-start gap-2">
            <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>Every proxy is a private IP rented for a full 24 hours.</span>
          </p>
        </div>
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
