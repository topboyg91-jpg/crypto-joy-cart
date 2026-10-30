import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoCard, InfoPage } from "@/components/site-chrome";
import { EditablePage } from "@/components/editable-page";

export const Route = createFileRoute("/delivery-method")({
  head: () => ({
    meta: [
      { title: "How delivery works — instant proxy delivery" },
      { name: "description", content: "Proxy orders are delivered digitally: what happens after your crypto payment confirms and where your connection details arrive." },
      { property: "og:title", content: "How delivery works" },
      { property: "og:description", content: "Digital delivery — nothing is shipped." },
      { property: "og:url", content: "https://www.deepshop.space/delivery-method" },
    ],
    links: [{ rel: "canonical", href: "https://www.deepshop.space/delivery-method" }],
  }),
  component: DeliveryMethodPage,
});

function DeliveryMethodPage() {
  return (
    <EditablePage slug="delivery-method" title="How delivery works">
      <DeliveryMethodDefault />
    </EditablePage>
  );
}

function DeliveryMethodDefault() {
  return (
    <InfoPage title="How delivery works" lead="Digital delivery — nothing is shipped.">
      <InfoCard title="What happens after payment">
        <p>
          When your crypto payment confirms on-chain, the proxy you ordered is reserved for you for the next 24 hours.
          The connection details — IP address, port, protocol, username and password — are then sent to the email
          address on the order, typically within minutes.
        </p>
      </InfoCard>
      <InfoCard title="Where your details arrive">
        <p>
          Delivery goes to the email address you enter at checkout. You can also follow the status at any time on the{" "}
          <Link to="/order-tracking" className="text-primary hover:underline">
            order tracking
          </Link>{" "}
          page with your order number.
        </p>
      </InfoCard>
      <InfoCard title="Problems connecting">
        <p>
          If the proxy does not connect within the first hour, contact support with your order number and we will
          replace the IP or refund the order.
        </p>
      </InfoCard>
    </InfoPage>
  );
}
