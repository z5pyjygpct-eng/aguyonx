import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";

import { LcpsMeetingSearch } from "@/components/site/lcps-meeting-search";
import { FtmV4Page, type V4Meeting } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { LCPS_MEETINGS } from "@/content/lcps";

const KIND: Record<string, string> = { full_board: "Full board", committee: "Committee", appeals: "Appeals", closed: "Closed session", other: "Other" };
const MEETINGS: V4Meeting[] = LCPS_MEETINGS.map((m) => ({
  id: m.id, dateLabel: m.dateLabel, title: m.committeeName ?? m.title, kind: KIND[m.kind ?? "full_board"] ?? "Other",
  duration: m.duration, href: m.playerUrl, host: "Vimeo", thumb: `/thumbs/loudoun-lcps/${m.id}.webp`,
}));
export const Route = createFileRoute("/dashboards/loudoun/schools/find-the-moment")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "LCPS Find the Moment · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onPage = (p: number) => navigate({ search: { page: p } });
  return (
    <SiteShell>
      <FtmV4Page venue={V4_VENUES["loudoun-lcps"]} meetings={MEETINGS} search={<LcpsMeetingSearch />} page={page} onPage={onPage} />
    </SiteShell>
  );
}
