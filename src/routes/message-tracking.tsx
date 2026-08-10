import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageWithSidebar } from "@/components/site-chrome";
import { supabase } from "@/integrations/supabase/client";
import type { ContactMessage } from "@/lib/store";

export const Route = createFileRoute("/message-tracking")({
  head: () => ({
    meta: [
      { title: "Message tracking — read our reply to your message" },
      {
        name: "description",
        content: "Enter your message reference code to read the support team's reply on the site — no email needed.",
      },
      { property: "og:title", content: "Message tracking" },
      { property: "og:description", content: "Look up your message reference to read our reply." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MessageTrackingPage,
});

function MessageTrackingPage() {
  const [code, setCode] = useState("");
  const [row, setRow] = useState<ContactMessage | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = code.trim().toUpperCase();
    if (!q) return;
    setLoading(true);
    setSearched(true);
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .eq("ticket_code", q)
      .limit(1)
      .returns<ContactMessage[]>();
    setRow(data?.[0] ?? null);
    setLoading(false);
  };

  return (
    <PageWithSidebar>
      <h2 className="text-3xl font-bold text-primary">Message tracking</h2>
      <p className="mt-2 text-sm text-foreground/70">
        Enter the reference code you were given when you sent your message to read our reply here.
      </p>

      <form onSubmit={search} className="mt-6 flex gap-2 max-w-md">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="MSG-XXXXXX"
          aria-label="Message reference code"
          className="flex-1 px-3 py-2 border border-border rounded bg-card text-sm font-mono"
        />
        <button className="px-5 bg-primary text-primary-foreground rounded text-sm font-medium">Check</button>
      </form>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Searching…</p>}

      {!loading && searched && !row && (
        <p className="mt-6 text-sm text-muted-foreground">No message found for that reference.</p>
      )}

      {!loading && row && (
        <div className="mt-8 space-y-4 text-sm">
          <div className="bg-card/95 border border-border rounded p-5">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <p className="text-muted-foreground">Reference</p>
                <p className="font-mono font-semibold text-primary">{row.ticket_code}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Sent</p>
                <p>{new Date(row.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-semibold">{row.replied_at ? "Replied" : row.status}</p>
              </div>
            </div>
            <p className="mt-4 text-muted-foreground">Your message</p>
            <p className="mt-1 whitespace-pre-line">{row.message}</p>
          </div>

          <div className="bg-accent/50 border border-primary rounded p-5">
            <p className="text-muted-foreground">Our reply</p>
            {row.reply?.trim() ? (
              <>
                <p className="mt-1 whitespace-pre-line">{row.reply}</p>
                {row.replied_at && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Replied {new Date(row.replied_at).toLocaleString()}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-1 text-muted-foreground">
                No reply yet — check back shortly. We usually reply within one business day.
              </p>
            )}
          </div>
        </div>
      )}
    </PageWithSidebar>
  );
}