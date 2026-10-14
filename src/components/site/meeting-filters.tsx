/**
 * Standard meeting filters (Year · Month · Meeting type + "Showing N of M" + Reset), first built for the
 * Loudoun Board of Supervisors recaps/meeting list. Every venue's "Meeting recaps" and "Meeting videos"
 * lists use this hook so all localities filter the same way. New venue pages should call
 * useMeetingFilters(items, getMeta, noun) and render {controls} above the list.
 */
import { useMemo, useState } from "react";

export const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type MeetingFilterMeta = { year?: string; month?: string; type?: string };

/** From a label like "Thursday, May 23, 2024" or "May 23, 2024". */
export function dateMeta(date: string | undefined, type: string | undefined): MeetingFilterMeta {
  const m = date?.match(/([A-Z][a-z]{2})[a-z]* \d+, (\d{4})/);
  return { year: m?.[2], month: m?.[1], type };
}

/** From an ISO date "YYYY-MM-DD". */
export function isoMeta(iso: string | undefined, type: string | undefined): MeetingFilterMeta {
  const m = iso?.match(/^(\d{4})-(\d{2})/);
  return { year: m?.[1], month: m ? MONTHS[Number(m[2]) - 1] : undefined, type };
}

export function useMeetingFilters<T>(items: readonly T[], get: (t: T) => MeetingFilterMeta, noun: string) {
  const [year, setYear] = useState("All");
  const [month, setMonth] = useState("All");
  const [type, setType] = useState("All");
  const years = useMemo(() => [...new Set(items.map((d) => get(d).year!).filter(Boolean))].sort().reverse(), [items]);
  const types = useMemo(() => [...new Set(items.map((d) => get(d).type!).filter(Boolean))].sort(), [items]);
  const filtered = items.filter((d) => {
    const x = get(d);
    return (year === "All" || x.year === year) && (month === "All" || x.month === month) && (type === "All" || x.type === type);
  });
  const sel = "h-9 w-full rounded-md border border-border bg-card px-2 text-sm normal-case tracking-normal text-foreground";
  const field = (label: string, v: string, set: (s: string) => void, opts: string[]) => (
    <label className="flex flex-col gap-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
      {label}
      <select className={sel} value={v} onChange={(e) => set(e.target.value)}>
        <option value="All">All</option>
        {opts.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
  const active = year !== "All" || month !== "All" || type !== "All";
  const controls = (
    <>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:max-w-2xl">
        {field("Year", year, setYear, years)}
        {field("Month", month, setMonth, MONTHS)}
        {field("Meeting type", type, setType, types)}
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        Showing {filtered.length} of {items.length} {noun}
        {active ? (
          <button type="button" className="ml-3 underline" onClick={() => { setYear("All"); setMonth("All"); setType("All"); }}>Reset</button>
        ) : null}
      </p>
      {filtered.length === 0 ? (
        <p className="mt-4 rounded-md border border-dashed border-border px-5 py-6 text-sm text-muted-foreground">
          No {noun} match those filters. Try another month or set a filter back to All.
        </p>
      ) : null}
    </>
  );
  return { filtered, controls };
}
