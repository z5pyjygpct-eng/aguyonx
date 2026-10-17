import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { DashboardTemplate } from "@/components/site/dashboard-template";
import { GA_DASHBOARD, GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/general-assembly")({
  head: () => ({ meta: [{ title: "Virginia General Assembly Dashboard · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <SiteShell><DashboardTemplate d={GA_DASHBOARD} plain /></SiteShell>,
});
