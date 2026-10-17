import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";

import { RecapsV4Page, type V4Recap } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { LCPS_MEETINGS } from "@/content/lcps";
import { LOUDOUN_RECAPS } from "@/content/loudoun-recaps";

const KIND: Record<string, string> = { full_board: "Full board", committee: "Committee", appeals: "Appeals", closed: "Closed session", other: "Other" };
const M = Object.fromEntries(LCPS_MEETINGS.map((m) => [m.id, m]));
const RECAPS: V4Recap[] = LOUDOUN_RECAPS.filter((r) => r.venue === "loudoun-lcps").map((r) => ({
  slug: r.slug, dateLabel: r.dateLabel, title: r.title, kind: KIND[M[r.meetingId]?.kind ?? "full_board"] ?? "Other",
  votesPosted: !!r.official?.votesPosted, to: "/counties/loudoun/recaps/$slug", params: { slug: r.slug },
}));
export const Route = createFileRoute("/dashboards/loudoun/schools/recaps")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "LCPS Meeting Recaps · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onPage = (p: number) => navigate({ search: { page: p } });
  return (
    <SiteShell>
      <RecapsV4Page venue={V4_VENUES["loudoun-lcps"]} recaps={RECAPS} page={page} onPage={onPage} />
    </SiteShell>
  );
}
