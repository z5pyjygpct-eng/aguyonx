import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { FtmV4Page } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { BOE_V4_MEETINGS } from "@/lib/ga-v4";
import { VboeMeetingSearch } from "@/components/site/vboe-meeting-search";

export const Route = createFileRoute("/dashboards/board-of-education/find-the-moment")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "Board of Education Find the Moment · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SiteShell>
      <FtmV4Page venue={V4_VENUES["va-boe"]} meetings={BOE_V4_MEETINGS} search={<VboeMeetingSearch />} page={page} onPage={(p: number) => navigate({ search: { page: p } })} />
    </SiteShell>
  );
}
