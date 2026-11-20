import type { ReactNode } from "react";
import { CHART_STATUS_LABEL, chartStatus, districtsForLocality, entriesForLocality, OFFICE_LABEL, partyCount, raceTitle, sumParty, type Coverage, type Entry, type Office } from "@/lib/elections-2027";
import { cn } from "@/lib/utils";

/**
 * Republican vs Democrat charts for /2027, drawn from the same official JSON as the rest of the page (no images, no names).
 * Counts are registered 2027 campaign committees from the Virginia Department of Elections campaign finance system until official
 * ballot lists are posted. Party comes only from the committee record; a record with no party is "Party not listed" (gray), which
 * is never counted as Republican, Democrat or Other. Status is a small secondary label.
 */
const RED = "bg-[#c8102e]";
const BLUE = "bg-[#1d4ed8]";
const OTHER = "bg-[#7c4dbd]";
const GRAY = "bg-[#8a93a6]";
export const REGISTRATIONS_SUBTITLE = "registered 2027 campaign committees (official state record); ballot lists not yet posted.";
const CF_SOURCE = "Virginia Department of Elections campaign finance reports (candidate committee registrations)";
const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const sum = (es: Entry[]) => sumParty(es.map(partyCount));
const breakdown = (c: { R: number; D: number; Other: number; notListed: number }) =>
  `${c.R} Republican, ${c.D} Democrat${c.Other ? `, ${c.Other} other party` : ""}${c.notListed ? `, ${c.notListed} party not listed` : ""}`;

function Figure({ n, title, caption, asOf, source, children, id }: { n: string; title: string; caption: string; asOf: string; source: ReactNode; children: ReactNode; id: string }) {
  return (
    <figure id={id} className="rounded-[10px] border border-navy-line bg-[#F6F3EA] p-4 text-[#13233f] sm:p-5" aria-labelledby={`${id}-t`}>
      <h3 id={`${id}-t`} className="font-serif text-lg font-bold uppercase leading-tight sm:text-xl">{title}</h3>
      <p className="mt-0.5 text-xs text-[#4b5872]">As of {fmtDate(asOf)} · {REGISTRATIONS_SUBTITLE}</p>
      <div className="mt-4">{children}</div>
      <figcaption className="mt-4 border-t border-[#d9d3c3] pt-2 text-xs text-[#4b5872]">
        <span className="font-semibold text-[#13233f]">Figure {n}.</span> {caption} Source: {source}.
      </figcaption>
    </figure>
  );
}
const A = ({ href, children }: { href: string; children: ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline">{children}</a>;

export function Legend({ other, notListed }: { other: boolean; notListed: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Color key">
      <li className="flex items-center gap-1.5"><span className={cn("inline-block size-3 rounded-sm", RED)} aria-hidden />Republican</li>
      <li className="flex items-center gap-1.5"><span className={cn("inline-block size-3 rounded-sm", BLUE)} aria-hidden />Democrat</li>
      {other ? <li className="flex items-center gap-1.5"><span className={cn("inline-block size-3 rounded-sm", OTHER)} aria-hidden />Other party (as listed, e.g. Independent)</li> : null}
      {notListed ? <li className="flex items-center gap-1.5"><span className={cn("inline-block size-3 rounded-sm", GRAY)} aria-hidden />Party not listed</li> : null}
    </ul>
  );
}

/** One row: Republican count to the left, Democratic to the right, then other-party and party-not-listed segments. */
function PartyRow({ label, sub, e, max, tip }: { label: string; sub?: string; e: Entry; max: number; tip: string }) {
  const c = partyCount(e);
  const w = (k: number) => `${(k / max) * 100}%`;
  const status = CHART_STATUS_LABEL[chartStatus(e)];
  return (
    <li title={tip} className="grid grid-cols-[minmax(0,8.5rem)_1fr] items-center gap-x-3 gap-y-0.5 text-sm sm:grid-cols-[minmax(0,13rem)_1fr_9rem]">
      <span className="leading-tight"><span className="font-semibold">{label}</span>{sub ? <span className="block text-[11px] text-[#4b5872]">{sub}</span> : null}</span>
      <span className="grid grid-cols-2 items-center gap-1" aria-label={breakdown(c)}>
        <span className="flex h-5 items-center justify-end gap-1">
          <span className="font-mono text-xs text-[#c8102e]">{c.R}</span>
          <span className={cn("block h-4 rounded-l-sm", RED)} style={{ width: w(c.R) }} />
        </span>
        <span className="flex h-5 items-center gap-1">
          <span className={cn("block h-4 rounded-r-sm", BLUE)} style={{ width: w(c.D) }} />
          {c.Other ? <span className={cn("block h-4 rounded-sm", OTHER)} style={{ width: w(c.Other) }} /> : null}
          {c.notListed ? <span className={cn("block h-4 rounded-sm", GRAY)} style={{ width: w(c.notListed) }} /> : null}
          <span className="font-mono text-xs text-[#1d4ed8]">{c.D}</span>
          {c.Other ? <span className="font-mono text-xs text-[#7c4dbd]">+{c.Other}</span> : null}
          {c.notListed ? <span className="font-mono text-xs text-[#4b5872]">+{c.notListed}</span> : null}
        </span>
      </span>
      <span className="col-start-2 text-[11px] text-[#4b5872] sm:col-start-auto sm:text-right">{status}</span>
    </li>
  );
}

export function StatewideChart({ office, entries, asOf, sourceUrl, n }: { office: "house" | "senate"; entries: Entry[]; asOf: string; sourceUrl: string; n: string }) {
  const t = sum(entries);
  const name = OFFICE_LABEL[office];
  const short = office === "house" ? "House" : "Senate";
  const all = Math.max(1, t.R + t.D + t.Other + t.notListed);
  return (
    <Figure id={`fig-${office}`} n={n} title={`${name}: Republican vs Democratic registered committees`} asOf={asOf}
      source={<A href={sourceUrl}>{CF_SOURCE}</A>}
      caption={`Registered 2027 campaign committees for the ${entries.length} ${name} seats, by the party in each committee record. A registration is not a spot on the ballot, it is not a forecast, and people announced only in the news are not counted.`}>
      <div className="flex items-end justify-between gap-4">
        <p className="text-[#c8102e]"><span className="block font-serif text-4xl font-bold leading-none">{t.R}</span><span className="text-xs font-semibold uppercase">Republican</span></p>
        <p className="text-right text-[#1d4ed8]"><span className="block font-serif text-4xl font-bold leading-none">{t.D}</span><span className="text-xs font-semibold uppercase">Democrat</span></p>
      </div>
      <div className="mt-2 flex h-3 overflow-hidden rounded-sm bg-[#e7e1d2]" aria-hidden>
        <span className={RED} style={{ width: `${(t.R / all) * 100}%` }} />
        {t.Other ? <span className={OTHER} style={{ width: `${(t.Other / all) * 100}%` }} /> : null}
        {t.notListed ? <span className={GRAY} style={{ width: `${(t.notListed / all) * 100}%` }} /> : null}
        <span className={cn("ml-auto", BLUE)} style={{ width: `${(t.D / all) * 100}%` }} />
      </div>
      <p className="mt-1 text-xs text-[#4b5872]">{t.total ? `${t.total} registered committees: ${breakdown(t)}.` : "No registered 2027 committee yet."}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wide">Republican and Democratic registered committees, by district</p>
      <ol className={cn("mt-1 grid gap-1", office === "house" ? "grid-cols-10" : "grid-cols-8 sm:grid-cols-10")} aria-label={`${name} districts`}>
        {entries.map((e) => {
          const c = partyCount(e);
          const tip = `${short} District ${e.race.district}: ${breakdown(c)} · ${CHART_STATUS_LABEL[chartStatus(e)].toLowerCase()}`;
          return (
            <li key={e.race.id} title={tip} aria-label={tip} tabIndex={0} className="overflow-hidden rounded-sm border border-[#d9d3c3] bg-white text-center leading-none focus:outline focus:outline-2 focus:outline-[#13233f]">
              <span className="block py-0.5 text-[10px] font-semibold">{e.race.district}{c.Other + c.notListed ? <span className="text-[#7c4dbd]">+</span> : null}</span>
              <span className="grid grid-cols-2 text-[10px] font-bold text-white">
                <span className={cn("py-0.5", c.R ? RED : "bg-[#e9b9c0]")}>{c.R}</span>
                <span className={cn("py-0.5", c.D ? BLUE : "bg-[#b9c6ec]")}>{c.D}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-3"><Legend other={t.Other > 0} notListed={t.notListed > 0} /></div>
      <p className="mt-1 text-[11px] text-[#4b5872]">Each square is one district: red is Republican committees, blue is Democratic committees; a + after the number means other-party or party-not-listed committees too. Hover or tap for details.</p>
    </Figure>
  );
}

const covText = (cov: Coverage, name: string) => (cov.coverage === "all" ? `includes all of ${name}` : `includes part of ${name}`);

export function LocalityChart({ id, name, all, asOf, sourceUrl, coverageUrl, coverageLabel, n }: { id: string; name: string; all: Entry[]; asOf: string; sourceUrl: string; coverageUrl: string; coverageLabel: string; n: string }) {
  const local = entriesForLocality(all, id).filter((e) => e.office !== "house" && e.office !== "senate");
  const ga = { house: districtsForLocality(all, "house", id), senate: districtsForLocality(all, "senate", id) };
  const everything = [...local, ...ga.house.map((x) => x.e), ...ga.senate.map((x) => x.e)];
  const t = sum(everything);
  const max = Math.max(1, ...everything.map((e) => { const c = partyCount(e); return Math.max(c.R, c.D + c.Other + c.notListed); }));
  const offices = [...new Set(local.map((e) => e.office))] as Office[];
  const shared = local.filter((e) => e.race.locality_id !== id);
  return (
    <Figure id={`fig-loc-${id}`} n={n} title={`${name}: Republican vs Democratic registered committees by seat`} asOf={asOf}
      source={<><A href={sourceUrl}>{CF_SOURCE}</A>; seats from Department of Elections ballot calendars; House and Senate coverage from <A href={coverageUrl}>{coverageLabel}</A></>}
      caption={`One row for each local seat on ${name}'s 2027 ballot, then one row for each House of Delegates and State Senate district that includes any part of ${name}: Republican committees to the left, Democratic to the right. School board is nonpartisan on the ballot; its party is only what the committee record lists. A registration is not a spot on the ballot.`}>
      <p className="text-sm"><span className="font-semibold text-[#c8102e]">{t.R} Republican</span> · <span className="font-semibold text-[#1d4ed8]">{t.D} Democrat</span>{t.Other ? ` · ${t.Other} other party` : ""}{t.notListed ? ` · ${t.notListed} party not listed` : ""} · {local.length} local seats, {ga.house.length} House and {ga.senate.length} Senate districts</p>
      <div className="mt-3 space-y-4">
        {offices.map((o) => (
          <div key={o}>
            <p className="text-xs font-semibold uppercase tracking-wide">{OFFICE_LABEL[o]}</p>
            <ul className="mt-1 space-y-1.5">
              {local.filter((e) => e.office === o).map((e) => {
                const label = e.race.locality_id === id ? `${e.race.seat}${e.race.seats > 1 ? ` (${e.race.seats} seats)` : ""}` : `${e.race.seat} (shared)`;
                return <PartyRow key={e.race.id} label={label} e={e} max={max} tip={`${raceTitle(e)}: ${breakdown(partyCount(e))} · ${CHART_STATUS_LABEL[chartStatus(e)].toLowerCase()}`} />;
              })}
            </ul>
          </div>
        ))}
        {!local.length ? <p className="text-sm">No local races on {name}'s 2027 ballot.</p> : null}
        {(["house", "senate"] as const).map((o) => (
          <div key={o} data-section={o}>
            <p className="text-xs font-semibold uppercase tracking-wide">{OFFICE_LABEL[o]} <span className="font-normal normal-case text-[#4b5872]">· districts that include any part of {name}</span></p>
            <ul className="mt-1 space-y-1.5">
              {ga[o].map(({ e, cov }) => (
                <PartyRow key={e.race.id} label={`${o === "house" ? "House" : "Senate"} District ${e.race.district}`} sub={covText(cov, name)} e={e} max={max}
                  tip={`${raceTitle(e)} (${covText(cov, name)}): ${breakdown(partyCount(e))} · ${CHART_STATUS_LABEL[chartStatus(e)].toLowerCase()}`} />
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3"><Legend other={t.Other > 0} notListed={t.notListed > 0} /></div>
      {shared.length ? <p className="mt-1 text-[11px] text-[#4b5872]">Shared: {name} voters vote in the {shared[0].race.locality} {[...new Set(shared.map((e) => e.race.seat.toLowerCase()))].join(" and ")} races.</p> : null}
      <p className="mt-1 text-[11px] text-[#4b5872]">District coverage: current districts drawn by the Supreme Court of Virginia (Dec. 2021, first used in 2023). A district “includes part of” a locality when the locality is split among districts.</p>
    </Figure>
  );
}
