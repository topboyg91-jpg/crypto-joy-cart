import { createFileRoute, Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { PageWithSidebar, useSettings } from "@/components/site-chrome";
import { useCart } from "@/lib/cart";
import { money } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — review your proxies" },
      { name: "description", content: "Review the proxies in your basket before checking out." },
      { property: "og:title", content: "Your cart" },
      { property: "og:description", content: "Review your order before checkout." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const settings = useSettings();
  const symbol = settings.currency_symbol ?? "$";

  return (
    <PageWithSidebar>
      <h2 className="text-3xl font-bold text-primary">Your cart</h2>

      {cart.hydrated && cart.items.length === 0 && (
        <div className="mt-8 bg-card/95 border border-border rounded p-8 text-center">
          <p className="text-sm text-foreground/70">Your cart is empty.</p>
          <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
            Browse proxy inventory
          </Link>
        </div>
      )}

      {cart.items.length > 0 && (
        <>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm bg-card/95 border border-border rounded">
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th className="px-4 py-2 font-semibold">Proxy</th>
                  <th className="px-4 py-2 font-semibold">Location</th>
                  <th className="px-4 py-2 font-semibold">Term</th>
                  <th className="px-4 py-2 font-semibold">Price</th>
                  <th className="px-4 py-2 font-semibold">Qty</th>
                  <th className="px-4 py-2 font-semibold">Subtotal</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {cart.items.map((i) => (
                  <tr key={i.listingId} className="border-t border-border">
                    <td className="px-4 py-3">
                      {i.name}
                      <span className="block text-xs text-muted-foreground">{i.type}</span>
                    </td>
                    <td className="px-4 py-3">{i.location}</td>
                    <td className="px-4 py-3">24 hours</td>
                    <td className="px-4 py-3">{money(i.price, symbol)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={i.quantity}
                        aria-label={`Quantity for ${i.name}`}
                        onChange={(e) => cart.setQuantity(i.listingId, Number(e.target.value) || 0)}
                        className="w-16 px-2 py-1 border border-border rounded bg-card"
                      />
                    </td>
                    <td className="px-4 py-3">{money(i.price * i.quantity, symbol)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => cart.remove(i.listingId)}
                        aria-label={`Remove ${i.name}`}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border">
                  <td colSpan={5} className="px-4 py-3 text-right font-semibold">Total</td>
                  <td colSpan={2} className="px-4 py-3 text-primary font-semibold">{money(cart.subtotal, symbol)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              to="/checkout"
              className="px-6 py-2 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90 transition"
            >
              Checkout
            </Link>
            <Link to="/" className="px-4 py-2 border border-border rounded text-sm hover:bg-accent transition">
              Keep browsing
            </Link>
          </div>
        </>
      )}
    </PageWithSidebar>
  );
}
