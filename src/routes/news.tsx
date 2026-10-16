import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ListV4Page, type V4Row } from "@/components/site/list-v4";
import { NEWS_DEK, newsFiledLine, newsNewestFirst, personChip, type NewsItem } from "@/content/news";

function newsLoc(item: NewsItem): string {
  for (const l of ["Loudoun", "Fairfax", "Prince William", "Arlington"]) {
    if (item.people.some((p) => p.office.startsWith(l))) return l;
    if (item.headline.includes(l)) return l;
  }
  return "Statewide";
}
const ITEMS = newsNewestFirst();
const ROWS: V4Row[] = ITEMS.map((i) => ({
  key: i.id, loc: newsLoc(i), headline: i.headline, outlet: i.outlet, url: i.url, date: i.date, group: i.date.slice(0, 7),
  sub: [i.people.map(personChip).join(" · "), newsFiledLine(i)].filter(Boolean).join(" — ") || undefined,
}));
const MONTHS = [...new Set(ROWS.map((r) => r.group))].sort().reverse().map((m) => {
  const [y, mo] = m.split("-").map(Number);
  return { value: m, label: new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" }) };
});

export const Route = createFileRoute("/news")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => (Number(s.page) > 1 ? { page: Math.floor(Number(s.page)) } : {}),
  head: () => ({ meta: [{ title: "News | A Guy on X" }] }),
  component: NewsIndex,
});

function NewsIndex() {
  const page = Route.useSearch().page ?? 1;
  const navigate = Route.useNavigate();
  return (
    <SiteShell>
      <ListV4Page
        kicker="The clip file"
        title="News"
        dek={NEWS_DEK}
        aside={<Link to="/nova-briefing" className="text-gold hover:underline">Daily NoVA Briefing →</Link>}
        rows={ROWS}
        groupLabel="Month"
        groups={MONTHS}
        page={page}
        onPage={(p) => navigate({ search: p > 1 ? { page: p } : {} })}
      />
    </SiteShell>
  );
}
