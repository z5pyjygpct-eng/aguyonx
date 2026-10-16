import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ComingSoonV4 } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";

export const Route = createFileRoute("/dashboards/board-of-education/budget")({
  head: () => ({ meta: [{ title: "Board of Education Budget & Finance · A Guy on X" }] }),
  component: () => <SiteShell><ComingSoonV4 venue={V4_VENUES["va-boe"]} kicker="Budget & Finance" /></SiteShell>,
});
