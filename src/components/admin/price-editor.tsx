import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { useTableMutations } from "@/components/admin/entity-table";
import { ProductImage } from "@/lib/product-image";
import { gramsLabel, productsQuery, type Product, type ProductPrice } from "@/lib/store";

/** "50g" / "1kg" / "2 pieces" → { grams, unit_label } */
export function parseAmount(raw: string): { grams: number; unit_label: string } {
  const v = raw.trim();
  const m = /^([\d.,]+)\s*(g|gram|grams|kg|kilo|kilos)?$/i.exec(v);
  if (m) {
    const n = Number(m[1].replace(",", "."));
    if (Number.isFinite(n)) {
      const kg = /^k/i.test(m[2] ?? "");
      return { grams: kg ? n * 1000 : n, unit_label: "" };
    }
  }
  return { grams: 0, unit_label: v };
}

const amountText = (p: { grams: number; unit_label?: string | null }) =>
  (p.unit_label ?? "").trim() || (Number(p.grams) ? gramsLabel(Number(p.grams)) : "");

export function PriceEditor({ symbol = "$" }: { symbol?: string }) {
  const { data: products } = useQuery(productsQuery);
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = products ?? [];
    return q ? list.filter((p) => p.name.toLowerCase().includes(q)) : list;
  }, [products, search]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-primary">Prices</h3>
          <p className="text-xs text-muted-foreground">
            Type an amount like <b>50g</b>, <b>1kg</b> or <b>1 piece</b>, then the price. Changes save automatically.
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          aria-label="Search products"
          className="px-3 py-1.5 text-sm rounded border border-border bg-background w-56"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((p) => (
          <ProductPriceCard key={p.id} product={p} symbol={symbol} />
        ))}
      </div>
      {visible.length === 0 && <p className="text-sm text-muted-foreground">No products match “{search}”.</p>}
    </section>
  );
}

function ProductPriceCard({ product, symbol }: { product: Product; symbol: string }) {
  const { update, insert, remove } = useTableMutations("product_prices", [["products"]]);
  const [amount, setAmount] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    const parsed = parseAmount(amount);
    if (!parsed.grams && !parsed.unit_label) return setError("Enter an amount");
    setError(null);
    insert.mutate(
      {
        product_id: product.id,
        ...parsed,
        price: Number(price.replace(",", ".")) || 0,
        sort_order: product.product_prices.length + 1,
      },
      {
        onSuccess: () => {
          setAmount("");
          setPrice("");
        },
        onError: (e) => setError(e instanceof Error ? e.message : "Could not add tier"),
      },
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <header className="flex items-center gap-3">
        <ProductImage src={product.image_url} name={product.name} className="h-10 w-10 rounded border border-border" />
        <div className="min-w-0">
          <h4 className="font-semibold text-primary truncate">{product.name}</h4>
          <p className="text-[11px] text-muted-foreground">{product.product_prices.length} price tiers</p>
        </div>
      </header>

      <ul className="mt-3 space-y-1.5">
        {product.product_prices.map((tier) => (
          <TierRow
            key={tier.id}
            tier={tier}
            symbol={symbol}
            onSave={(patch) => update.mutate({ id: tier.id, idKey: "id", patch })}
            onDelete={() => remove.mutate({ id: tier.id, idKey: "id" })}
            saving={update.isPending}
          />
        ))}
        {product.product_prices.length === 0 && (
          <li className="text-xs text-muted-foreground">No tiers yet — add one below.</li>
        )}
      </ul>

      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50g / 1 piece"
          aria-label={`New amount for ${product.name}`}
          className="flex-1 min-w-0 px-2 py-1.5 text-sm rounded border border-border bg-background"
        />
        <div className="relative w-24 shrink-0">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{symbol}</span>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            inputMode="decimal"
            placeholder="0.00"
            aria-label={`New price for ${product.name}`}
            className="w-full pl-5 pr-2 py-1.5 text-sm rounded border border-border bg-background"
          />
        </div>
        <button
          onClick={add}
          className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-primary text-primary-foreground text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function TierRow({
  tier,
  symbol,
  onSave,
  onDelete,
  saving,
}: {
  tier: ProductPrice;
  symbol: string;
  onSave: (patch: Record<string, unknown>) => void;
  onDelete: () => void;
  saving: boolean;
}) {
  const [amount, setAmount] = useState(amountText(tier));
  const [price, setPrice] = useState(String(tier.price));
  const [saved, setSaved] = useState(false);

  const flash = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  const commitAmount = () => {
    if (amount.trim() === amountText(tier)) return;
    onSave(parseAmount(amount));
    flash();
  };

  const commitPrice = () => {
    const n = Number(price.replace(",", ".")) || 0;
    if (n === Number(tier.price)) return;
    onSave({ price: n });
    flash();
  };

  return (
    <li className="flex items-center gap-2">
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={commitAmount}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        aria-label="Amount"
        className="flex-1 min-w-0 px-2 py-1 text-sm rounded border border-border bg-background"
      />
      <div className="relative w-24 shrink-0">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{symbol}</span>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          onBlur={commitPrice}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          inputMode="decimal"
          aria-label="Price"
          className="w-full pl-5 pr-2 py-1 text-sm rounded border border-border bg-background"
        />
      </div>
      <span className="w-4 shrink-0 text-primary">
        {saved ? <Check className="h-3.5 w-3.5" /> : saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      </span>
      <button aria-label="Delete tier" onClick={onDelete} className="shrink-0 text-muted-foreground hover:text-destructive">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
