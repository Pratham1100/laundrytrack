import { createFileRoute } from "@tanstack/react-router";
import { LaundryDashboard } from "@/features/laundry/laundry-dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LaundryTrack — Laundry management dashboard" },
      {
        name: "description",
        content:
          "Manage laundry orders, track barcode IDs, and monitor every order from receipt to delivery.",
      },
      { property: "og:title", content: "LaundryTrack — Laundry management dashboard" },
      {
        property: "og:description",
        content:
          "Manage laundry orders, track barcode IDs, and monitor every order from receipt to delivery.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <LaundryDashboard />;
}
