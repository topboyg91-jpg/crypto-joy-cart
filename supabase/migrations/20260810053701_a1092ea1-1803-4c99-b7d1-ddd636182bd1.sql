ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS ticket_code text NOT NULL DEFAULT ('MSG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)));

CREATE UNIQUE INDEX IF NOT EXISTS contact_messages_ticket_code_key ON public.contact_messages (ticket_code);