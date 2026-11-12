import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ComingSoonV4 } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";

export const Route = createFileRoute("/dashboards/board-of-education/budget")({
  head: () => ({ meta: [{ title: "Board of Education Government budget · A Guy on X" }] }),
  component: () => <SiteShell><ComingSoonV4 venue={V4_VENUES["va-boe"]} kicker="Government budget" /></SiteShell>,
});
