import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ChamberPage, parseChamberSearch } from "@/components/site/elections-2027-chamber";

export const Route = createFileRoute("/2027/senate")({
  validateSearch: parseChamberSearch,
  head: () => ({ meta: [{ title: "Senate · 2027 Election Dashboard · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const s = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <SiteShell>
      <ChamberPage office="senate" s={s} onSeat={(id) => navigate({ search: (p) => ({ ...p, seat: id }), replace: true, resetScroll: false })} />
    </SiteShell>
  );
}
