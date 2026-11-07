import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nosuk key World" },
      { name: "description", content: "How Nosuk key World handles your data." },
      { property: "og:title", content: "Privacy Policy — Nosuk key World" },
      { property: "og:description", content: "How Nosuk key World handles your data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage title="Privacy Policy">
      <p>We store only the codes you submit. Your copied-code history stays in your own browser.</p>
      <p>This page is a placeholder and will be updated with full details soon.</p>
    </InfoPage>
  ),
});
