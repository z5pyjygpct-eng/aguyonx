import { createFileRoute, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { isLocality, LOCALITY_NAME, LocalityPage, parseLocalitySearch } from "@/components/site/elections-2027-locality";

/** /2027/<slug>: the shared 2027 locality page for every locality on the 2027 Election Dashboard. */
export const Route = createFileRoute("/2027/$locality")({
  validateSearch: parseLocalitySearch,
  beforeLoad: ({ params }) => {
    if (!isLocality(params.locality)) throw notFound();
  },
  head: ({ params }) => ({ meta: [{ title: `${LOCALITY_NAME[params.locality] ?? "Locality"} · 2027 Election Dashboard · A Guy on X` }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const { locality } = Route.useParams();
  const s = Route.useSearch();
  return <SiteShell><LocalityPage slug={locality} s={s} /></SiteShell>;
}
