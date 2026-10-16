import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { FtmV4Page } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { SENATE_V4_MEETINGS } from "@/lib/ga-v4";
import { SenateMeetingSearch } from "@/components/site/senate-meeting-search";

export const Route = createFileRoute("/dashboards/senate/find-the-moment")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "State Senate Find the Moment · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SiteShell>
      <FtmV4Page venue={V4_VENUES["va-senate"]} meetings={SENATE_V4_MEETINGS} search={<SenateMeetingSearch />} page={page} onPage={(p: number) => navigate({ search: { page: p } })} />
    </SiteShell>
  );
}
