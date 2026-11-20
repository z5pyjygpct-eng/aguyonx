import type { ReactNode } from "react";
import { CHART_STATUS_LABEL, chartStatus, entriesForLocality, OFFICE_LABEL, partyCount, raceTitle, type Entry, type Office } from "@/lib/elections-2027";
import { cn } from "@/lib/utils";

/**
 * Republican vs Democrat charts for /2027, drawn from the same official JSON as the rest of the page (no images, no names).
 * Party comes only from the official filing record; school board is nonpartisan, so those rows show a total unless an official
 * source gives a party. Status is a small secondary label.
 */
const RED = "bg-[#c8102e]";
const BLUE = "bg-[#1d4ed8]";
const GRAY = "bg-[#8a93a6]";
const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const sum = (es: Entry[]) => es.map(partyCount).reduce((a, b) => ({ R: a.R + b.R, D: a.D + b.D, Other: a.Other + b.Other, nonpartisan: a.nonpartisan + b.nonpartisan, total: a.total + b.total }), { R: 0, D: 0, Other: 0, nonpartisan: 0, total: 0 });

function Figure({ n, title, caption, asOf, source, sourceUrl, children, id }: { n: string; title: string; caption: string; asOf: string; source: string; sourceUrl: string; children: ReactNode; id: string }) {
  return (
    <figure id={id} className="rounded-[10px] border border-navy-line bg-[#F6F3EA] p-4 text-[#13233f] sm:p-5" aria-labelledby={`${id}-t`}>
      <h3 id={`${id}-t`} className="font-serif text-lg font-bold uppercase leading-tight sm:text-xl">{title}</h3>
      <p className="mt-0.5 text-xs text-[#4b5872]">As of {fmtDate(asOf)} · candidates on an official list for the Nov. 2, 2027 ballot</p>
      <div className="mt-4">{children}</div>
      <figcaption className="mt-4 border-t border-[#d9d3c3] pt-2 text-xs text-[#4b5872]">
        <span className="font-semibold text-[#13233f]">Figure {n}.</span> {caption}{" "}
        Source: <a href={sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{source}</a>.
      </figcaption>
    </figure>
  );
}

function Legend({ other, nonpartisan }: { other: boolean; nonpartisan?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Color key">
      <li className="flex items-center gap-1.5"><span className={cn("inline-block size-3 rounded-sm", RED)} aria-hidden />Republican</li>
      <li className="flex items-center gap-1.5"><span className={cn("inline-block size-3 rounded-sm", BLUE)} aria-hidden />Democrat</li>
      {other ? <li className="flex items-center gap-1.5"><span className={cn("inline-block size-3 rounded-sm", GRAY)} aria-hidden />Other or independent</li> : null}
      {nonpartisan ? <li className="flex items-center gap-1.5"><span className="inline-block size-3 rounded-sm bg-[#13233f]" aria-hidden />Nonpartisan (school board)</li> : null}
    </ul>
  );
}

/** One row: red count | blue count (+ gray if any), or a nonpartisan total for school board. */
function PartyRow({ label, e, max, tip }: { label: string; e: Entry; max: number; tip: string }) {
  const c = partyCount(e);
  const nonpartisanRow = e.office === "sb" && c.R + c.D + c.Other === 0;
  const w = (k: number) => `${(k / max) * 100}%`;
  const status = CHART_STATUS_LABEL[chartStatus(e)];
  return (
    <li title={tip} className="grid grid-cols-[minmax(0,8.5rem)_1fr] items-center gap-x-3 gap-y-0.5 text-sm sm:grid-cols-[minmax(0,13rem)_1fr_7rem]">
      <span className="font-semibold leading-tight">{label}</span>
      {nonpartisanRow ? (
        <span className="flex items-center gap-2">
          <span className="text-xs text-[#4b5872]">Nonpartisan</span>
          <span className="flex h-4 flex-1 items-center">{c.total ? <span className="block h-4 rounded-sm bg-[#13233f]" style={{ width: w(c.total) }} /> : null}</span>
          <span className="w-6 text-right font-mono">{c.total}</span>
        </span>
      ) : (
        <span className="grid grid-cols-2 items-center gap-1" aria-label={`${c.R} Republican, ${c.D} Democrat${c.Other ? `, ${c.Other} other` : ""}`}>
          <span className="flex h-5 items-center justify-end gap-1">
            <span className="font-mono text-xs text-[#c8102e]">{c.R}</span>
            <span className={cn("block h-4 rounded-l-sm", RED)} style={{ width: w(c.R) }} />
          </span>
          <span className="flex h-5 items-center gap-1">
            <span className={cn("block h-4 rounded-r-sm", BLUE)} style={{ width: w(c.D) }} />
            {c.Other ? <span className={cn("block h-4 rounded-sm", GRAY)} style={{ width: w(c.Other) }} title={`${c.Other} other or independent`} /> : null}
            <span className="font-mono text-xs text-[#1d4ed8]">{c.D}</span>
            {c.Other ? <span className="font-mono text-xs text-[#4b5872]">+{c.Other}</span> : null}
          </span>
        </span>
      )}
      <span className="col-start-2 text-[11px] text-[#4b5872] sm:col-start-auto sm:text-right">{status}</span>
    </li>
  );
}

export function StatewideChart({ office, entries, asOf, sourceUrl, n }: { office: "house" | "senate"; entries: Entry[]; asOf: string; sourceUrl: string; n: string }) {
  const t = sum(entries);
  const name = OFFICE_LABEL[office];
  const short = office === "house" ? "House" : "Senate";
  const both = Math.max(1, t.R + t.D + t.Other);
  return (
    <Figure id={`fig-${office}`} n={n} title={`${name}: Republican vs Democratic candidates`} asOf={asOf} source="Virginia Department of Elections candidate lists" sourceUrl={sourceUrl}
      caption={`Candidates on an official list for the ${entries.length} ${name} seats, by party. It is not a forecast and does not count people announced in the news.`}>
      <div className="flex items-end justify-between gap-4">
        <p className="text-[#c8102e]"><span className="block font-serif text-4xl font-bold leading-none">{t.R}</span><span className="text-xs font-semibold uppercase">Republican</span></p>
        <p className="text-right text-[#1d4ed8]"><span className="block font-serif text-4xl font-bold leading-none">{t.D}</span><span className="text-xs font-semibold uppercase">Democrat</span></p>
      </div>
      <div className="mt-2 flex h-3 overflow-hidden rounded-sm bg-[#e7e1d2]" aria-hidden>
        <span className={RED} style={{ width: `${(t.R / both) * 100}%` }} />
        {t.Other ? <span className={GRAY} style={{ width: `${(t.Other / both) * 100}%` }} /> : null}
        <span className={cn("ml-auto", BLUE)} style={{ width: `${(t.D / both) * 100}%` }} />
      </div>
      <p className="mt-1 text-xs text-[#4b5872]">{t.total ? `${t.total} candidates filed${t.Other ? `, including ${t.Other} other or independent` : ""}.` : "No candidates on an official list yet, so every seat shows 0 and 0."}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide">Republican and Democratic candidates, by district</p>
      <ol className={cn("mt-1 grid gap-1", office === "house" ? "grid-cols-10" : "grid-cols-8 sm:grid-cols-10")} aria-label={`${name} districts`}>
        {entries.map((e) => {
          const c = partyCount(e);
          const tip = `${short} District ${e.race.district}: ${c.R} Republican, ${c.D} Democrat${c.Other ? `, ${c.Other} other` : ""} · ${CHART_STATUS_LABEL[chartStatus(e)].toLowerCase()}`;
          return (
            <li key={e.race.id} title={tip} aria-label={tip} tabIndex={0} className="overflow-hidden rounded-sm border border-[#d9d3c3] bg-white text-center leading-none focus:outline focus:outline-2 focus:outline-[#13233f]">
              <span className="block py-0.5 text-[10px] font-semibold">{e.race.district}</span>
              <span className="grid grid-cols-2 text-[10px] font-bold text-white">
                <span className={cn("py-0.5", c.R ? RED : "bg-[#e9b9c0]")}>{c.R}</span>
                <span className={cn("py-0.5", c.D ? BLUE : "bg-[#b9c6ec]")}>{c.D}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3"><Legend other={t.Other > 0} /></div>
      <p className="mt-1 text-[11px] text-[#4b5872]">Each square is one district: red is Republican candidates, blue is Democratic candidates. Hover or tap for details.</p>
    </Figure>
  );
}

export function LocalityChart({ id, name, all, asOf, sourceUrl, n }: { id: string; name: string; all: Entry[]; asOf: string; sourceUrl: string; n: string }) {
  const es = entriesForLocality(all, id);
  const t = sum(es);
  const max = Math.max(1, ...es.map((e) => { const c = partyCount(e); return Math.max(c.R, c.D + c.Other, c.nonpartisan); }));
  const offices = [...new Set(es.map((e) => e.office))] as Office[];
  const shared = es.filter((e) => e.race.locality_id !== id);
  return (
    <Figure id={`fig-loc-${id}`} n={n} title={`${name}: Republican vs Democratic candidates by seat`} asOf={asOf} source="Virginia Department of Elections candidate lists and ballot calendars, and county elections offices" sourceUrl={sourceUrl}
      caption={`One row for each local office or seat on ${name}'s 2027 ballot: Republican candidates to the left, Democratic to the right. School board is officially nonpartisan, so those rows show a total. House and Senate are in Figures 1 and 2.`}>
      {es.length ? (
        <>
          <p className="text-sm"><span className="font-semibold text-[#c8102e]">{t.R} Republican</span> · <span className="font-semibold text-[#1d4ed8]">{t.D} Democrat</span>{t.Other ? ` · ${t.Other} other` : ""}{t.nonpartisan ? ` · ${t.nonpartisan} nonpartisan` : ""} · {es.length} seats</p>
          <div className="mt-3 space-y-4">
            {offices.map((o) => (
              <div key={o}>
                <p className="text-xs font-semibold uppercase tracking-wide">{OFFICE_LABEL[o]}</p>
                <ul className="mt-1 space-y-1.5">
                  {es.filter((e) => e.office === o).map((e) => {
                    const c = partyCount(e);
                    const label = e.race.locality_id === id ? `${e.race.seat}${e.race.seats > 1 ? ` (${e.race.seats} seats)` : ""}` : `${e.race.seat} (shared)`;
                    const tip = `${raceTitle(e)}: ${o === "sb" && !c.R && !c.D && !c.Other ? `${c.total} nonpartisan` : `${c.R} Republican, ${c.D} Democrat${c.Other ? `, ${c.Other} other` : ""}`} · ${CHART_STATUS_LABEL[chartStatus(e)].toLowerCase()}`;
                    return <PartyRow key={e.race.id} label={label} e={e} max={max} tip={tip} />;
                  })}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-3"><Legend other={t.Other > 0} nonpartisan={offices.includes("sb")} /></div>
          {shared.length ? <p className="mt-1 text-[11px] text-[#4b5872]">Shared: {name} voters vote in the {shared[0].race.locality} {[...new Set(shared.map((e) => e.race.seat.toLowerCase()))].join(" and ")} races.</p> : null}
        </>
      ) : <p className="text-sm">No local races on {name}'s 2027 ballot.</p>}
    </Figure>
  );
}
