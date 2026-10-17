import { createFileRoute } from "@tanstack/react-router";
import { GaMembersLive } from "@/components/site/ga-members-live";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/senate/members")({
  head: () => ({ meta: [{ title: "Senate of Virginia Members · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <GaMembersLive slug="senate-members" />,
});
