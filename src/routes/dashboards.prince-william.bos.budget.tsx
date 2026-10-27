import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ComingSoonV4 } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";

export const Route = createFileRoute("/dashboards/prince-william/bos/budget")({
  head: () => ({ meta: [{ title: "Prince William BOCS Budget & Finance · A Guy on X" }] }),
  component: () => <SiteShell><ComingSoonV4 venue={V4_VENUES["pwc-bos"]} kicker="Budget & Finance" label="In-Process" /></SiteShell>,
});
