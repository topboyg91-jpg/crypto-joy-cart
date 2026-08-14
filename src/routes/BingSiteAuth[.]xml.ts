import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

// Served from a route (not just public/) so the verification file is guaranteed
// to exist on every deployment target, including the static/Tor export.
const BODY = `<?xml version="1.0"?>
<users>
\t<user>60DCBFB5F3ED1E9C49ADF8B06D929F98</user>
</users>
`;

export const Route = createFileRoute("/BingSiteAuth.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(BODY, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
