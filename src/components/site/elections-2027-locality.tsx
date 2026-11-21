import { Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import BOS from "@/lib/elections-2027-bos.json";
import SB from "@/lib/elections-2027-sb.json";
import CO from "@/lib/elections-2027-co.json";
import type { Cand } from "@/lib/elections-2027";
import { PRESUMED_NOTE } from "@/lib/elections-2027-challengers";
import { endorsementFor, LOCAL_VIEW_IDS, localSections, summarize, type LocalFile, type LocalOffice, type LocalRow, type LocalSection } from "@/lib/elections-2027-local";
import { REG_SOURCE, ext } from "@/components/site/elections-2027-seats";
import { Election2027Hero } from "@/components/site/elections-2027-hero";
import { NoFilingTag } from "@/components/site/elections-2027-chamber";
import { E27_LOCAL } from "@/lib/election-2027-dashboard";

/**
 * /2027/<slug>: one locality template (Scott's local mockup). Hero with the locality name box, site search, button group from
 * LOCAL_VIEWS (only offices on that locality's 2027 ballot), a count strip, and the picked office's table. URL: ?view=bos|sb|co.
 * No chart: Scott flagged the old Loudoun chart as confusing (Nov 19); tables are the main view.
 */
export type LocalitySearch = { view?: LocalOffice };
export const parseLocalitySearch = (s: Record<string, unknown>): LocalitySearch => (typeof s.view === "string" && LOCAL_VIEW_IDS.has(s.view) ? { view: s.view as LocalOffice } : {});

const FILES = { bos: BOS, sb: SB, co: CO } as unknown as Record<LocalOffice, LocalFile>;
export const LOCALITY_NAME: Record<string, string> = {
  albemarle: "Albemarle County", chesterfield: "Chesterfield County", "fairfax-county": "Fairfax County", "fairfax-city": "City of Fairfax",
  hanover: "Hanover County", henrico: "Henrico County", loudoun: "Loudoun County", manassas: "City of Manassas", "prince-william": "Prince William County",
};
export const isLocality = (slug: string) => E27_LOCAL.some((b) => b.slug === slug);

const CARD = "min-w-0 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7";
const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

function PartyBadge({ party, label, source, title }: { party: string | null; label?: string | null; source?: string | null; title?: string | null }) {
  const word = party === "D" ? "Democrat" : party === "R" ? "Republican" : party ? (label && label !== "Other" ? label : "Independent / Other") : "Party not listed";
  const cls = party === "D" ? "bg-[#2563c9] text-white" : party === "R" ? "bg-flag text-white" : party ? "bg-slate-500 text-white" : "border border-navy-line text-on-dark-muted";
  const el = <span className={cn("inline-flex rounded-sm px-1.5 py-px text-[11px] font-bold whitespace-nowrap", cls)}>{word}</span>;
  return source ? <a href={source} {...ext} title={title ?? "Party as listed in the official record"} className="inline-flex">{el}</a> : el;
}

function Person({ c, badge }: { c: Cand; badge: boolean }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
      <a href={c.committee_url ?? c.filing_source_url} {...ext} className="font-semibold text-white underline decoration-navy-line underline-offset-4 hover:decoration-gold">{c.name}</a>
      {badge ? <PartyBadge party={c.party} label={c.party_label} /> : null}
    </span>
  );
}

function Challengers({ cs, badge }: { cs: Cand[]; badge: boolean }) {
  if (!cs.length) return <span className="text-on-dark-muted" aria-label="none">—</span>;
  return <ul className="space-y-1.5">{cs.map((c) => <li key={c.committee_code ?? c.name}><Person c={c} badge={badge} /></li>)}</ul>;
}

function Incumbents({ row }: { row: LocalRow }) {
  const sb = row.office === "sb";
  if (!row.incumbents.length) return <span className="text-sm text-on-dark-muted">Not in our data yet (no official roster loaded for this seat)</span>;
  return (
    <div className="space-y-2">
      {row.incumbents.map((i) => (
        <div key={i.member.name}>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a href={i.member.source_url} {...ext} className="font-semibold text-white underline decoration-navy-line underline-offset-4 hover:decoration-gold">{i.member.name}</a>
            {sb ? null : <PartyBadge party={i.party} label={i.partyLabel} source={i.partySource} title={i.partyTitle} />}
          </p>
          {i.runningFor ? (
            <p className="mt-1"><a href={i.runningFor.committee_url ?? undefined} {...ext} title="Registered for another 2027 office, so not presumed to run for this seat" className="inline-flex rounded-full border border-gold/60 px-2 py-0.5 text-[11px] font-medium text-gold">Running for {i.runningFor.office}, not this seat</a></p>
          ) : !i.filed && !row.check ? <p className="mt-1"><NoFilingTag /></p> : null}
        </div>
      ))}
      {row.check && row.race.check ? <p className="text-xs text-[#fcd34d]"><span className="font-bold">! Check:</span> {row.race.check.note} <a href={row.race.check.committee_url} {...ext} className="text-gold underline">Committee record</a></p> : null}
      {row.same.length ? <p className="text-xs text-on-dark-muted">Also registered, same party (possible primary): {row.same.map((c) => c.name).join(", ")}</p> : null}
      {row.race.seats > 1 ? <p className="text-xs text-on-dark-muted">{row.race.seats} seats; the top {row.race.seats} win.</p> : null}
    </div>
  );
}

function SupportedBy({ row }: { row: LocalRow }) {
  const names = [...row.incumbents.map((i) => i.member.name), ...row.challengers.map((c) => c.name)];
  const es = names.map((n) => ({ n, e: endorsementFor(row.race.id, n) })).filter((x) => x.e);
  if (!es.length) return <span className="text-on-dark-muted" aria-label="none">—</span>;
  return <ul className="space-y-1">{es.map(({ n, e }) => <li key={n}>{n}: <a href={e!.source_url} {...ext} className="text-gold underline">{e!.party === "D" ? "Democrat" : "Republican"} ({e!.by})</a></li>)}</ul>;
}

function Section({ sec }: { sec: LocalSection }) {
  const sb = sec.view === "sb";
  const cols = sb ? ["District", "Incumbent", "Challenger(s)", "Supported by (R or D)"] : [sec.view === "co" ? "Office" : "District", "Incumbent", "Challenger(s)"];
  const seatCell = (r: LocalRow) => <span className="font-serif text-lg font-bold text-gold">{r.seat}{r.sharedFrom ? <span className="block font-sans text-xs font-normal text-on-dark-muted">{r.sharedFrom} race (shared office)</span> : null}</span>;
  return (
    <section id="view-list" aria-labelledby="view-list-h" className={cn(CARD, "mt-6 scroll-mt-24")} data-view-list={sec.view}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="view-list-h" className="font-serif text-2xl font-semibold uppercase">{sec.label}</h2>
        <p className="font-mono text-sm text-gold" role="status">{sec.rows.length} {sec.rows.length === 1 ? "seat" : "seats"} on the 2027 ballot</p>
      </div>
      {sb ? <p className="mt-2 text-sm text-on-dark-muted">School board races are nonpartisan on the ballot. "Supported by" is filled only from a published endorsement by the county's official Republican or Democratic committee, with its source; a dash means none found.</p> : null}
      {sec.loc?.note ? <p className="mt-2 text-sm text-on-dark-muted">{sec.loc.note} {sec.loc.note_source_url ? <a href={sec.loc.note_source_url} {...ext} className="text-gold underline">Source</a> : null}</p> : null}
      <table className="mt-4 hidden w-full table-fixed border-collapse text-left text-sm md:table">
        <thead>
          <tr className="border-b border-navy-line font-mono text-xs tracking-widest text-gold uppercase">
            {cols.map((c, i) => <th key={c} scope="col" className={cn("py-2 pr-3", i === 0 && "w-44")}>{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy-line">
          {sec.rows.map((r) => (
            <tr key={r.race.id} className="align-top">
              <td className="py-3 pr-3">{seatCell(r)}</td>
              <td className="py-3 pr-3"><Incumbents row={r} /></td>
              <td className="py-3 pr-3"><Challengers cs={r.challengers} badge={!sb} /></td>
              {sb ? <td className="py-3 pr-3"><SupportedBy row={r} /></td> : null}
            </tr>
          ))}
        </tbody>
      </table>
      <ul className="mt-4 space-y-3 md:hidden">
        {sec.rows.map((r) => (
          <li key={r.race.id} className="rounded-xl border border-navy-line bg-navy-800 p-4">
            {seatCell(r)}
            <dl className="mt-2 grid grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              <dt className="text-xs font-semibold text-on-dark-muted uppercase">Incumbent</dt><dd className="min-w-0"><Incumbents row={r} /></dd>
              <dt className="text-xs font-semibold text-on-dark-muted uppercase">Challenger(s)</dt><dd className="min-w-0"><Challengers cs={r.challengers} badge={!sb} /></dd>
              {sb ? <><dt className="text-xs font-semibold text-on-dark-muted uppercase">Supported by</dt><dd className="min-w-0"><SupportedBy row={r} /></dd></> : null}
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-xl border border-navy-line border-l-4 border-l-gold bg-navy-800 px-4 py-3">
      <p className="font-serif text-3xl font-bold text-gold">{n}</p>
      <p className="text-sm text-on-dark-muted">{label}</p>
    </div>
  );
}

export function LocalityPage({ slug, s }: { slug: string; s: LocalitySearch }) {
  const name = LOCALITY_NAME[slug] ?? slug;
  const { shown, offBallot } = localSections(slug, FILES);
  const sec = shown.find((x) => x.view === s.view);
  const sum = summarize(shown);
  const own = shown.some((x) => x.rows.some((r) => !r.sharedFrom));
  const asOf = FILES.bos.as_of;
  return (
    <main className="agx-dark flex-1 bg-navy-800 text-white">
      <Election2027Hero crumbs={[{ label: "2027 Election Dashboard", to: "/2027" }, { label: name }]} label={name} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        {shown.length ? (
          <div className={CARD}>
            <h2 className="font-serif text-2xl font-semibold uppercase">{name} 2027 races</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3" role="group" aria-label="Offices">
              {shown.map((x) => {
                const on = s.view === x.view;
                return (
                  <Link key={x.view} to="/2027/$locality" params={{ locality: slug }} search={on ? {} : { view: x.view }} replace resetScroll={false} aria-pressed={on} data-view={x.view}
                    className={cn("flex min-h-[72px] items-center gap-4 rounded-xl border border-navy-line border-l-4 px-5 py-3 transition-colors hover:border-gold",
                      on ? "border-gold border-l-gold bg-gold text-navy-900" : "border-l-gold bg-navy-800 hover:bg-navy-600")}>
                    <span className="min-w-0 flex-1 text-base font-semibold uppercase sm:text-lg">{x.label}</span>
                    <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 font-mono text-sm font-bold", on ? "bg-navy-900/15" : "bg-navy-900/60 text-gold")}>{x.rows.length}</span>
                  </Link>
                );
              })}
            </div>
            {own ? (
              <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat n={sum.seats} label="Seats on the 2027 ballot" />
                <Stat n={sum.incumbentsKnown} label="Incumbents in our data" />
                <Stat n={sum.incumbentsFiled} label="Incumbents with a 2027 filing" />
                <Stat n={sum.challengers} label="Registered challengers" />
              </div>
            ) : null}
            {offBallot.length ? (
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-on-dark-muted">
                {offBallot.map((o) => <li key={o.body}>{name} {o.body}: not on the 2027 ballot; next election {o.next}. <a href={o.source_url} {...ext} className="text-gold underline">Official calendar</a></li>)}
              </ul>
            ) : null}
            <p className="mt-5 text-xs text-on-dark-muted">
              "Challengers" are registered 2027 campaign committees in the state's campaign finance records, not certified ballot candidates; official ballot lists are not posted yet. {PRESUMED_NOTE}{own && sum.runningElsewhere ? ` Exception: ${sum.runningElsewhere === 1 ? "1 current member is" : `${sum.runningElsewhere} current members are`} registered for another 2027 office and not presumed to run for ${sum.runningElsewhere === 1 ? "that seat" : "those seats"}.` : ""} As of {fmtDate(asOf)}.{" "}
              <a href={REG_SOURCE} {...ext} className="inline-flex items-center gap-1 text-gold underline">Virginia Department of Elections campaign finance reports <ExternalLink className="size-3" aria-hidden /></a>
            </p>
          </div>
        ) : (
          <div className={cn(CARD, "max-w-3xl")}>
            <span className="inline-flex whitespace-nowrap rounded-full bg-on-dark-muted px-3 py-1 text-xs font-bold text-navy-800">Coming soon</span>
            <h2 className="mt-4 font-serif text-2xl font-semibold uppercase">{name} 2027 races</h2>
            <p className="mt-3 text-[#F6F3EA]">We have not posted 2027 race data for {name} yet. This page will fill in once it is built from official records.</p>
            <Link to="/2027" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-gold px-4 font-semibold text-navy-800 hover:bg-gold-hover">
              Back to the 2027 Election Dashboard <ArrowRight className="ml-1 size-4" />
            </Link>
          </div>
        )}
        {sec ? <Section sec={sec} /> : null}
        <p className="mt-8 text-sm text-night-muted">
          Full race list with every filter: <Link to="/2027/races" search={{ r_loc: slug } as never} hash="races" className="text-gold underline">all 2027 races</Link>.
        </p>
      </section>
    </main>
  );
}
