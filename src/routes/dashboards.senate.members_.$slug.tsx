import { createFileRoute, notFound } from "@tanstack/react-router";
import { GaMemberProfile, type GaMember, type GaMeta } from "@/components/site/ga-member-profile";
import { memberHead } from "@/lib/ga-member-stats";
import { loadFinanceSummary } from "@/lib/finance-summaries-load";

export const Route = createFileRoute("/dashboards/senate/members_/$slug")({
  loader: async ({ params }) => {
    const d = (await import("@/lib/ga-members-2026-senate.json")).default as unknown as GaMeta & { members: GaMember[] };
    const m = d.members.find((x) => x.slug === params.slug);
    if (!m) throw notFound();
    const finance = await loadFinanceSummary(params.slug);
    return { m, meta: { generated: d.generated, sources: d.sources, floorRollCalls: d.floorRollCalls }, finance };
  },
  head: ({ loaderData }) => (loaderData ? memberHead(loaderData.m, loaderData.meta) : { meta: [{ title: "Senator · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { m, meta, finance } = Route.useLoaderData();
  return <GaMemberProfile m={m} meta={meta} finance={finance} />;
}
