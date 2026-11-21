import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ListV4Page, type V4Row } from "@/components/site/list-v4";
import { newsFiledLine, personChip } from "@/content/news";
import { election2027News } from "@/lib/news-2027-elections";

/** /2027/news: every story on the news shelf about the 2027 Virginia elections. Same list page as /dashboards/$body/news. */
export const Route = createFileRoute("/2027/news")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => (Number(s.page) > 1 ? { page: Math.floor(Number(s.page)) } : {}),
  head: () => ({ meta: [{ title: "2027 Election Related News | A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const page = Route.useSearch().page ?? 1;
  const navigate = Route.useNavigate();
  const items = election2027News();
  const rows: V4Row[] = items.map((i) => ({
    key: i.id, loc: "2027 Election", headline: i.headline, outlet: i.outlet, url: i.url, date: i.date, group: i.date.slice(0, 7),
    sub: [i.people.map(personChip).join(" · "), newsFiledLine(i)].filter(Boolean).join(" — ") || undefined,
  }));
  const months = [...new Set(rows.map((r) => r.group))].sort().reverse().map((m) => {
    const [y, mo] = m.split("-").map(Number);
    return { value: m, label: new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) };
  });
  return (
    <SiteShell>
      <ListV4Page
        crumbs={[{ label: "2027 Election", to: "/2027" }, { label: "News" }]}
        kicker="Related news"
        title="All 2027 Election Related News"
        dek="Every story on the site about the 2027 Virginia elections (General Assembly, boards of supervisors, school boards and constitutional officers), newest first."
        aside={<Link to="/2027" className="text-gold hover:underline">← Back to the 2027 Election Dashboard</Link>}
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
