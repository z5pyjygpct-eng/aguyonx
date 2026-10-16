/** v4 list landing (preview): breadcrumb header, locality chips + date select, 20/40 paging. */
import { useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Pager, V4Main, pageCount, pageSlice } from "@/components/site/lcps-v4";

export type V4Row = { key: string; loc: string; headline: string; outlet: string; url: string; date: string; group: string; sub?: string };
export const LOC_ORDER = ["Loudoun", "Fairfax", "Prince William", "Arlington", "Statewide"];

export function fmtIso(iso: string, year = true) {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y) return iso;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", ...(year ? { year: "numeric" } : {}), timeZone: "UTC" });
}

export function ListV4Page({ kicker, title, dek, rows, groupLabel, groups, page, onPage, emptyNote, aside }: {
  kicker: string; title: string; dek: ReactNode; rows: V4Row[]; groupLabel: string; groups: { value: string; label: string }[];
  page: number; onPage: (p: number) => void; emptyNote?: (group: string) => ReactNode; aside?: ReactNode;
}) {
  const [loc, setLoc] = useState("All");
  const [group, setGroup] = useState("All");
  const locs = useMemo(() => LOC_ORDER.filter((l) => rows.some((r) => r.loc === l)).concat([...new Set(rows.map((r) => r.loc))].filter((l) => !LOC_ORDER.includes(l)).sort()), [rows]);
  const filtered = rows.filter((r) => (loc === "All" || r.loc === loc) && (group === "All" || r.group === group));
  const pages = pageCount(filtered.length);
  const cur = Math.min(page, pages);
  const { rows: shown, start } = pageSlice(filtered, cur);
  const reset = (fn: () => void) => { fn(); if (page !== 1) onPage(1); };
  const go = (p: number) => { onPage(p); if (typeof window !== "undefined") window.scrollTo({ top: 0 }); };
  const chip = (l: string) => (
    <button key={l} type="button" onClick={() => reset(() => setLoc(l))} aria-pressed={loc === l}
      className={`min-h-9 rounded-full border px-3 text-sm font-semibold ${loc === l ? "border-gold bg-gold text-navy-800" : "border-navy-line text-on-dark-muted hover:border-gold"}`}>{l}</button>
  );
  return (
    <V4Main>
      <section className="relative bg-gradient-to-r from-navy-900 from-40% to-navy-700">
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
        <div className="mx-auto max-w-7xl px-5 pt-6 pb-10 sm:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-night-muted">
            <Link to="/" className="hover:text-white">Home</Link>
            <span className="mx-2 text-gold">›</span>
            <span className="font-semibold text-white">{title}</span>
          </nav>
          <p className="mt-6 font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase sm:text-base">{kicker}</p>
          <h1 className="mt-2 font-serif text-4xl font-bold uppercase leading-[1.05] sm:text-6xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-on-dark-muted">{dek}</p>
          {aside ? <div className="mt-3 text-sm">{aside}</div> : null}
        </div>
      </section>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-wrap gap-2">{chip("All")}{locs.map(chip)}</div>
          <label className="flex flex-col gap-1 font-mono text-xs tracking-widest text-night-muted uppercase sm:ml-auto">
            {groupLabel}
            <select value={group} onChange={(e) => reset(() => setGroup(e.target.value))} className="h-10 min-w-48 rounded-md border border-navy-line bg-navy-700 px-2 text-sm normal-case tracking-normal text-white">
              <option value="All">All</option>
              {groups.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm text-night-muted" aria-live="polite">
          {filtered.length ? `Showing ${start + 1}–${start + shown.length} of ${filtered.length}` : `0 of ${rows.length}`}
        </p>
        <div className="mt-4 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 px-4 py-1 sm:px-6">
          {filtered.length === 0 ? <p className="py-5 text-sm text-on-dark-muted">{emptyNote?.(group) ?? "Nothing matches. Set a filter back to All."}</p> : null}
          <ul>
            {shown.map((r, i) => (
              <li key={r.key} className={i ? "border-t border-navy-line" : ""}>
                <a href={r.url} target="_blank" rel="noreferrer" className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-navy-600/50 sm:flex-nowrap">
                  <span className="min-w-[112px] rounded bg-gold px-2 py-1 text-center font-serif text-xs tracking-wider text-navy-800 uppercase">{r.loc}</span>
                  <span className="order-3 basis-full sm:order-none sm:basis-auto sm:flex-1">
                    <span className="font-semibold">{r.headline}</span>
                    {r.sub ? <span className="mt-0.5 block text-xs text-night-muted">{r.sub}</span> : null}
                  </span>
                  <span className="text-[13px] whitespace-nowrap text-on-dark-muted">{r.outlet} · {fmtIso(r.date)} <ExternalLink className="inline size-3 text-gold" /></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <Pager page={cur} pages={pages} onGo={go} />
      </div>
    </V4Main>
  );
}
