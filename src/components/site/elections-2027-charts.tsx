import type { ReactNode } from "react";
import { countText, districtsForLocality, entriesForLocality, partyCount, seatPill, sumParty, type Coverage, type Entry, type Office, type SeatPill } from "@/lib/elections-2027";
import { cn } from "@/lib/utils";

/**
 * Simple Republican vs Democrat charts for /2027 (the layout Scott approved in the Loudoun mockup): one row per seat with the seat
 * name, plain-text counts, one solid square per counted committee and one short status pill. No bars, no names.
 * Counts are registered 2027 campaign committees in the Virginia Department of Elections campaign finance system that pass the
 * 2027 counting rule (tools/elections-2027/registrations.py): 2027 cycle, not closed, residence inside the seat, and a 2027 signal.
 * Party comes only from the committee record; no party = "Party not listed" (gray), never Republican, Democrat or Other.
 */
const COLOR = { R: "#c8102e", D: "#1d4ed8", Other: "#7c4dbd", none: "#8a93a6" } as const;
type PartyKey = keyof typeof COLOR;
export const REGISTRATIONS_SUBTITLE = "registered 2027 campaign committees (official state record); ballot lists not yet posted.";
const CF_SOURCE = "Virginia Department of Elections campaign finance reports and Statements of Organization";
export const RULE_TEXT =
  "A committee counts if it is on the Virginia Department of Elections Nov. 2027 cycle, has not filed a final report, its Statement of Organization lists a residence inside the seat, and it shows a 2027 signal: registered in 2026 or later, a 2026 Statement of Organization naming 2027, money raised on a 2026 report, or it belongs to the seat's current officeholder. Committees carried forward automatically from earlier races with none of these are not counted.";
const PILL_NOTE = "“Member not filed” means the current officeholder (official member list) has no counted 2027 committee yet; it does not mean the seat is vacant. “Check” means the officeholder's committee carries a Virginia Department of Elections record-keeping flag (a final report, or “Do Not Use”) that needs review.";
const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const sum = (es: Entry[]) => sumParty(es.map(partyCount));
const keyOf = (p: string | null): PartyKey => (p === "R" || p === "D" ? p : p ? "Other" : "none");
const ORDER: PartyKey[] = ["R", "D", "Other", "none"];

function Figure({ n, title, caption, asOf, source, children, id }: { n: string; title: string; caption: ReactNode; asOf: string; source: ReactNode; children: ReactNode; id: string }) {
  return (
    <figure id={id} className="rounded-[10px] border border-navy-line bg-white p-4 text-[#111827] sm:p-6" aria-labelledby={`${id}-t`}>
      <h3 id={`${id}-t`} className="text-lg font-bold leading-tight sm:text-[22px]">{title}</h3>
      <p className="mt-1 text-sm text-[#4b5563]">As of {fmtDate(asOf)} · {REGISTRATIONS_SUBTITLE}</p>
      <div className="mt-3">{children}</div>
      <figcaption className="mt-5 text-[13px] leading-relaxed text-[#4b5563]">
        <span className="font-bold text-[#111827]">Figure {n}.</span> {caption} Source: {source}.
      </figcaption>
    </figure>
  );
}
const A = ({ href, children }: { href: string; children: ReactNode }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline">{children}</a>;
const Sq = ({ k }: { k: PartyKey }) => <i className="inline-block size-3 shrink-0 rounded-[2px]" style={{ background: COLOR[k] }} aria-hidden />;

export function Legend() {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-[#374151]" aria-label="Color key">
      <li className="inline-flex items-center gap-1.5"><Sq k="R" />Republican</li>
      <li className="inline-flex items-center gap-1.5"><Sq k="D" />Democrat</li>
      <li className="inline-flex items-center gap-1.5"><Sq k="Other" />Other / Independent</li>
      <li className="inline-flex items-center gap-1.5"><Sq k="none" />Party not listed</li>
      <li>One square = one committee</li>
    </ul>
  );
}

const PILL_CLS: Record<SeatPill, string> = {
  Contested: "bg-[#ecfdf5] text-[#065f46]", "Incumbent only": "bg-[#f3f4f6] text-[#374151]", "One filed": "bg-[#f3f4f6] text-[#374151]",
  "Member not filed": "bg-[#eef2ff] text-[#3730a3]", Check: "bg-[#fef3c7] text-[#92400e]", "None filed": "bg-[#f3f4f6] text-[#6b7280]",
};
export function StatusPill({ p, title }: { p: SeatPill; title?: string }) {
  return <span title={title} className={cn("inline-block rounded-full px-2 py-0.5 text-[13px] font-semibold whitespace-nowrap", PILL_CLS[p])}>{p}</span>;
}

/** One seat: name (with an optional coverage note), plain-text counts, one square per committee, one status pill. */
function SeatRow({ label, sub, e }: { label: string; sub?: string; e: Entry }) {
  const c = partyCount(e);
  const keys = e.race.candidates.map((x) => keyOf(x.party)).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const p = seatPill(e.race);
  return (
    <li data-seat={e.race.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-t border-[#e5e7eb] py-2.5 text-[15px] sm:grid-cols-[13rem_minmax(0,1fr)_8.5rem_9rem] sm:gap-3">
      <span className="leading-tight font-semibold">{label}{sub ? <span className="block text-xs font-normal text-[#6b7280]">{sub}</span> : null}</span>
      <span className="justify-self-end sm:order-last sm:justify-self-start"><StatusPill p={p} title={p === "Check" ? e.race.check?.note : undefined} /></span>
      <span className="text-sm text-[#1f2937] sm:text-[15px]">{countText(c)}</span>
      <span className="flex flex-wrap justify-end gap-1 sm:justify-start" aria-label={`${keys.length} committees`}>{keys.map((k, i) => <Sq key={i} k={k} />)}</span>
    </li>
  );
}

/** Statewide House or Senate: Republican vs Democratic totals plus how many seats are in each status. */
export function StatewideChart({ office, entries, asOf, sourceUrl, n }: { office: "house" | "senate"; entries: Entry[]; asOf: string; sourceUrl: string; n: string }) {
  const t = sum(entries);
  const name = office === "house" ? "House of Delegates" : "State Senate";
  const pills: SeatPill[] = ["Contested", "Incumbent only", "One filed", "Member not filed", "Check", "None filed"];
  const by = Object.fromEntries(pills.map((p) => [p, entries.filter((e) => seatPill(e.race) === p).length])) as Record<SeatPill, number>;
  return (
    <Figure id={`fig-${office}`} n={n} title={`${name}: 2027 campaign committees, Republican vs Democrat`} asOf={asOf}
      source={<A href={sourceUrl}>{CF_SOURCE}</A>}
      caption={<>Counted committees for all {entries.length} {name} seats, by the party in each committee record. {RULE_TEXT} This is not a ballot list, a candidacy declaration, or a prediction.</>}>
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
        <p><span className="text-3xl font-bold" style={{ color: COLOR.R }}>{t.R}</span> <span className="text-sm font-semibold text-[#374151]">Republican</span></p>
        <p><span className="text-3xl font-bold" style={{ color: COLOR.D }}>{t.D}</span> <span className="text-sm font-semibold text-[#374151]">Democrat</span></p>
        {t.Other ? <p><span className="text-xl font-bold" style={{ color: COLOR.Other }}>{t.Other}</span> <span className="text-sm text-[#374151]">Other / Independent</span></p> : null}
        {t.notListed ? <p><span className="text-xl font-bold" style={{ color: COLOR.none }}>{t.notListed}</span> <span className="text-sm text-[#374151]">Party not listed</span></p> : null}
      </div>
      <p className="mt-1 text-sm text-[#4b5563]">{t.total} counted committees across {entries.length} seats.</p>
      <ul className="mt-3" aria-label={`${name} seats by status`}>
        {pills.filter((p) => by[p]).map((p) => (
          <li key={p} className="flex items-center justify-between gap-3 border-t border-[#e5e7eb] py-2 text-[15px]">
            <StatusPill p={p} /><span className="font-semibold">{by[p]} {by[p] === 1 ? "seat" : "seats"}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-[#4b5563]">{PILL_NOTE} Tap a district in the grid below for every committee in it.</p>
    </Figure>
  );
}

const covText = (cov: Coverage, name: string) => (cov.coverage === "all" ? `includes all of ${name}` : `includes part of ${name}`);
const GROUP: Partial<Record<Office, string>> = { bos: "Board of Supervisors", sb: "School Board (nonpartisan ballot; party as self-reported to the Virginia Department of Elections)", co: "Constitutional officers" };

export function LocalityChart({ id, name, all, asOf, sourceUrl, coverageUrl, coverageLabel, n }: { id: string; name: string; all: Entry[]; asOf: string; sourceUrl: string; coverageUrl: string; coverageLabel: string; n: string }) {
  const local = entriesForLocality(all, id).filter((e) => e.office !== "house" && e.office !== "senate");
  const ga = { house: districtsForLocality(all, "house", id), senate: districtsForLocality(all, "senate", id) };
  const offices = (["bos", "sb", "co"] as Office[]).filter((o) => local.some((e) => e.office === o));
  const checks = [...local, ...ga.house.map((x) => x.e), ...ga.senate.map((x) => x.e)].filter((e) => seatPill(e.race) === "Check");
  const seatLabel = (e: Entry) => {
    const s = e.race.seat === "Chair" ? "Chair (at large)" : e.race.seat;
    const own = e.race.locality_id === id;
    return `${s}${e.race.seats > 1 ? ` (${e.race.seats} seats)` : ""}${own ? "" : ` (shared with ${e.race.locality})`}`;
  };
  return (
    <Figure id={`fig-loc-${id}`} n={n} title={`${name}: 2027 campaign committees by seat`} asOf={asOf}
      source={<><A href={sourceUrl}>{CF_SOURCE}</A>; seats from the Virginia Department of Elections 2027 election calendars; district coverage from <A href={coverageUrl}>{coverageLabel}</A> (current districts drawn by the Supreme Court of Virginia, first used 2023)</>}
      caption={<>Committees counted per {name} seat on the 2027 ballot, then each House of Delegates and State Senate district that includes any part of {name}. {RULE_TEXT} This is not a ballot list, a candidacy declaration, or a prediction. {PILL_NOTE}</>}>
      <Legend />
      {offices.map((o) => (
        <div key={o} data-section={o}>
          <p className="mt-5 mb-1 text-[13px] font-semibold tracking-[0.04em] text-[#6b7280] uppercase">{GROUP[o]}</p>
          <ul>{local.filter((e) => e.office === o).map((e) => <SeatRow key={e.race.id} label={seatLabel(e)} e={e} />)}</ul>
        </div>
      ))}
      {!local.length ? <p className="mt-4 text-sm">No local races on {name}'s 2027 ballot.</p> : null}
      {(["house", "senate"] as const).map((o) => (ga[o].length ? (
        <div key={o} data-section={o}>
          <p className="mt-5 mb-1 text-[13px] font-semibold tracking-[0.04em] text-[#6b7280] uppercase">{o === "house" ? "House of Delegates" : "State Senate"} (districts that include any part of {name})</p>
          <ul>{ga[o].map(({ e, cov }) => <SeatRow key={e.race.id} label={`District ${e.race.district}`} sub={covText(cov, name)} e={e} />)}</ul>
        </div>
      ) : null))}
      {checks.length ? (
        <ul className="mt-4 space-y-1 rounded-md bg-[#fffbeb] px-3 py-2 text-[13px] text-[#78350f]" aria-label="Seats marked Check">
          {checks.map((e) => <li key={e.race.id}><span className="font-semibold">Check, {seatLabel(e)}:</span> {e.race.check?.note} <A href={e.race.check?.committee_url ?? sourceUrl}>Committee record</A></li>)}
        </ul>
      ) : null}
    </Figure>
  );
}
