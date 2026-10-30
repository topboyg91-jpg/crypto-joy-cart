import { createFileRoute } from "@tanstack/react-router";
import { InfoCard, InfoPage, useSettings } from "@/components/site-chrome";
import { EditablePage } from "@/components/editable-page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About us — DeepProxy private 24-hour proxies" },
      { name: "description", content: "Who we are and how the 24-hour proxy store works: locations, crypto checkout and instant delivery." },
      { property: "og:title", content: "About us" },
      { property: "og:description", content: "Who we are and how the store works." },
      { property: "og:url", content: "https://www.deepshop.space/about" },
    ],
    links: [{ rel: "canonical", href: "https://www.deepshop.space/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <EditablePage slug="about" title="About us">
      <AboutDefault />
    </EditablePage>
  );
}

function AboutDefault() {
  const settings = useSettings();

  return (
    <InfoPage title="About us" lead="Private 24-hour proxies with straightforward crypto checkout.">
      <InfoCard title="What we do">
        <p>
          {settings.store_name ?? "We"} rents private residential, datacenter and mobile proxies targeted by country,
          state and city — for fixed 24-hour windows. No subscriptions and no rotating pools: the IP you buy is yours
          alone for the full 24 hours.
        </p>
      </InfoCard>
      <InfoCard title="Our inventory">
        <ul className="list-disc pl-5 space-y-1">
          <li>Residential and mobile IPs across the United States, Europe and Asia</li>
          <li>Datacenter proxies for high-bandwidth work</li>
          <li>Every slot is single-use and private for the whole 24 hours</li>
        </ul>
      </InfoCard>
      <InfoCard title="Support">
        <p>Questions about an order go to {settings.contact_email ?? "our support address"} — usually answered same day.</p>
      </InfoCard>
    </InfoPage>
  );
}
