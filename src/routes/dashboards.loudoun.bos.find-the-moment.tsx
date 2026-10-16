import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";

import { LoudounCrossMeetingSearch } from "@/components/site/loudoun-cross-meeting-search";
import { FtmV4Page, type V4Meeting } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { bosKind } from "@/lib/v4-kinds";
import { LOUDOUN_MEETINGS } from "@/content/loudoun";

const MEETINGS: V4Meeting[] = LOUDOUN_MEETINGS.map((m) => ({
  id: m.id, dateLabel: m.dateLabel, title: m.title.replace(/^Loudoun BOS /, "Board of Supervisors "), kind: bosKind(m.title),
  duration: m.duration, href: m.playerUrl, host: m.provider === "escribe" ? "eScribe" : "Granicus",
  thumb: `/thumbs/loudoun-bos/${m.clipId ?? m.id}.webp`,
}));
export const Route = createFileRoute("/dashboards/loudoun/bos/find-the-moment")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "Loudoun BOS Find the Moment · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onPage = (p: number) => navigate({ search: { page: p } });
  return (
    <SiteShell>
      <FtmV4Page venue={V4_VENUES["loudoun-bos"]} meetings={MEETINGS} search={<LoudounCrossMeetingSearch only="county" />} page={page} onPage={onPage} />
    </SiteShell>
  );
}
