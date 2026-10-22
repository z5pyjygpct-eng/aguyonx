import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ListV4Page, type V4Row } from "@/components/site/list-v4";
import type { Crumb } from "@/components/site/breadcrumbs";
import { DASHBOARD_BY_SLUG } from "@/lib/dashboards";
import { newsForLocation } from "@/lib/news-locations";
import { newsFiledLine, personChip } from "@/content/news";

export const Route = createFileRoute("/dashboards/$body/news")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => (Number(s.page) > 1 ? { page: Math.floor(Number(s.page)) } : {}),
  head: ({ params }) => ({ meta: [{ title: `${DASHBOARD_BY_SLUG[params.body]?.title ?? "Location"} News | A Guy on X` }] }),
  component: Page,
});

function Page() {
  const { body } = Route.useParams();
  const page = Route.useSearch().page ?? 1;
  const navigate = Route.useNavigate();
  const d = DASHBOARD_BY_SLUG[body];
  if (!d) {
    return (
      <SiteShell>
        <main className="mx-auto max-w-3xl flex-1 px-6 py-20">
          <h1 className="font-serif text-4xl font-bold uppercase">Dashboard not found</h1>
          <Link to="/" className="mt-6 inline-block text-forest underline">Back home</Link>
        </main>
      </SiteShell>
    );
  }
  const items = newsForLocation(body);
  const rows: V4Row[] = items.map((i) => ({
    key: i.id, loc: d.short, headline: i.headline, outlet: i.outlet, url: i.url, date: i.date, group: i.date.slice(0, 7),
    sub: [i.people.map(personChip).join(" · "), newsFiledLine(i)].filter(Boolean).join(" — ") || undefined,
  }));
  const months = [...new Set(rows.map((r) => r.group))].sort().reverse().map((m) => {
    const [y, mo] = m.split("-").map(Number);
    return { value: m, label: new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) };
  });
  const first: Crumb = d.group === "local"
    ? { label: "Virginia localities", to: "/find-the-moment" }
    : d.slug === "board-of-education"
      ? { label: "Virginia Department of Education" }
      : { label: "General Assembly", to: "/dashboards/general-assembly" };
  return (
    <SiteShell>
      <ListV4Page
        crumbs={[first, { label: d.short, to: "/dashboards/$body", params: { body } }, { label: "News" }]}
        kicker="Related news"
        title={`${d.title} News`}
        dek={`Every story on the site tagged to ${d.title}, newest first. They also appear under News on the homepage.`}
        aside={<Link to="/dashboards/$body" params={{ body }} className="text-gold hover:underline">← Back to the {d.short} dashboard</Link>}
        rows={rows}
        groupLabel="Month"
        groups={months}
        page={page}
        onPage={(p) => navigate({ search: p > 1 ? { page: p } : {} })}
        emptyNote={() => "No related news yet."}
      />
    </SiteShell>
  );
}
