import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { PageWithSidebar, useSettings } from "@/components/site-chrome";
import { CopyableAddress, PaymentQr } from "@/components/crypto-payment";
import { PaymentConfirmForm } from "@/components/payment-confirm";
import { useCart, type PlacedOrder } from "@/lib/cart";
import { money, paymentMethodsQuery } from "@/lib/store";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — pay for your 24-hour proxy in crypto" },
      {
        name: "description",
        content: "Enter your contact details and pay with Bitcoin or Monero for instant proxy access.",
      },
      { property: "og:title", content: "Checkout" },
      { property: "og:description", content: "Contact details and crypto payment." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const cart = useCart();
  const settings = useSettings();
  const symbol = settings.currency_symbol ?? "$";
  const { data: paymentMethods } = useQuery(paymentMethodsQuery);

  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<PlacedOrder | null>(null);

  const enabledPayments = (paymentMethods ?? []).filter((p) => p.is_enabled);

  useEffect(() => {
    if (!paymentId && enabledPayments.length) setPaymentId(enabledPayments[0].id);
  }, [enabledPayments, paymentId]);

  const payment = enabledPayments.find((p) => p.id === paymentId);
  const total = cart.subtotal;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "A valid email address is required.";
    if (!payment) next.payment = "Select a payment method.";
    if (cart.items.length === 0) next.cart = "Your cart is empty.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const order = await cart.placeOrder({
        email: email.trim(),
        telegram: telegram.trim(),
        notes: notes.trim(),
        paymentCode: payment!.code,
        paymentAddress: payment!.address,
      });
      setPlaced(order);
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Could not place the order." });
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <PageWithSidebar>
        <h2 className="text-3xl font-bold text-primary">Order received</h2>
        <p className="mt-3 text-sm text-foreground/70">
          Send exactly {money(placed.total, symbol)} worth of {placed.paymentCode} to the address below. Your proxy details
          go to {placed.email} once payment confirms.
        </p>
        <div className="mt-6 bg-card/95 border border-border rounded p-6 space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">Order number</p>
            <p className="text-lg font-semibold text-primary">{placed.orderNumber}</p>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="min-w-0">
                <p className="text-muted-foreground">{placed.paymentCode} address</p>
                <div className="mt-1">
                  <CopyableAddress value={placed.paymentAddress} />
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Amount due</p>
                <p className="font-semibold">{money(placed.total, symbol)}</p>
              </div>
            </div>
            <PaymentQr code={placed.paymentCode} address={placed.paymentAddress} />
          </div>
          <div className="border-t border-border pt-4">
            <PaymentConfirmForm orderNumber={placed.orderNumber} />
          </div>
        </div>
        <Link to="/order-tracking" className="mt-6 inline-block text-sm text-primary hover:underline">
          Track this order
        </Link>
      </PageWithSidebar>
    );
  }

  return (
    <PageWithSidebar>
      <h2 className="text-3xl font-bold">Checkout</h2>

      <form onSubmit={submit} className="mt-6">
        <section>
          <h3 className="text-primary font-semibold">Your details</h3>
          <div className="mt-4 max-w-md space-y-4">
            <Field label="Email address" required error={errors.email}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-card text-sm"
              />
            </Field>
            <Field label="Telegram or Jabber (optional)">
              <input
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded bg-card text-sm"
              />
            </Field>
            <Field label="Order notes (optional)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Notes for support, e.g. preferred delivery window."
                className="w-full px-3 py-2 border border-border rounded bg-card text-sm"
              />
            </Field>
          </div>
        </section>

        <h3 className="mt-10 text-primary font-semibold">Your order</h3>
        <table className="mt-3 w-full text-sm border border-border bg-card/95">
          <thead>
            <tr className="bg-muted/60 text-left">
              <th className="px-3 py-2 font-semibold border-b border-border">Proxy</th>
              <th className="px-3 py-2 font-semibold border-b border-border">Qty</th>
              <th className="px-3 py-2 font-semibold border-b border-border">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map((i) => (
              <tr key={i.listingId} className="border-b border-border">
                <td className="px-3 py-2">
                  {i.name} — {i.location} <span className="text-muted-foreground">({i.type}, 24h)</span>
                </td>
                <td className="px-3 py-2">× {i.quantity}</td>
                <td className="px-3 py-2 text-primary">{money(i.price * i.quantity, symbol)}</td>
              </tr>
            ))}
            <tr>
              <td className="px-3 py-2 font-semibold">Total</td>
              <td />
              <td className="px-3 py-2 text-primary font-semibold">{money(total, symbol)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-6 space-y-3">
          {enabledPayments.map((p) => (
            <div key={p.id}>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="payment" checked={paymentId === p.id} onChange={() => setPaymentId(p.id)} />
                <span className="font-semibold text-primary">{p.label}</span>
              </label>
              {paymentId === p.id && (
                <div className="mt-2 bg-muted/60 border border-border rounded px-3 py-2 text-xs text-muted-foreground">
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="min-w-0 flex-1 space-y-2">
                      <p>{p.gateway_note || `${p.label} payment gateway`}</p>
                      {p.address && <CopyableAddress value={p.address} />}
                      {p.network && <p>Network: {p.network}</p>}
                      <p>Amount to send: {money(total, symbol)}</p>
                    </div>
                    {p.address && <PaymentQr code={p.code} address={p.address} size={116} />}
                  </div>
                </div>
              )}
            </div>
          ))}
          {errors.payment && <p className="text-xs text-destructive">{errors.payment}</p>}
        </div>

        {settings.checkout_notice && (
          <p className="mt-6 text-xs text-muted-foreground leading-relaxed">{settings.checkout_notice}</p>
        )}

        {(errors.cart || errors.submit) && (
          <p className="mt-4 text-sm text-destructive">{errors.cart ?? errors.submit}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 block w-full border border-primary text-primary rounded py-2.5 text-sm font-medium hover:bg-primary hover:text-primary-foreground transition disabled:opacity-50"
        >
          {submitting ? "Placing order…" : "Place order"}
        </button>
      </form>
    </PageWithSidebar>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold">
        {label} {required && <span className="text-destructive">*</span>}
      </span>
      <span className="mt-1 block">{children}</span>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
