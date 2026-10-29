ALTER TABLE public.orders ADD COLUMN items jsonb;
COMMENT ON COLUMN public.orders.items IS 'Proxy order lines [{listingId,name,type,location,protocol,speed,price,quantity}]; replaces order_items for the proxy store';
