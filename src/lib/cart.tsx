import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { locationLabel, type ProxyListing } from "@/lib/proxy-inventory";

export type CartItem = {
  listingId: string;
  name: string;
  type: string;
  /** "City, Region" of the chosen proxy. */
  location: string;
  protocol: string;
  speed: string;
  /** USD price for one 24-hour proxy. */
  price: number;
  quantity: number;
};

export function cartItemFromListing(listing: ProxyListing, quantity = 1): CartItem {
  return {
    listingId: listing.id,
    name: listing.name,
    type: listing.type,
    location: locationLabel(listing),
    protocol: listing.protocol,
    speed: listing.speed,
    price: listing.price,
    quantity,
  };
}

export type PlaceOrderInput = {
  email: string;
  telegram: string;
  notes: string;
  paymentCode: string;
  paymentAddress: string;
};

export type PlacedOrder = {
  orderNumber: string;
  total: number;
  paymentCode: string;
  paymentAddress: string;
  email: string;
};

const CART_KEY = "shop.cart.proxy.v1";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  hydrated: boolean;
  add: (item: CartItem) => void;
  setQuantity: (listingId: string, quantity: number) => void;
  remove: (listingId: string) => void;
  clear: () => void;
  placeOrder: (details: PlaceOrderInput) => Promise<PlacedOrder>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items, hydrated]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.listingId === item.listingId);
      if (idx === -1) return [...prev, item];
      const next = [...prev];
      next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity };
      return next;
    });
  }, []);

  const setQuantity = useCallback((listingId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.listingId !== listingId)
        : prev.map((i) => (i.listingId === listingId ? { ...i, quantity } : i)),
    );
  }, []);

  const remove = useCallback((listingId: string) => {
    setItems((prev) => prev.filter((i) => i.listingId !== listingId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const placeOrder = useCallback<CartContextValue["placeOrder"]>(
    async (details) => {
      const orderNumber = `PX-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      const total = subtotal;

      const { error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          first_name: "",
          last_name: "",
          address: details.telegram,
          email: details.email,
          notes: details.notes,
          shipping_label: "Instant activation",
          shipping_price: 0,
          subtotal,
          total,
          payment_code: details.paymentCode,
          payment_address: details.paymentAddress,
          status: "Awaiting payment",
          items: items.map((i) => ({
            name: i.name,
            type: i.type,
            location: i.location,
            protocol: i.protocol,
            speed: i.speed,
            price: i.price,
            quantity: i.quantity,
          })),
        });
      if (error) throw error;

      setItems([]);
      return {
        orderNumber,
        total,
        paymentCode: details.paymentCode,
        paymentAddress: details.paymentAddress,
        email: details.email,
      };
    },
    [items, subtotal],
  );

  const value = useMemo(
    () => ({ items, count, subtotal, hydrated, add, setQuantity, remove, clear, placeOrder }),
    [items, count, subtotal, hydrated, add, setQuantity, remove, clear, placeOrder],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
