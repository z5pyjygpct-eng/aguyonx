import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, List, Users } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { Election2027Hero } from "@/components/site/elections-2027-hero";
import { election2027News } from "@/lib/news-2027-elections";
import { E27_GA, E27_LOCAL, E27_NEWS_SHOWN, type E27Button } from "@/lib/election-2027-dashboard";
import HOUSE from "@/lib/elections-2027-house.json";
import SENATE from "@/lib/elections-2027-senate.json";
import BOS from "@/lib/elections-2027-bos.json";
import SB from "@/lib/elections-2027-sb.json";
import CO from "@/lib/elections-2027-co.json";
import type { Race } from "@/lib/elections-2027";
import { rowsForView, VIEW_BY_ID } from "@/lib/elections-2027-challengers";
import { localGaps, localSections, type LocalFile, type LocalOffice } from "@/lib/elections-2027-local";

/**
 * /2027: 2027 Election Dashboard landing page. Same hero, search bar, column cards, tiles and gold News box
 * as the location dashboards (src/components/site/dashboard-template.tsx + location-news.tsx).
 * The full race directory moved to /2027/races; old /2027?office=… links are sent there with their filters.
 */
const OLD_KEYS = ["office", "loc", "f", "q", "seat", "r_office", "r_loc", "r_status", "r_party", "r_q", "r_filed"];

export const Route = createFileRoute("/2027/")({
  beforeLoad: ({ location }) => {
    const s = (location.search ?? {}) as Record<string, unknown>;
    if (OLD_KEYS.some((k) => s[k] !== undefined && s[k] !== "")) throw redirect({ to: "/2027/races", search: s as never, hash: location.hash || undefined });
  },
  head: () => ({ meta: [{ title: "2027 Election Dashboard · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function fmt(d: string) {
  const [y, m, day] = d.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, day)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

/**
 * Gap badges: computed from the same data and logic as the Delegates / Senate "Challenger Gaps" views and the locality tables, so
 * they update with every data build. Coming-soon tiles get none.
 */
type Pill = { key: string; text: string; cls: string };
type TileGaps = { pills: Pill[]; aria: string };
const PILL_R = "bg-flag text-white", PILL_D = "bg-[#2563c9] text-white", PILL_O = "bg-slate-500 text-white";
const GA_DATA: Record<string, Race[]> = { house: (HOUSE as unknown as { races: Race[] }).races, senate: (SENATE as unknown as { races: Race[] }).races };
const LOCAL_FILES = { bos: BOS, sb: SB, co: CO } as unknown as Record<LocalOffice, LocalFile>;
const AS_OF = (HOUSE as { as_of: string }).as_of;
const seats = (n: number) => `${n} ${n === 1 ? "seat" : "seats"}`;

function gaGaps(races: Race[]): TileGaps {
  const r = rowsForView(races, VIEW_BY_ID.get("r-gaps")!).length;
  const d = rowsForView(races, VIEW_BY_ID.get("d-gaps")!).length;
  return {
    pills: [{ key: "R", text: `R gaps ${r}`, cls: PILL_R }, { key: "D", text: `D gaps ${d}`, cls: PILL_D }],
    aria: `No challenger yet: ${seats(r)} held by Republicans, ${seats(d)} held by Democrats`,
  };
}
function tileGaps(b: E27Button): TileGaps | null {
  if (b.soon) return null;
  if (GA_DATA[b.slug]) return gaGaps(GA_DATA[b.slug]);
  const { shown } = localSections(b.slug, LOCAL_FILES);
  if (!shown.some((s) => s.rows.some((r) => !r.sharedFrom))) return null;
  const g = localGaps(shown);
  const partisan = shown.some((s) => s.view !== "sb" && s.rows.some((r) => !r.sharedFrom));
  const sb = shown.some((s) => s.view === "sb" && s.rows.some((r) => !r.sharedFrom));
  const pills: Pill[] = [];
  const words: string[] = [];
  if (partisan) {
    pills.push({ key: "R", text: `R ${g.R}`, cls: PILL_R }, { key: "D", text: `D ${g.D}`, cls: PILL_D });
    words.push(`${seats(g.R)} held by Republicans`, `${seats(g.D)} held by Democrats`);
    if (g.other) { pills.push({ key: "O", text: `Other ${g.other}`, cls: PILL_O }); words.push(`${seats(g.other)} held by others or party not listed`); }
  }
  if (sb) { pills.push({ key: "SB", text: `School Board ${g.schoolBoard}`, cls: PILL_O }); words.push(`${seats(g.schoolBoard)} on the School Board`); }
  return { pills, aria: `No challenger yet: ${words.join(", ")}` };
}

const TILE = "flex min-h-[72px] items-center gap-4 rounded-xl border border-navy-line bg-navy-800 px-5 py-3";

function Tile({ b, icon: Icon }: { b: E27Button; icon: typeof Users }) {
  const gaps = tileGaps(b);
  return (
    <Link
      to={b.to as never}
      search={b.search as never}
      hash={b.hash}
      data-e27={b.slug}
      className={b.soon ? `${TILE} border-dashed border-l-4 border-l-night-muted/60 transition-colors hover:border-gold hover:bg-navy-600` : `${TILE} border-l-4 border-l-gold transition-colors hover:border-gold hover:bg-navy-600`}
    >
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${b.soon ? "bg-navy-600 text-night-muted" : "bg-gold/15 text-gold"}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-lg font-semibold">{b.label}</span>
        {gaps ? (
          <span className="mt-1.5 flex flex-wrap items-center gap-1.5" aria-label={gaps.aria} role="note" data-gaps={b.slug}>
            <span aria-hidden className="text-xs text-on-dark-muted">No challenger yet:</span>
            {gaps.pills.map((p) => <span key={p.key} aria-hidden className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-xs font-bold ${p.cls}`}>{p.text}</span>)}
          </span>
        ) : null}
        {b.soon ? <span className="mt-1 inline-flex whitespace-nowrap rounded-full bg-on-dark-muted px-3 py-0.5 text-xs font-bold text-navy-800">Coming soon</span> : null}
      </span>
      <ArrowRight className={`size-5 shrink-0 ${b.soon ? "text-night-muted" : "text-gold"}`} aria-hidden />
    </Link>
  );
}

const CARD = "min-w-0 scroll-mt-24 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7";

function Page() {
  const all = election2027News();
  const items = all.slice(0, E27_NEWS_SHOWN);
  return (
    <SiteShell>
      <main className="agx-dark flex-1 bg-navy-800 text-white">
        <Election2027Hero crumbs={[{ label: "2027 Election" }]} label="Dashboard" asOf={AS_OF} />
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <div id="general-assembly" className={CARD}>
              <h2 className="font-serif text-2xl font-semibold uppercase">Virginia General Assembly</h2>
              <div className="mt-5 flex flex-col gap-3">
                {E27_GA.map((b) => <Tile key={b.slug} b={b} icon={Users} />)}
              </div>
            </div>
            <div id="local-elections" className={CARD}>
              <h2 className="font-serif text-2xl font-semibold uppercase">Virginia Local Elections</h2>
              <div className="mt-5 grid gap-3 sm:grid-flow-col sm:grid-cols-2 sm:grid-rows-5">
                {E27_LOCAL.map((b) => <Tile key={b.slug} b={b} icon={List} />)}
              </div>
            </div>
          </div>

          <section id="news" aria-labelledby="e27-news-h" className="mt-6 scroll-mt-24 rounded-xl bg-[#f5b82e] p-5 text-navy-800 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <h2 id="e27-news-h" className="font-serif text-2xl font-bold uppercase">News: 2027 Election Related News</h2>
              <Link to="/2027/news" className="inline-flex min-h-11 items-center rounded-md bg-navy-800 px-4 font-semibold text-gold hover:bg-navy-700 sm:ml-auto">
                All 2027 Election Related News <ArrowRight className="ml-1 size-4" />
              </Link>
            </div>
            {items.length === 0 ? (
              <p className="mt-4 font-semibold">No related news yet</p>
            ) : (
              <ul className="mt-4 divide-y divide-navy-800/20">
                {items.map((n) => (
                  <li key={n.id} className="py-3">
                    <a href={n.url} target="_blank" rel="noreferrer" className="group flex items-start gap-3">
                      <span className="min-w-0 flex-1">
                        <span className="block text-lg font-semibold leading-snug group-hover:underline">{n.headline}</span>
                        <span className="mt-1 block text-sm font-medium text-navy-800/80">{n.outlet} · {fmt(n.date)}</span>
                      </span>
                      <ExternalLink className="mt-1 size-4 shrink-0" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="mt-8 text-sm text-night-muted">
            "No challenger yet" counts seats where the current officeholder has no registered 2027 challenger from another party (or any challenger, for the nonpartisan School Board) in the state's campaign finance records. R and D are the officeholder's party. "Coming soon" means we have no 2027 race data posted for that locality yet. Race data comes only from official records (Virginia Department of Elections and each locality's elections office).
          </p>
        </section>
      </main>
    </SiteShell>
  );
}
