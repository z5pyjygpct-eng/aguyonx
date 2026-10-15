import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { HeroSearch } from "@/components/site/hero-search";
import { siteStats } from "@/components/site/loudoun-stats";
import { SITE } from "@/content/site";
import { articleBySlug } from "@/content/articles";
import { newsNewestFirst, type NewsItem } from "@/content/news";
import briefing from "@/content/nova-briefing.json";
import { COMING_SOON_LOCALITIES, DASHBOARDS } from "@/lib/dashboards";

export const Route = createFileRoute("/")({ component: Home });

const FEATURE_SLUG = "the-2025-virginia-election-a-playbook-for-candidates-to-fight-the-political-establishment";
const PRIORITY = ["Loudoun", "Fairfax", "Prince William", "Arlington", "Statewide"] as const;
type Loc = (typeof PRIORITY)[number];
type Row = { key: string; loc: Loc; headline: string; outlet: string; url: string; date: string };
const CAP = 3;
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function fmt(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

/** Dedupe by headline/url, cap per locality, then order by locality priority (stable by recency). */
function pick(rows: Row[], seen: Set<string>, n = 10): Row[] {
  const count: Record<string, number> = {};
  const out: Row[] = [];
  for (const r of rows) {
    const k1 = norm(r.headline);
    if (seen.has(k1) || seen.has(r.url)) continue;
    if ((count[r.loc] ?? 0) >= CAP) continue;
    count[r.loc] = (count[r.loc] ?? 0) + 1;
    seen.add(k1);
    seen.add(r.url);
    out.push(r);
  }
  return out
    .sort((a, b) => PRIORITY.indexOf(a.loc) - PRIORITY.indexOf(b.loc))
    .slice(0, n);
}

function newsLoc(item: NewsItem): Loc {
  for (const l of ["Loudoun", "Fairfax", "Prince William", "Arlington"] as const) {
    if (item.people.some((p) => p.office.startsWith(l))) return l;
    if (item.headline.includes(l)) return l;
  }
  return "Statewide";
}

type BriefItem = { id: string; county: string; headline: string; outlet: string; url: string; published: string };
type Edition = { date: string; status: string; items?: BriefItem[] };

function useLatest() {
  return useMemo(() => {
    const ed = (briefing.editions as Edition[]).find((e) => (e.items?.length ?? 0) > 0);
    const seen = new Set<string>();
    const bRows: Row[] = (ed?.items ?? [])
      .filter((i) => (PRIORITY as readonly string[]).includes(i.county))
      .map((i) => ({ key: i.id, loc: i.county as Loc, headline: i.headline, outlet: i.outlet, url: i.url, date: i.published }))
      .sort((a, b) => PRIORITY.indexOf(a.loc) - PRIORITY.indexOf(b.loc));
    const b = pick(bRows, seen);
    const nRows: Row[] = newsNewestFirst().map((i) => ({ key: i.id, loc: newsLoc(i), headline: i.headline, outlet: i.outlet, url: i.url, date: i.date }));
    const n = pick(nRows, seen);
    return { edition: ed, briefRows: b, briefTotal: ed?.items?.length ?? 0, newsRows: n };
  }, []);
}

function Placeholder({ children = "Placeholder" }: { children?: string }) {
  return (
    <span className="ml-1 inline-block rounded border border-dashed border-gold bg-[#3a2f12] px-1.5 py-0.5 align-middle text-[10px] font-bold tracking-wider text-gold uppercase">
      {children}
    </span>
  );
}

function ListBlock({ title, sub, all, rows, loc }: { title: string; sub: string; all: { to: string; label: string }; rows: Row[]; loc: string }) {
  const [more, setMore] = useState(false);
  const filtered = loc === "All" ? rows : rows.filter((r) => r.loc === loc);
  return (
    <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-2 sm:px-6">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
        <h3 className="font-serif text-2xl font-semibold uppercase sm:text-[28px]">{title}</h3>
        <span className="text-sm text-on-dark-muted">{sub}</span>
        <Link to={all.to} className="inline-flex min-h-11 items-center font-semibold text-gold sm:ml-auto">
          {all.label} <ArrowRight className="ml-1 size-4" />
        </Link>
      </div>
      {filtered.length === 0 ? <p className="border-t border-navy-line py-4 text-sm text-on-dark-muted">Nothing from this locality in the latest set.</p> : null}
      <ul>
        {filtered.map((r, i) => (
          <li key={r.key} className={`border-t border-navy-line ${i >= 5 && !more ? "hidden sm:block" : ""}`}>
            <a href={r.url} target="_blank" rel="noreferrer" className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-navy-600/50 sm:flex-nowrap">
              <span className="min-w-[104px] rounded bg-gold px-2 py-1 text-center font-serif text-xs tracking-wider text-navy-800 uppercase">{r.loc}</span>
              <span className="order-3 basis-full font-semibold sm:order-none sm:basis-auto sm:flex-1">{r.headline}</span>
              <span className="text-[13px] whitespace-nowrap text-on-dark-muted">
                {r.outlet} · {fmt(r.date)} <ExternalLink className="inline size-3 text-gold" />
              </span>
            </a>
          </li>
        ))}
      </ul>
      {filtered.length > 5 && !more ? (
        <button type="button" onClick={() => setMore(true)} className="my-3 flex min-h-12 w-full items-center justify-center rounded-lg border border-gold font-semibold text-gold sm:hidden">
          Show {filtered.length - 5} more
        </button>
      ) : null}
    </div>
  );
}

function Home() {
  const stats = siteStats();
  const feature = articleBySlug(FEATURE_SLUG);
  const { edition, briefRows, briefTotal, newsRows } = useLatest();
  const [loc, setLoc] = useState("All");
  const [amt, setAmt] = useState("$25");
  const navigate = useNavigate();
  const asOf = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });
  const local = DASHBOARDS.filter((d) => d.group === "local");
  const state = DASHBOARDS.filter((d) => d.group === "state");
  const tiles = [
    { n: stats.videos, l: "Meeting videos" },
    { n: stats.searchable, l: "Searchable meetings" },
    { n: stats.transcripts, l: "Full transcripts" },
    { n: stats.recaps, l: "Meeting recaps" },
    { n: stats.hours, l: "Hours transcribed" },
  ];
  const go = (slug: string) => slug && navigate({ to: "/dashboards/$body", params: { body: slug } });

  return (
    <div className="flex min-h-svh flex-col bg-navy-800 text-white">
      <SiteHeader />
      <main className="agx-dark flex-1 pb-20 lg:pb-0">
        {/* Hero */}
        <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 pb-12 sm:px-8 lg:pt-12">
            <p className="font-serif text-base font-semibold tracking-[0.16em] text-gold uppercase sm:text-2xl">VA Change Agent · Find the Moment</p>
            <h1 className="mt-3 font-serif text-[40px] font-bold leading-[1.05] uppercase sm:text-6xl lg:text-7xl">
              The Public Record
              <br />
              Is The <span className="text-gold">Story.</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base text-on-dark-muted sm:text-xl">Find what was said, voted, and filed — then jump to the source.</p>
            <p className="mt-2 max-w-2xl text-sm text-on-dark-muted sm:text-base">
              We index Virginia public meetings, transcribe them, and link every claim to the official record.{" "}
              <Link to="/about" className="font-semibold text-gold underline">About this project →</Link>
            </p>
            <div className="mt-7">
              <HeroSearch placeholder={`Search ${stats.searchable.toLocaleString()} Virginia public meetings…`} />
            </div>
            <h2 className="mt-10 font-serif text-3xl font-semibold text-gold uppercase">Dashboards</h2>
            <div className="mt-3 flex max-w-3xl flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <span className="block font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Virginia counties &amp; cities</span>
                <select defaultValue="" onChange={(e) => go(e.target.value)} className="mt-1 h-14 w-full appearance-none rounded-xl border border-navy-line bg-navy-700 px-4 text-base font-semibold text-white">
                  <option value="" disabled>Choose a locality…</option>
                  {local.map((d) => <option key={d.slug} value={d.slug}>{d.short}</option>)}
                </select>
              </label>
              <label className="relative flex-1">
                <span className="block font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Virginia legislature &amp; departments</span>
                <select defaultValue="" onChange={(e) => go(e.target.value)} className="mt-1 h-14 w-full appearance-none rounded-xl border border-navy-line bg-navy-700 px-4 text-base font-semibold text-white">
                  <option value="" disabled>Choose a body…</option>
                  {state.map((d) => <option key={d.slug} value={d.slug}>{d.short}</option>)}
                </select>
              </label>
            </div>
            <p className="mt-3 text-sm text-night-muted">Coming soon: {COMING_SOON_LOCALITIES.join(" · ")}</p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          {/* Stats */}
          <section className="pt-12">
            <h2 className="font-serif text-3xl font-semibold uppercase">By the numbers</h2>
            <p className="mt-1 text-sm text-on-dark-muted">As of {asOf} · all venues on the site, statewide · tap a tile to explore</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
              {tiles.map((t, i) => (
                <Link key={t.l} to="/find-the-moment" className={`relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 transition-colors hover:bg-navy-600 ${i === 4 ? "col-span-2 lg:col-span-1" : ""}`}>
                  <ArrowRight className="absolute top-4 right-4 size-5 text-gold" aria-hidden />
                  <span className="block font-serif text-4xl font-bold sm:text-5xl">{t.n.toLocaleString()}</span>
                  <span className="text-sm text-on-dark-muted">{t.l}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Feature */}
          {feature ? (
            <section className="pt-12">
              <h2 className="font-serif text-3xl font-semibold uppercase">Featured</h2>
              <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 lg:flex-row">
                <img src={feature.image} alt={feature.imageAlt} className="h-44 w-full object-cover sm:h-64 lg:h-auto lg:w-[52%]" />
                <div className="flex-1 p-5 sm:p-7">
                  <p className="font-serif text-xs font-semibold tracking-[0.18em] text-gold uppercase">
                    {feature.kicker} · {feature.displayDate}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl leading-tight font-semibold sm:text-3xl">{feature.title}</h3>
                  <p className="mt-3 text-on-dark-muted">{feature.dek}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link to="/articles/$slug" params={{ slug: feature.slug }} className="inline-flex min-h-11 items-center rounded-lg bg-gold px-5 font-bold text-navy-800 hover:bg-gold-hover">
                      Read the article →
                    </Link>
                    {feature.citations[0] ? (
                      <a href={feature.citations[0].href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-on-dark-muted px-5 font-semibold">
                        Read on 𝕏 ↗
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {/* Latest */}
          <section className="pt-12">
            <h2 className="font-serif text-3xl font-semibold uppercase">Latest</h2>
            <label className="mt-4 block sm:hidden">
              <span className="sr-only">Locality</span>
              <select value={loc} onChange={(e) => setLoc(e.target.value)} className="h-12 w-full rounded-lg border border-navy-line bg-navy-800 px-3 font-semibold text-white">
                <option value="All">Locality: All</option>
                {PRIORITY.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <div className="mt-5 flex flex-col gap-6">
              <ListBlock
                title="Daily NoVA Briefing"
                sub={`${edition ? fmt(edition.date) + " edition" : "Latest edition"} · ${briefRows.length} of ${briefTotal} · max ${CAP} per locality`}
                all={{ to: "/nova-briefing", label: "All NoVA Briefings" }}
                rows={briefRows}
                loc={loc}
              />
              <ListBlock title="News" sub={`Latest · max ${CAP} per locality · no repeats from the Briefing`} all={{ to: "/news", label: "All News" }} rows={newsRows} loc={loc} />
            </div>
          </section>

          {/* Donate + signup */}
          <section className="pt-12">
            <div className="rounded-xl border border-flag bg-gradient-to-br from-[#3a0a14] to-navy-700 p-6">
              <h3 className="font-serif text-2xl font-semibold uppercase">Help fuel the public record</h3>
              <p className="mt-2 text-on-dark-muted">
                Records requests, transcripts and hosting cost money. Every dollar keeps the archive free and searchable. <Placeholder>Preview · not live</Placeholder>
              </p>
              <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Donation amount (preview)">
                {["$10", "$25", "$50", "$100", "Other"].map((a) => (
                  <button key={a} type="button" role="radio" aria-checked={amt === a} onClick={() => setAmt(a)} className={`min-h-12 min-w-16 rounded-lg border px-3 font-serif text-lg ${amt === a ? "border-white bg-white text-navy-800" : "border-on-dark-muted"}`}>
                    {a}
                  </button>
                ))}
              </div>
              <button type="button" disabled className="mt-4 inline-flex min-h-12 cursor-not-allowed items-center rounded-lg border border-white bg-flag px-6 font-serif font-bold tracking-[0.06em] uppercase opacity-90" title="Preview only — not connected to payments">
                Give {amt === "Other" ? "" : amt} →
              </button>
              <p className="mt-2 text-xs text-night-muted">Amount picker is a design preview and is not connected to payments.</p>
            </div>
          </section>
        </div>
        <div className="h-14" />
      </main>
      <SiteFooter />
      {/* Sticky mobile donate */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-flag bg-navy-900 px-4 py-2.5 lg:hidden">
        <span className="flex-1 text-[13px] text-on-dark-muted">Keep the public record free.</span>
        <a href={SITE.giveUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg bg-flag px-5 font-serif font-bold tracking-[0.05em] text-white">DONATE</a>
      </div>
    </div>
  );
}
