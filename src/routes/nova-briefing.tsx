import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { ListV4Page, fmtIso, type V4Row } from "@/components/site/list-v4";
import data from "@/content/nova-briefing.json";

type BriefingItem = { id: string; county: string; headline: string; outlet: string; url: string; published: string; tier?: string };
type Edition = { date: string; status: "ok" | "gap" | "failed"; note?: string; items: BriefingItem[]; gaps: string[] };

const EDITIONS = [...(data.editions as Edition[])].sort((a, b) => b.date.localeCompare(a.date));
const ROWS: V4Row[] = EDITIONS.flatMap((ed) =>
  ed.items.map((i) => ({ key: `${ed.date}-${i.id}`, loc: i.county, headline: i.headline, outlet: i.outlet, url: i.url, date: i.published, group: ed.date, sub: `${fmtIso(ed.date)} edition` })),
);
const GROUPS = EDITIONS.map((e) => ({ value: e.date, label: `${fmtIso(e.date)} · ${e.items.length ? `${e.items.length} items` : "gap"}` }));
const GAP = Object.fromEntries(EDITIONS.map((e) => [e.date, e.gaps[0] ?? e.note ?? "Nothing verified for this day."]));

export const Route = createFileRoute("/nova-briefing")({
  validateSearch: (s: Record<string, unknown>): { page?: number } => (Number(s.page) > 1 ? { page: Math.floor(Number(s.page)) } : {}),
  head: () => ({
    meta: [
      { title: "Daily NoVA Briefing | A Guy on X" },
      { name: "description", content: "Every morning: the local Northern Virginia record from Loudoun, Fairfax, Prince William and Arlington, linked to the outlet that reported it." },
    ],
  }),
  component: NovaBriefing,
});

function NovaBriefing() {
  const page = Route.useSearch().page ?? 1;
  const navigate = Route.useNavigate();
  return (
    <SiteShell>
      <ListV4Page
        kicker="Every morning"
        title="Daily NoVA Briefing"
        dek={`Yesterday in ${data.counties.join(", ").replace(/, ([^,]*)$/, " and $1")}, linked to the outlet that reported it. Gaps stay gaps.`}
        aside={<Link to="/news" className="text-gold hover:underline">All News →</Link>}
        headerShare={{ text: "New every morning: the Daily NoVA Briefing, with yesterday's news from Loudoun, Fairfax, Prince William and Arlington all in one place.", url: "https://aguyonx.com/nova-briefing" }}
        rows={ROWS}
        groupLabel="Edition"
        groups={GROUPS}
        page={page}
        onPage={(p) => navigate({ search: p > 1 ? { page: p } : {} })}
        emptyNote={(g) => (g !== "All" && GAP[g] ? `Gap: ${GAP[g]}` : "Nothing matches. Set a filter back to All.")}
      />
    </SiteShell>
  );
}
