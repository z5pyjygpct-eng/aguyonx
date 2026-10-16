import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { FtmV4Page } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { albMeetings, albRecaps } from "@/lib/albemarle-v4";
import { CityMeetingSearch } from "@/components/site/city-meeting-search";

const DATA = albMeetings("fairfax-city-schools");
void albMeetings; void albRecaps;
export const Route = createFileRoute("/dashboards/fairfax-city/schools/find-the-moment")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "Fairfax City Schools Find the Moment · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onPage = (p: number) => navigate({ search: { page: p } });
  return (
    <SiteShell>
      <FtmV4Page venue={V4_VENUES["fairfax-city-schools"]} meetings={DATA} search={<CityMeetingSearch venues={["fairfax-city-schools"]} />} page={page} onPage={onPage} />
    </SiteShell>
  );
}
