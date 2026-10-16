import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { RecapsV4Page } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { HOUSE_V4_RECAPS } from "@/lib/ga-v4";

export const Route = createFileRoute("/dashboards/house/recaps")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "House of Delegates Recaps · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SiteShell>
      <RecapsV4Page venue={V4_VENUES["va-house"]} recaps={HOUSE_V4_RECAPS} page={page} onPage={(p: number) => navigate({ search: { page: p } })} />
    </SiteShell>
  );
}
