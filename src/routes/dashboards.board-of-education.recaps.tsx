import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { RecapsV4Page, type V4Recap } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { VBOE_RECAPS } from "@/content/vboe-recaps";
import { vboeMeetingType } from "@/content/va-boe";

const DATA: V4Recap[] = [...VBOE_RECAPS]
  .sort((a, b) => (a.date === b.date ? b.title.localeCompare(a.title) : b.date.localeCompare(a.date)))
  .map((r) => ({
    slug: r.slug, dateLabel: r.dateLabel, title: r.title, kind: vboeMeetingType(r.title),
    votesPosted: r.official.votesPosted ? (r.decisions.length ? true : null) : false,
    to: "/dashboards/board-of-education/recaps/$slug", params: { slug: r.slug },
  }));

export const Route = createFileRoute("/dashboards/board-of-education/recaps")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "Board of Education Meeting Recaps · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onPage = (p: number) => navigate({ search: { page: p } });
  return (
    <SiteShell>
      <RecapsV4Page venue={V4_VENUES["va-boe"]} recaps={DATA} page={page} onPage={onPage} />
    </SiteShell>
  );
}
