import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ComingSoonV4 } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";

export const Route = createFileRoute("/dashboards/fairfax-city/schools/budget")({
  head: () => ({ meta: [{ title: "Fairfax City Schools Budget · A Guy on X" }] }),
  component: () => <SiteShell><ComingSoonV4 venue={V4_VENUES["fairfax-city-schools"]} kicker="Budget & Finance" /></SiteShell>,
});
