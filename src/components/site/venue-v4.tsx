/**
 * v4 venue template (preview only). Venue-parameterized Find the Moment + Meeting Recaps
 * pages: 20 on landing, 40 per page after, Year/Month/Type + keyword filters, FOIA button.
 * Roll out to another body by normalizing its meetings/recaps into V4Meeting / V4Recap.
 */
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Mail, Play, Search } from "lucide-react";
import { MONTHS } from "@/components/site/meeting-filters";
import { Pager, V4Main, pageCount, pageSlice, parseDate } from "@/components/site/lcps-v4";

export type V4Crumb = { label: string; to?: string; params?: Record<string, string> };
export type V4Foia = { label: string; href: string };
export type V4Meeting = { id: string; dateLabel: string; title: string; kind: string; duration?: string; href: string; host?: string; thumb?: string };
export type V4Recap = { slug: string; dateLabel: string; title: string; kind: string; votesPosted: boolean | null; to: string; params?: Record<string, string> };
export type V4Venue = { crumbs: V4Crumb[]; titleA: string; titleB: string; foia: V4Foia };

/** Display-time cleanup for scraped titles (no data edits). */
export function cleanTitle(t: string): string {
  let s = t.replace(/[\\]+/g, " ").replace(/\s+/g, " ").trim();
  // drop dangling connector words left by truncated agenda text ("… to Include a")
  for (let i = 0; i < 4; i++) s = s.replace(/\s+(to|a|an|the|and|of|for|on|include|includes|including|with|&|-|—|:)$/i, "").trim();
  return s.replace(/[,;:\-—]+$/, "").trim();
}

const ymd = (label: string) => {
  const m = label.replace(/^[A-Za-z]+, /, "").match(/^([A-Za-z]{3})[a-z]*\.? \d{1,2}, (\d{4})/);
  return { month: m?.[1], year: m?.[2] };
};

function useV4Filters<T extends { dateLabel: string; title: string; kind: string }>(items: T[], noun: string, page: number, onPage?: (p: number) => void) {
  const [year, setYear0] = useState("All");
  const [month, setMonth0] = useState("All");
  const [type, setType0] = useState("All");
  const [q, setQ0] = useState("");
  // Any filter change sends the reader back to page 1.
  const reset1 = () => { if (page !== 1) onPage?.(1); };
  const setYear = (v: string) => { setYear0(v); reset1(); };
  const setMonth = (v: string) => { setMonth0(v); reset1(); };
  const setType = (v: string) => { setType0(v); reset1(); };
  const setQ = (v: string) => { setQ0(v); reset1(); };
  const years = useMemo(() => [...new Set(items.map((d) => ymd(d.dateLabel).year!).filter(Boolean))].sort().reverse(), [items]);
  const types = useMemo(() => [...new Set(items.map((d) => d.kind))].sort(), [items]);
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const filtered = items.filter((d) => {
    const x = ymd(d.dateLabel);
    const hay = `${d.title} ${d.kind} ${d.dateLabel}`.toLowerCase();
    return (year === "All" || x.year === year) && (month === "All" || x.month === month) && (type === "All" || d.kind === type) && terms.every((t) => hay.includes(t));
  });
  const pages = pageCount(filtered.length);
  const cur = Math.min(page, pages);
  const { rows, start } = pageSlice(filtered, cur);
  const sel = "h-10 w-full rounded-md border border-navy-line bg-navy-700 px-2 text-sm normal-case tracking-normal text-white";
  const field = (label: string, v: string, set: (s: string) => void, opts: string[]) => (
    <label className="flex flex-col gap-1 font-mono text-xs tracking-widest text-night-muted uppercase">
      {label}
      <select className={sel} value={v} onChange={(e) => set(e.target.value)}>
        <option value="All">All</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  const active = year !== "All" || month !== "All" || type !== "All" || q !== "";
  const controls = (
    <>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <label className="flex flex-col gap-1 font-mono text-xs tracking-widest text-night-muted uppercase">
          Filter {noun}
          <span className="relative">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-night-muted" aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Title or keyword" className={`${sel} pl-8`} />
          </span>
        </label>
        {field("Year", year, setYear, years)}
        {field("Month", month, setMonth, MONTHS)}
        {field("Meeting type", type, setType, types)}
      </div>
      <p className="mt-3 text-sm text-night-muted" aria-live="polite">
        {filtered.length ? `Showing ${start + 1}–${start + rows.length} of ${filtered.length} ${noun}` : `0 of ${items.length} ${noun}`}
        {active ? <button type="button" className="ml-3 text-gold underline" onClick={() => { setYear("All"); setMonth("All"); setType("All"); setQ(""); }}>Reset</button> : null}
      </p>
      {filtered.length === 0 ? <p className="mt-4 rounded-md border border-dashed border-navy-line px-5 py-6 text-sm text-night-muted">No {noun} match. Clear a filter.</p> : null}
    </>
  );
  // any filter change → back to page 1 is handled by callers via key; clamp keeps it valid
  return { controls, rows, pages, cur };
}

export function V4VenueHero({ venue, kicker }: { venue: V4Venue; kicker: string }) {
  return (
    <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
      <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
        <nav aria-label="Breadcrumb" className="text-sm text-night-muted">
          <Link to="/" className="hover:text-white">Home</Link>
          {venue.crumbs.map((c) => (
            <span key={c.label}>
              <span className="mx-2 text-gold">›</span>
              {c.to ? <Link to={c.to as never} params={c.params as never} className="hover:text-white">{c.label}</Link> : <span>{c.label}</span>}
            </span>
          ))}
          <span className="mx-2 text-gold">›</span>
          <span className="font-semibold text-white">{kicker}</span>
        </nav>
        <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase sm:text-base">{kicker}</p>
        <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">
          {venue.titleA} <span className="text-gold">{venue.titleB}</span>
        </h1>
      </div>
    </section>
  );
}

export function FoiaButton({ foia }: { foia: V4Foia }) {
  return (
    <a href={foia.href} target="_blank" rel="noreferrer" className="inline-flex min-h-12 max-w-full items-center gap-3 rounded-xl border border-navy-line border-l-4 border-l-flag bg-[#1b1a2e] px-4 py-2 hover:border-gold">
      <Mail className="size-5 shrink-0 text-gold" aria-hidden />
      <span className="min-w-0">
        <span className="block font-semibold">{foia.label}</span>
        <span className="block truncate font-mono text-xs text-night-muted">{foia.href.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 40)}</span>
      </span>
      <ExternalLink className="size-4 text-gold" aria-hidden />
    </a>
  );
}

const byDateDesc = <T extends { dateLabel: string }>(a: T, b: T) => parseDate(b.dateLabel) - parseDate(a.dateLabel);

function usePaging(page: number, onPage: (p: number) => void) {
  return (p: number) => {
    onPage(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  };
}

export function FtmV4Page({ venue, meetings, search, page, onPage }: { venue: V4Venue; meetings: V4Meeting[]; search?: ReactNode; page: number; onPage: (p: number) => void }) {
  const sorted = useMemo(() => [...meetings].map((m) => ({ ...m, title: cleanTitle(m.title) })).sort(byDateDesc), [meetings]);
  const f = useV4Filters(sorted, "meetings", page, onPage);
  const go = usePaging(page, onPage);
  return (
    <V4Main>
      <V4VenueHero venue={venue} kicker="Find the Moment" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        {search ? (
          <>
            <div className="lcps-v4-search rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-1 sm:p-2">{search}</div>
            <p className="mt-2 text-xs text-night-muted">Captions are an index, not quotes. Verify on the video.</p>
          </>
        ) : null}
        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl font-semibold uppercase">Meeting videos</h2>
          <FoiaButton foia={venue.foia} />
        </div>
        <VideoChart meetings={sorted} />
        {f.controls}
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {f.rows.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-xl border border-navy-line bg-navy-700">
              <a href={m.href} target="_blank" rel="noreferrer" className="block">
                <div className="relative aspect-video border-b-[3px] border-gold bg-gradient-to-br from-navy-900 to-navy-600">
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center" aria-hidden>
                    <Play className="size-8 rounded-full bg-gold/90 p-1.5 text-navy-900" />
                    <span className="font-serif text-sm tracking-[0.14em] text-white uppercase">{m.kind}</span>
                    <span className="font-mono text-[11px] text-night-muted">{m.dateLabel.replace(/^[A-Za-z]+, /, "")}</span>
                  </span>
                  {m.thumb ? <img src={m.thumb} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : null}
                  {m.duration ? <span className="absolute right-2 bottom-2 rounded bg-black/70 px-2 py-0.5 font-serif text-xs">{m.duration}</span> : null}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold">{m.dateLabel.replace(/^[A-Za-z]+, /, "")} · {m.kind}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-on-dark-muted">{m.title}</p>
                  {m.host ? <p className="mt-1 text-xs text-night-muted">{m.host}{m.duration ? ` · ${m.duration}` : ""}</p> : null}
                </div>
              </a>
            </li>
          ))}
        </ul>
        <Pager page={f.cur} pages={f.pages} onGo={go} />
      </div>
    </V4Main>
  );
}

export function RecapsV4Page({ venue, recaps, page, onPage }: { venue: V4Venue; recaps: V4Recap[]; page: number; onPage: (p: number) => void }) {
  const sorted = useMemo(() => [...recaps].map((r) => ({ ...r, title: cleanTitle(r.title) })).sort(byDateDesc), [recaps]);
  const f = useV4Filters(sorted, "recaps", page, onPage);
  const go = usePaging(page, onPage);
  return (
    <V4Main>
      <V4VenueHero venue={venue} kicker="Meeting Recaps" />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl font-semibold uppercase">Meeting Recaps</h2>
          <FoiaButton foia={venue.foia} />
        </div>
        {f.controls}
        <ul className="mt-6 flex flex-col gap-3">
          {f.rows.map((r) => {
            const [wd, ...rest] = r.dateLabel.split(", ");
            return (
              <li key={r.slug}>
                <Link to={r.to as never} params={r.params as never} className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-700 px-5 py-4 hover:bg-navy-600">
                  <span className="w-36 shrink-0">
                    <span className="block font-serif text-xs tracking-[0.16em] text-gold uppercase">{wd}</span>
                    <span className="block font-serif text-lg">{rest.join(", ")}</span>
                  </span>
                  <span className="min-w-0 flex-1 basis-60 font-semibold">{r.title}</span>
                  {r.votesPosted === null ? null : r.votesPosted ? (
                    <span className="rounded-full border border-[#2e8f5e] bg-[#2eb46e]/15 px-3 py-1.5 text-xs font-semibold text-[#7be0ae]">✓ Official votes posted</span>
                  ) : (
                    <span className="rounded-full border border-flag bg-flag/15 px-3 py-1.5 text-xs font-semibold text-[#ffb3bf]" title="Votes are added only from the official minutes. Not posted for this meeting yet.">Official votes not yet posted</span>
                  )}
                  <ArrowRight className="size-5 text-gold" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
        <Pager page={f.cur} pages={f.pages} onGo={go} />
      </div>
    </V4Main>
  );
}

export function ComingSoonV4({ venue, kicker }: { venue: V4Venue; kicker: string }) {
  return (
    <V4Main>
      <V4VenueHero venue={venue} kicker={kicker} />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-8">
        <p className="rounded-xl border border-dashed border-navy-line px-6 py-10 text-center font-serif text-2xl uppercase text-night-muted">Coming soon</p>
        <div className="mt-6"><FoiaButton foia={venue.foia} /></div>
      </div>
    </V4Main>
  );
}

/** Total videos on file, by year (counts only; from the meeting catalog). */
export function VideoChart({ meetings }: { meetings: { dateLabel: string }[] }) {
  const by: Record<string, number> = {};
  for (const m of meetings) { const y = ymd(m.dateLabel).year; if (y) by[y] = (by[y] ?? 0) + 1; }
  const years = Object.keys(by).sort();
  const max = Math.max(1, ...Object.values(by));
  return (
    <section className="mt-6 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-serif text-xl font-semibold uppercase">Total videos <span className="font-mono text-gold">{meetings.length}</span></h3>
        <p className="font-mono text-xs text-night-muted">by year</p>
      </div>
      <ul className="mt-3 flex items-end gap-3" style={{ height: 120 }}>
        {years.map((y) => (
          <li key={y} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
            <span className="font-mono text-xs">{by[y]}</span>
            <span className="w-full max-w-16 rounded-t bg-gold" style={{ height: `${(by[y] / max) * 80}%` }} />
            <span className="font-mono text-xs text-night-muted">{y}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
