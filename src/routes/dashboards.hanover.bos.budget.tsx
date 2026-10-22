import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ComingSoonV4 } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";

export const Route = createFileRoute("/dashboards/hanover/bos/budget")({
  head: () => ({ meta: [{ title: "Hanover BOS Budget & Finance · A Guy on X" }] }),
  component: () => <SiteShell><ComingSoonV4 venue={V4_VENUES["hanover-bos"]} kicker="Budget & Finance" label="In-Process" /></SiteShell>,
});
