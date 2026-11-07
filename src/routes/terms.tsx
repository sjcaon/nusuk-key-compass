import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Nosuk key World" },
      { name: "description", content: "Terms for using Nosuk key World." },
      { property: "og:title", content: "Terms of Service — Nosuk key World" },
      { property: "og:description", content: "Terms for using Nosuk key World." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage title="Terms of Service">
      <p>By using Nosuk key World you agree to share only valid codes and use the platform respectfully.</p>
      <p>This page is a placeholder and will be updated with full details soon.</p>
    </InfoPage>
  ),
});
