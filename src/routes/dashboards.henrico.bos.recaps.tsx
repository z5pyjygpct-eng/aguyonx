import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { RecapsV4Page } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { albRecaps } from "@/lib/albemarle-v4";

const DATA = albRecaps("henrico-bos");
export const Route = createFileRoute("/dashboards/henrico/bos/recaps")({
  validateSearch: (s: Record<string, unknown>) => ({ page: Math.max(1, Number(s.page) || 1) }),
  head: () => ({ meta: [{ title: "Henrico BOS Meeting Recaps · A Guy on X" }] }),
  component: Page,
});

function Page() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const onPage = (p: number) => navigate({ search: { page: p } });
  return (
    <SiteShell>
      <RecapsV4Page venue={V4_VENUES["henrico-bos"]} recaps={DATA} page={page} onPage={onPage} />
    </SiteShell>
  );
}
