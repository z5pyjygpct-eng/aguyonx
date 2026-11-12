import { createFileRoute, notFound } from "@tanstack/react-router";
import { GaMemberProfile, GaVacancyProfile, type GaMember, type GaMeta } from "@/components/site/ga-member-profile";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";
import { memberHead } from "@/lib/ga-member-stats";
import { loadFinanceSummary } from "@/lib/finance-summaries-load";

export const Route = createFileRoute("/dashboards/house/members_/$slug")({
  loader: async ({ params }) => {
    if (params.slug === "district-20-vacant") return { vacant: 20 as const, m: null, meta: null, finance: null };
    const d = (await import("@/lib/ga-members-2026-house.json")).default as unknown as GaMeta & { members: GaMember[] };
    const m = d.members.find((x) => x.slug === params.slug);
    if (!m) throw notFound();
    const finance = await loadFinanceSummary(params.slug);
    return { vacant: null, m, meta: { generated: d.generated, sources: d.sources, floorRollCalls: d.floorRollCalls }, finance };
  },
  // Member profiles are public and indexable. The vacant-seat placeholder is not a member page, so it keeps noindex.
  head: ({ loaderData }) =>
    loaderData?.m && loaderData.meta
      ? memberHead(loaderData.m, loaderData.meta)
      : { meta: [{ title: "House District 20 (vacant) · A Guy on X" }, ...GA_PREVIEW_ROBOTS] },
  component: Page,
});

function Page() {
  const { vacant, m, meta, finance } = Route.useLoaderData();
  if (vacant || !m || !meta) return <GaVacancyProfile district={20} />;
  return <GaMemberProfile m={m} meta={meta} finance={finance} />;
}
