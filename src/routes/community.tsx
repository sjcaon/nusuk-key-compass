import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Global Community — Nosuk key World" },
      { name: "description", content: "Join the Nosuk key World community." },
      { property: "og:title", content: "Global Community — Nosuk key World" },
      { property: "og:description", content: "Join the Nosuk key World community." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage title="Global Community">
      <p>Nosuk key World connects pilgrims worldwide who share referral codes to help one another.</p>
      <p>This page is a placeholder and will be updated with full details soon.</p>
    </InfoPage>
  ),
});
