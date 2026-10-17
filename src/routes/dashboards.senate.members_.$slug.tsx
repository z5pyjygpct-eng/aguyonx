import { createFileRoute, notFound } from "@tanstack/react-router";
import { GaMemberProfile, type GaMember, type GaMeta } from "@/components/site/ga-member-profile";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/senate/members_/$slug")({
  loader: async ({ params }) => {
    const d = (await import("@/lib/ga-members-2026-senate.json")).default as unknown as GaMeta & { members: GaMember[] };
    const m = d.members.find((x) => x.slug === params.slug);
    if (!m) throw notFound();
    return { m, meta: { generated: d.generated, sources: d.sources, floorRollCalls: d.floorRollCalls } };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData ? `Sen. ${loaderData.m.name}` : "Senator"} · A Guy on X` }, ...GA_PREVIEW_ROBOTS] }),
  component: Page,
});

function Page() {
  const { m, meta } = Route.useLoaderData();
  return <GaMemberProfile m={m} meta={meta} />;
}
