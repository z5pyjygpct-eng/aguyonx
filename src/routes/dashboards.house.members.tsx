import { createFileRoute } from "@tanstack/react-router";
import { GaMembersLive } from "@/components/site/ga-members-live";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/house/members")({
  head: () => ({ meta: [{ title: "House of Delegates Members · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <GaMembersLive slug="house-members" />,
});
