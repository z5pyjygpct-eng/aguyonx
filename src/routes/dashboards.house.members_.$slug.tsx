import { createFileRoute, notFound } from "@tanstack/react-router";
import { GaMemberProfile, GaVacancyProfile, type GaMember, type GaMeta } from "@/components/site/ga-member-profile";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/house/members_/$slug")({
  loader: async ({ params }) => {
    if (params.slug === "district-20-vacant") return { vacant: 20 as const, m: null, meta: null };
    const d = (await import("@/lib/ga-members-2026-house.json")).default as unknown as GaMeta & { members: GaMember[] };
    const m = d.members.find((x) => x.slug === params.slug);
    if (!m) throw notFound();
    return { vacant: null, m, meta: { generated: d.generated, sources: d.sources, floorRollCalls: d.floorRollCalls } };
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.m ? `Del. ${loaderData.m.name}` : "House District 20 (vacant)"} · A Guy on X` }, ...GA_PREVIEW_ROBOTS] }),
  component: Page,
});

function Page() {
  const { vacant, m, meta } = Route.useLoaderData();
  if (vacant || !m || !meta) return <GaVacancyProfile district={20} />;
  return <GaMemberProfile m={m} meta={meta} />;
}
