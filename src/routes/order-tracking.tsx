import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageWithSidebar, useSettings } from "@/components/site-chrome";
import { CopyableAddress, PaymentQr } from "@/components/crypto-payment";
import { PaymentConfirmForm, REPORTED_STATUS } from "@/components/payment-confirm";
import { supabase } from "@/integrations/supabase/client";
import { money, type OrderRow } from "@/lib/store";

type Item = {
  name: string;
  type: string;
  location: string;
  protocol: string;
  speed: string;
  price: number;
  quantity: number;
};

export const Route = createFileRoute("/order-tracking")({
  head: () => ({
    meta: [
      { title: "Order tracking — check your proxy order status" },
      { name: "description", content: "Look up an order by order number or email address to see its current status." },
      { property: "og:title", content: "Order tracking" },
      { property: "og:description", content: "Look up an order by number or email." },
      { property: "og:url", content: "https://www.deepshop.space/order-tracking" },
    ],
    links: [{ rel: "canonical", href: "https://www.deepshop.space/order-tracking" }],
  }),
  component: OrderTrackingPage,
});

function OrderTrackingPage() {
  const settings = useSettings();
  const symbol = settings.currency_symbol ?? "$";
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    setOrder(null);
    const { data } = await supabase
      .from("orders")
      .select("*")
      .or(`order_number.eq.${q},email.eq.${q}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .returns<OrderRow[]>();
    setOrder(data?.[0] ?? null);
    setLoading(false);
  };

  const items: Item[] = Array.isArray(order?.items) ? (order!.items as unknown as Item[]) : [];

  return (
    <PageWithSidebar>
      <h2 className="text-3xl font-bold text-primary">Order tracking</h2>
      <p className="mt-2 text-sm text-foreground/70">Enter your order number or the email you ordered with.</p>

      <form onSubmit={search} className="mt-6 flex gap-2 max-w-md">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="PX-XXXXXX or email"
          aria-label="Order number or email"
          className="flex-1 px-3 py-2 border border-border rounded bg-card text-sm"
        />
        <button className="px-5 bg-primary text-primary-foreground rounded text-sm font-medium">Track</button>
      </form>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Searching…</p>}

      {!loading && searched && !order && (
        <p className="mt-6 text-sm text-muted-foreground">No order found for that reference.</p>
      )}

      {!loading && order && (
        <div className="mt-8 bg-card/95 border border-border rounded p-6 text-sm space-y-4">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-muted-foreground">Order number</p>
              <p className="text-lg font-semibold text-primary">{order.order_number}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Status</p>
              <p className="font-semibold">{order.status}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Placed</p>
              <p>{new Date(order.created_at).toLocaleString()}</p>
            </div>
          </div>

          <table className="w-full border border-border">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Proxy</th>
                <th className="px-3 py-2 font-semibold">Location</th>
                <th className="px-3 py-2 font-semibold">Qty</th>
                <th className="px-3 py-2 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i, idx) => (
                <tr key={`${i.name}-${idx}`} className="border-t border-border">
                  <td className="px-3 py-2">
                    {i.name} <span className="text-muted-foreground">({i.type}, 24h)</span>
                  </td>
                  <td className="px-3 py-2">{i.location}</td>
                  <td className="px-3 py-2">{i.quantity}</td>
                  <td className="px-3 py-2">{money(Number(i.price) * i.quantity, symbol)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="font-semibold">Total {money(Number(order.total), symbol)}</p>

          <div className="border-t border-border pt-4">
            <p className="text-muted-foreground">Payment</p>
            <div className="mt-2 flex flex-wrap items-start gap-6">
              <div className="min-w-0 flex-1 space-y-2">
                <CopyableAddress value={order.payment_address} />
                <p className="text-muted-foreground">
                  Send {money(Number(order.total), symbol)} worth of {order.payment_code}
                </p>
              </div>
              <PaymentQr code={order.payment_code} address={order.payment_address} size={116} />
            </div>
            {order.status !== "Awaiting payment" && order.status !== REPORTED_STATUS && (
              <p className="mt-3 text-primary font-semibold">Payment confirmed — your proxies were delivered by email.</p>
            )}
            {(order.status === "Awaiting payment" || order.status === REPORTED_STATUS) && (
              <div className="mt-3">
                <PaymentConfirmForm orderNumber={order.order_number} />
              </div>
            )}
          </div>
        </div>
      )}

      <Link to="/" className="mt-8 inline-block text-sm text-primary hover:underline">
        Back to the proxy store
      </Link>
    </PageWithSidebar>
  );
}
