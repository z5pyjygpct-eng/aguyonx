import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";

import { RecapsV4Page, type V4Recap } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { bosKind } from "@/lib/v4-kinds";
import { LOUDOUN_RECAPS } from "@/content/loudoun-recaps";

const RECAPS: V4Recap[] = LOUDOUN_RECAPS.filter((r) => r.venue === "loudoun-bos").map((r) => ({
  slug: r.slug, dateLabel: r.dateLabel, title: r.title, kind: bosKind(r.title),
  votesPosted: !!r.official?.votesPosted, to: "/counties/loudoun/recaps/$slug", params: { slug: r.slug },
}));
export const Route = createFileRoute("/dashboards/loudoun/bos/recaps")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "Loudoun BOS Meeting Recaps · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onPage = (p: number) => navigate({ search: { page: p } });
  return (
    <SiteShell>
      <RecapsV4Page venue={V4_VENUES["loudoun-bos"]} recaps={RECAPS} page={page} onPage={onPage} />
    </SiteShell>
  );
}
