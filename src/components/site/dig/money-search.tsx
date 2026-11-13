import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { loadMoney } from "./data";
import { Ext, MoreList, dateLabel, money } from "./ui";
import type { Money, SpendFile } from "./types";

const CF = "https://cfreports.elections.virginia.gov";
const fmtAmt = (n: number) => `${n.toFixed(2)} ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${Math.round(n)}`;
/** Every word typed must appear somewhere in the row (name, place, purpose, amount or date). Commas and dollar signs are ignored. */
export function matcher(q: string) {
  const words = q.toLowerCase().replace(/[$,]/g, "").split(/\s+/).filter(Boolean);
  return (hay: string) => words.every((w) => hay.includes(w));
}
const hayOf = (...parts: (string | number)[]) => parts.map((p) => (typeof p === "number" ? fmtAmt(p) : p)).join(" ").toLowerCase().replace(/[$,]/g, "");

export function MoneySearch({ slug, m, year, q, onQ, label }: { slug: string; m: Money; year?: string; q: string; onQ: (v: string) => void; label: string }) {
  const id = useId();
  const [text, setText] = useState(q);
  const [spend, setSpend] = useState<SpendFile | null>(null);
  const [err, setErr] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => setText((cur) => (cur.trim() === q ? cur : q)), [q]);
  useEffect(() => () => clearTimeout(t.current), []);
  useEffect(() => { let live = true; setSpend(null); setErr(false); loadMoney(slug).then((s) => live && setSpend(s), () => live && setErr(true)); return () => { live = false; }; }, [slug]);
  const change = (v: string) => { setText(v); clearTimeout(t.current); t.current = setTimeout(() => onQ(v.trim()), 300); };

  const givers = useMemo(() => {
    const tot = new Map<number, { amt: number; n: number; rid: number; years: Set<string> }>();
    for (const [d, y, amt, n, rid] of m.cells) {
      if (year && y !== year) continue;
      const e = tot.get(d) ?? { amt: 0, n: 0, rid: 0, years: new Set<string>() };
      e.amt += amt; e.n += n; e.rid = Math.max(e.rid, rid); e.years.add(y);
      tot.set(d, e);
    }
    return [...tot.entries()].map(([d, e]) => {
      const [name, ind, city, st] = m.donors[d];
      const yrs = [...e.years].sort().join(", ");
      return { name, ind, place: [city, st].filter(Boolean).join(", "), ...e, yrs, hay: hayOf(name, city, st, ind ? "individual" : "organization committee", e.amt, yrs) };
    }).sort((a, b) => b.amt - a.amt);
  }, [m, year]);
  const spends = useMemo(() => (spend?.spend ?? []).filter((r) => !year || r[3].startsWith(year)).map(([payee, what, amt, d, rid]) => ({ payee, what, amt, d, rid, hay: hayOf(payee, what, amt, d, dateLabel(d)) })), [spend, year]);

  const match = matcher(text);
  const g = text.trim() ? givers.filter((x) => match(x.hay)) : givers;
  const s = text.trim() ? spends.filter((x) => match(x.hay)) : spends;
  const sum = (xs: { amt: number }[]) => money(xs.reduce((a, x) => a + x.amt, 0));
  const yr = year ? ` in ${year}` : "";
  const none = (what: string) => <p className="rounded-lg border border-dashed border-navy-line p-3 text-sm text-on-dark-muted">No matches{text.trim() ? <> for “<b className="text-white">{text.trim()}</b>”</> : null} in {what}{yr}. Try fewer words or part of a name.</p>;

  return (
    <div className="mt-6 border-t border-navy-line/60 pt-5">
      <h4 className="text-sm font-bold tracking-wide uppercase">Search givers and spending</h4>
      <label htmlFor={id} className="mt-2 block text-xs text-on-dark-muted">Type a name, a payee, a purpose (for example “printing” or “travel”) or an amount (for example 500 or 1,000). Lists below filter as you type.</label>
      <div className="relative mt-2">
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-night-muted" />
        <input id={id} type="search" value={text} onChange={(e) => change(e.target.value)} placeholder={`Search ${label}'s givers and spending`} autoComplete="off"
          className="h-11 w-full min-w-0 rounded-lg border border-navy-line bg-navy-800 pr-10 pl-9 text-sm text-white placeholder:text-night-muted focus:border-gold focus:outline-none" />
        {text ? <button type="button" aria-label="Clear search" onClick={() => change("")} className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded text-night-muted hover:text-white"><X className="size-4" /></button> : null}
      </div>
      <p className="mt-2 text-xs text-on-dark-muted" aria-live="polite">
        {text.trim() ? "Matches: " : "Showing: "}<b className="text-white">{g.length.toLocaleString("en-US")}</b> of {givers.length.toLocaleString("en-US")} givers ({sum(g)}) · <b className="text-white">{spend ? s.length.toLocaleString("en-US") : "…"}</b>{spend ? ` of ${spends.length.toLocaleString("en-US")}` : ""} expenditures{spend ? ` (${sum(s)})` : ""}{yr}
      </p>

      <h5 className="mt-4 mb-2 text-xs font-bold tracking-[0.14em] text-gold uppercase">Itemized givers{yr}, largest first</h5>
      <MoreList items={g} first={8} empty={none("itemized givers")}
        render={(x) => (
          <div className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
            <div className="min-w-0"><div className="truncate font-semibold">{x.name}</div><div className="text-xs text-night-muted">{x.ind ? "Individual" : "Organization or committee"}{x.place ? ` · ${x.place}` : ""} · {x.n} gift{x.n === 1 ? "" : "s"} · {x.yrs}</div></div>
            <Ext href={`${CF}/Report/Index/${x.rid}`} className="shrink-0 tabular-nums">{money(x.amt)}</Ext>
          </div>
        )} />

      <h5 className="mt-5 mb-2 text-xs font-bold tracking-[0.14em] text-gold uppercase">Expenditures{yr}, newest first</h5>
      {err ? <p className="text-sm text-on-dark-muted">Could not load the expenditure list. Try reloading the page.</p> : !spend ? <p className="text-sm text-on-dark-muted">Loading expenditures…</p> : (
        <MoreList items={s} first={8} empty={spends.length ? none("expenditures") : <p className="text-sm text-on-dark-muted">No itemized expenditures{yr} in the files collected.</p>}
          render={(x) => (
            <div className="flex min-w-0 items-baseline justify-between gap-3 text-sm">
              <div className="min-w-0"><div className="truncate font-semibold">{x.payee || "Payee not listed"}</div><div className="text-xs text-night-muted">{x.what || "Purpose not listed"} · {dateLabel(x.d || null)}</div></div>
              <Ext href={`${CF}/Report/Index/${x.rid}`} className="shrink-0 tabular-nums">{money(x.amt)}</Ext>
            </div>
          )} />
      )}
      <p className="mt-3 text-xs text-night-muted">Each amount links to the Virginia Department of Elections report it was filed in. Givers are itemized gifts (Schedule A), totaled per giver. Expenditures are itemized payments (Schedule D), one row per payment as filed. Same counting rules as above: each report once in its latest version, and transfers between the member's own committees left out.</p>
    </div>
  );
}
