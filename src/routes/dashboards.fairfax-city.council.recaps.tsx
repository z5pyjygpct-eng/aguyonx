import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { RecapsV4Page } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { albMeetings, albRecaps } from "@/lib/albemarle-v4";


const DATA = albRecaps("fairfax-city-council");
void albMeetings; void albRecaps;
export const Route = createFileRoute("/dashboards/fairfax-city/council/recaps")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "City of Fairfax Council Meeting Recaps · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onPage = (p: number) => navigate({ search: { page: p } });
  return (
    <SiteShell>
      <RecapsV4Page venue={V4_VENUES["fairfax-city-council"]} recaps={DATA} page={page} onPage={onPage} />
    </SiteShell>
  );
}
