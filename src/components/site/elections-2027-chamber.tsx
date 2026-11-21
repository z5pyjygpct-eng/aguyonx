import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ExternalLink, X } from "lucide-react";
import { cn } from "@/lib/utils";
import HOUSE from "@/lib/elections-2027-house.json";
import SENATE from "@/lib/elections-2027-senate.json";
import { candFinanceUrl, memberFinanceUrl, type Announced, type Cand, type Coverage, type Race } from "@/lib/elections-2027";
import { FinanceLink } from "@/components/site/finance-link";
import { CHAMBER_VIEWS, NO_FILING_TAG, PRESUMED_NOTE, rowsForView, toRow, unclearSeats, VIEW_BY_ID, VIEW_GROUPS, type ChallengerRow, type ChamberView } from "@/lib/elections-2027-challengers";
import { Card, Legend, MEMBER_ROUTE, REG_SOURCE, Tile, ext } from "@/components/site/elections-2027-seats";
import { Election2027Hero } from "@/components/site/elections-2027-hero";
import { AnnouncedName, ASTERISK_NOTE } from "@/components/site/elections-2027-announced";
import {
  chamberLocalityOptions,
  districtCoverageText,
  localityCoverageSummary,
  matchLocalityQuery,
  parseCountySearch,
  racesForChamberLocality,
  resolveCountyParam,
  unknownCountyMessage,
  type LocalityOption,
} from "@/lib/elections-2027-county";

/**
 * /2027/delegates and /2027/senate: one template. Seat chart from /2027/races (same tiles, legend, district panel), then the
 * button groups from the view registry (src/lib/elections-2027-challengers.ts). URL: ?view=<view id>&seat=<race id>&county=<locality id>.
 */
export type ChamberOffice = "house" | "senate";
export type ChamberSearch = { view?: string; seat?: string; county?: string };
type Data = { as_of: string; races: Race[]; registrations_rule?: string };

const DATA: Record<ChamberOffice, Data> = { house: HOUSE as unknown as Data, senate: SENATE as unknown as Data };
const ROUTE = { house: "/2027/delegates", senate: "/2027/senate" } as const;
const LABEL = { house: "Delegates", senate: "Senate" } as const;
const SEAT = { house: "HD", senate: "SD" } as const;
const PARTY = { D: "Democrat", R: "Republican" } as const;
const CARD = "min-w-0 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7";

const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function parseChamberSearch(s: Record<string, unknown>): ChamberSearch {
  const county = parseCountySearch(s.county);
  return {
    ...(typeof s.view === "string" && VIEW_BY_ID.has(s.view) ? { view: s.view } : {}),
    ...(typeof s.seat === "string" && /^[a-z]{2}\d{1,3}$/.test(s.seat) ? { seat: s.seat } : {}),
    ...(county ? { county } : {}),
  };
}

/** Keep county / view / seat in sync across in-page links. */
function linkSearch(s: ChamberSearch, patch: Partial<ChamberSearch> = {}): ChamberSearch {
  const next: ChamberSearch = { ...s, ...patch };
  for (const k of ["view", "seat", "county"] as const) if (!next[k]) delete next[k];
  return next;
}

/** Reusable button group: one titled row of toggle buttons. More groups (e.g. Campaign Finance) come from VIEW_GROUPS. */
function ViewButtons({ office, s, counts, fullCounts, scopeLabel }: {
  office: ChamberOffice; s: ChamberSearch; counts: Map<string, number>; fullCounts: Map<string, number>; scopeLabel?: string;
}) {
  return (
    <div className="space-y-6">
      {VIEW_GROUPS.map((g) => (
        <div key={g.id} role="group" aria-labelledby={`vg-${g.id}`}>
          <h2 id={`vg-${g.id}`} className="font-serif text-2xl font-semibold">{g.title}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CHAMBER_VIEWS.filter((v) => v.group === g.id).map((v) => {
              const on = s.view === v.id;
              const n = counts.get(v.id) ?? 0;
              const total = fullCounts.get(v.id) ?? 0;
              return (
                <Link key={v.id} to={ROUTE[office]} search={linkSearch(s, { view: on ? undefined : v.id })} replace resetScroll={false}
                  aria-pressed={on} data-view={v.id}
                  className={cn("flex min-h-[72px] min-w-0 items-center gap-4 rounded-xl border border-navy-line border-l-4 px-5 py-3 transition-colors hover:border-gold",
                    on ? "border-gold border-l-gold bg-gold text-navy-900" : "border-l-gold bg-navy-800 hover:bg-navy-600")}>
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg font-serif text-lg font-bold", on ? "bg-navy-900/15" : v.party === "R" ? "bg-flag/20 text-[#ff8a9a]" : "bg-[#2563c9]/25 text-[#8fb4f0]")}>{v.party}</span>
                  <span className="min-w-0 flex-1 text-base font-semibold uppercase sm:text-lg">{v.label}</span>
                  <span className={cn("shrink-0 text-right", on ? "" : "")}>
                    <span className={cn("inline-block rounded-full px-2.5 py-0.5 font-mono text-sm font-bold", on ? "bg-navy-900/15" : "bg-navy-900/60 text-gold")} data-view-count={v.id}>{n}</span>
                    {scopeLabel ? (
                      <span className={cn("mt-0.5 block text-[11px] leading-tight font-medium normal-case", on ? "text-navy-900/80" : "text-on-dark-muted")}>
                        in {scopeLabel}<span className="block">{total} total</span>
                      </span>
                    ) : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function partyWord(p: string | null | undefined, label?: string | null) {
  if (p === "D") return "Democrat";
  if (p === "R") return "Republican";
  if (p === "Other" && label) return label;
  return p ? "other party" : "party not listed";
}

function Names({ cs, empty = "—", showParty = false }: { cs: Cand[]; empty?: string; showParty?: boolean }) {
  if (!cs.length) return <span className="text-on-dark-muted" aria-label="none">{empty}</span>;
  return (
    <ul className="space-y-1">
      {cs.map((c) => (
        <li key={c.committee_code ?? c.name} className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            <a href={c.committee_url ?? c.filing_source_url} {...ext} className="font-semibold text-white underline decoration-navy-line underline-offset-4 hover:decoration-gold">{c.name}</a>
            {showParty || (c.party !== "D" && c.party !== "R") ? <span className="text-xs font-normal text-on-dark-muted"> ({partyWord(c.party, c.party_label)})</span> : null}
          </span>
          <FinanceLink url={candFinanceUrl(c)} name={c.name} />
        </li>
      ))}
    </ul>
  );
}

/** Filed names, then announced candidates (asterisk + note) in the same slot. Announced never change the counts or statuses. */
function WithAnnounced({ cs, ann, empty = "—", showParty = false, same }: { cs: Cand[]; ann: Announced[]; empty?: string; showParty?: boolean; same?: string | null }) {
  if (!ann.length) return <Names cs={cs} empty={empty} showParty={showParty} />;
  return (
    <div className="space-y-1">
      {cs.length ? <Names cs={cs} showParty={showParty} /> : null}
      <ul className="space-y-1">{ann.map((a) => <li key={a.name}><AnnouncedName a={a} sameParty={!!same && a.party === same} /></li>)}</ul>
    </div>
  );
}
const annOf = (r: Race, pick: (p: string | null) => boolean) => (r.announced ?? []).filter((a) => pick(a.party));
const isMajorP = (p: string | null) => p === "D" || p === "R";

export function NoFilingTag() {
  return <span className="inline-flex rounded-full border border-navy-line px-2 py-0.5 text-[11px] font-medium text-on-dark-muted" title={PRESUMED_NOTE}>{NO_FILING_TAG}</span>;
}

function Incumbent({ row, office, showParty }: { row: ChallengerRow; office: ChamberOffice; showParty?: boolean }) {
  const m = row.incumbent;
  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-white">
        {m.slug ? <Link to={`${MEMBER_ROUTE[office]}/${m.slug}` as never} className="underline decoration-navy-line underline-offset-4 hover:decoration-gold">{m.name}</Link> : m.name}
        {showParty ? <span className="font-normal text-on-dark-muted">({PARTY[row.party]})</span> : null}
        <FinanceLink url={memberFinanceUrl(row.race, m, row.race.candidates.find((c) => c.incumbent))} name={m.name} />
      </p>
      {row.status === "not-filed" ? <p className="mt-1"><NoFilingTag /></p> : null}
      {row.status === "check" && row.race.check ? (
        <p className="mt-1 text-xs text-[#fcd34d]"><span className="font-bold">! Check:</span> {row.race.check.note} <a href={row.race.check.committee_url} {...ext} className="text-gold underline">Committee record</a></p>
      ) : null}
      {annOf(row.race, (p) => p === row.party).length ? (
        <div className="mt-1 text-xs text-on-dark-muted">Also running, same party (possible primary):
          <ul className="mt-1 space-y-1">{annOf(row.race, (p) => p === row.party).map((a) => <li key={a.name}><AnnouncedName a={a} /></li>)}</ul>
        </div>
      ) : null}
      {row.same.length ? (
        <div className="mt-1 text-xs text-on-dark-muted">Also registered, same party:{" "}
          {row.same.map((c) => <span key={c.committee_code ?? c.name} className="mr-2 inline-flex flex-wrap items-center gap-x-1.5">{c.name} <FinanceLink url={candFinanceUrl(c)} name={c.name} /></span>)}
        </div>
      ) : null}
    </div>
  );
}

function ViewList({ office, v, rows, s, scopeLabel }: { office: ChamberOffice; v: ChamberView; rows: ChallengerRow[]; s: ChamberSearch; scopeLabel?: string }) {
  const opp = v.party === "D" ? "R" : "D";
  const cols = [`${PARTY[v.party]} incumbent`, `${PARTY[opp]} challenger(s)`, "Other (independent / third party)"];
  const seatLink = (r: ChallengerRow) => (
    <Link to={ROUTE[office]} search={linkSearch(s, { view: v.id, seat: r.race.id })} hash="seat-panel" replace resetScroll={false} className="font-serif text-lg font-bold text-gold underline-offset-4 hover:underline">
      {SEAT[office]}{r.district}
    </Link>
  );
  return (
    <section id="view-list" aria-labelledby="view-list-h" className={cn(CARD, "mt-6 scroll-mt-24")} data-view-list={v.id}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="view-list-h" className="font-serif text-2xl font-semibold uppercase">{v.label}</h2>
        <p className="font-mono text-sm text-gold" role="status">{rows.length} {rows.length === 1 ? "district" : "districts"}{scopeLabel ? ` in ${scopeLabel}` : ""}</p>
      </div>
      <p className="mt-2 text-sm text-on-dark-muted">
        {v.kind === "gaps"
          ? `Districts with a ${PARTY[v.party]} incumbent and no ${PARTY[opp]} or independent / other registered campaign committee yet.`
          : `Every district with a ${PARTY[v.party]} incumbent, with the ${PARTY[opp]} and other registered campaign committees in that district.`}
        {scopeLabel ? ` Showing ${scopeLabel} only.` : ""}
      </p>
      {rows.length ? (
        <>
          <table className="mt-4 hidden w-full table-fixed border-collapse text-left text-sm md:table">
            <thead>
              <tr className="border-b border-navy-line font-mono text-xs tracking-widest text-gold uppercase">
                <th scope="col" className="w-24 py-2 pr-3">District</th>
                {cols.map((c) => <th key={c} scope="col" className="py-2 pr-3">{c}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-line">
              {rows.map((r) => (
                <tr key={r.seat} className="align-top">
                  <td className="py-3 pr-3">{seatLink(r)}</td>
                  <td className="py-3 pr-3"><Incumbent row={r} office={office} /></td>
                  <td className="py-3 pr-3"><WithAnnounced cs={r.opposite} ann={annOf(r.race, (p) => p === opp)} /></td>
                  <td className="py-3 pr-3"><WithAnnounced cs={r.other} ann={annOf(r.race, (p) => !isMajorP(p))} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="mt-4 space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.seat} className="rounded-xl border border-navy-line bg-navy-800 p-4">
                <div className="flex items-baseline justify-between gap-3">{seatLink(r)}</div>
                <dl className="mt-2 grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
                  <dt className="text-xs font-semibold text-on-dark-muted uppercase">{cols[0]}</dt><dd className="min-w-0"><Incumbent row={r} office={office} /></dd>
                  <dt className="text-xs font-semibold text-on-dark-muted uppercase">{cols[1]}</dt><dd className="min-w-0"><WithAnnounced cs={r.opposite} ann={annOf(r.race, (p) => p === opp)} /></dd>
                  <dt className="text-xs font-semibold text-on-dark-muted uppercase">Other</dt><dd className="min-w-0"><WithAnnounced cs={r.other} ann={annOf(r.race, (p) => !isMajorP(p))} /></dd>
                </dl>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-navy-line p-4 text-sm text-on-dark-muted">No districts in this view{scopeLabel ? ` in ${scopeLabel}` : ""} right now.</p>
      )}
    </section>
  );
}

function CountyFilter({ options, selected, unknown, onPick }: {
  options: LocalityOption[]; selected: LocalityOption | null; unknown: string | null; onPick: (id: string | undefined) => void;
}) {
  const boxId = useId();
  const listId = `${boxId}-list`;
  const [q, setQ] = useState(selected?.displayName ?? unknown ?? "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => { setQ(selected?.displayName ?? unknown ?? ""); }, [selected?.id, selected?.displayName, unknown]);
  const hits = matchLocalityQuery(open && q === (selected?.displayName ?? "") ? "" : q, options);
  useEffect(() => { setActive(0); }, [q, open]);
  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const pick = (id: string | undefined) => {
    onPick(id);
    const opt = id ? options.find((o) => o.id === id) : undefined;
    setQ(opt?.displayName ?? "");
    setOpen(false);
  };
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((i) => Math.min(i + 1, Math.max(hits.length - 1, 0))); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); if (selected) setQ(selected.displayName); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (open && hits[active]) pick(hits[active].id);
      else if (hits.length === 1) pick(hits[0].id);
      else if (q.trim()) {
        const exact = resolveCountyParam(q, options);
        if (exact.kind === "known") pick(exact.option.id);
        else onPick(q.trim().toLowerCase());
        setOpen(false);
      }
    }
  };
  return (
    <div ref={root} className="relative min-w-0" data-county-filter="">
      <label htmlFor={boxId} className="font-serif text-[11px] tracking-[0.14em] text-night-muted uppercase">Filter by county or city</label>
      <div className="mt-1 flex min-w-0 items-center gap-2 rounded-xl border border-navy-line bg-navy-800 px-3 focus-within:border-gold">
        <input id={boxId} ref={input} type="text" role="combobox" value={q}
          aria-autocomplete="list" aria-expanded={open} aria-controls={listId} aria-activedescendant={open && hits[active] ? `${listId}-${hits[active].id}` : undefined}
          autoComplete="off" placeholder="Type or pick a county or city"
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          className="h-12 min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-night-muted focus:outline-none" />
        {q || selected || unknown ? (
          <button type="button" onClick={() => pick(undefined)} aria-label="Clear county filter" className="rounded-md p-1 text-gold hover:bg-navy-600">
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
        <button type="button" aria-label="Show county and city list" onClick={() => { setOpen((o) => !o); input.current?.focus(); }} className="rounded-md p-1 text-gold hover:bg-navy-600">
          <ChevronDown className={cn("size-4 transition", open && "rotate-180")} aria-hidden />
        </button>
      </div>
      {open ? (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto overflow-x-hidden rounded-xl border border-navy-line bg-navy-800 py-1 shadow-lg">
          {hits.length ? hits.map((o, i) => (
            <li key={o.id} id={`${listId}-${o.id}`} role="option" aria-selected={selected?.id === o.id}
              className={cn("cursor-pointer px-3 py-2 text-sm text-white", i === active && "bg-navy-600", selected?.id === o.id && "text-gold")}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(o.id); }}>
              {o.displayName}
            </li>
          )) : (
            <li className="px-3 py-2 text-sm text-on-dark-muted">No county or city matches “{q.trim()}”.</li>
          )}
        </ul>
      ) : null}
    </div>
  );
}

function CountyDistrictList({ office, matches, s, onSeat }: {
  office: ChamberOffice; matches: { race: Race; cov: Coverage }[]; s: ChamberSearch; onSeat: (id: string | undefined) => void;
}) {
  return (
    <ul className="mt-3 space-y-2" data-county-districts="">
      {matches.map(({ race, cov }) => {
        const row = toRow(race);
        const member = race.current_member ?? race.current_members?.[0];
        const challengers = row ? [...row.opposite, ...row.other] : race.candidates.filter((c) => !c.incumbent);
        return (
          <li key={race.id} className="min-w-0 rounded-xl border border-navy-line bg-navy-800 p-3 sm:p-4" data-county-district={race.id}>
            <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <button type="button" onClick={() => onSeat(s.seat === race.id ? undefined : race.id)}
                className="font-serif text-lg font-bold text-gold underline-offset-4 hover:underline">
                {SEAT[office]}{race.district}
              </button>
              <span className="text-xs text-on-dark-muted">{districtCoverageText(cov)}</span>
            </div>
            {row ? <div className="mt-2 text-sm"><Incumbent row={row} office={office} showParty /></div> : member ? (
              <p className="mt-2 text-sm font-semibold text-white">{member.name} <span className="font-normal text-on-dark-muted">({partyWord(member.party, member.party_label)})</span></p>
            ) : (
              <p className="mt-2 text-sm text-on-dark-muted">Current member not on the official member list.</p>
            )}
            <div className="mt-2 text-sm">
              <p className="text-xs font-semibold tracking-wide text-on-dark-muted uppercase">Challengers</p>
              <div className="mt-1"><WithAnnounced cs={challengers} ann={race.announced ?? []} empty="None registered yet" showParty same={member?.party ?? null} /></div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function ChamberPage({ office, s, onSeat, onCounty }: {
  office: ChamberOffice; s: ChamberSearch; onSeat: (id: string | undefined) => void; onCounty: (id: string | undefined) => void;
}) {
  const d = DATA[office];
  const options = chamberLocalityOptions(d.races);
  const resolved = resolveCountyParam(s.county, options);
  const countyOpt = resolved.kind === "known" ? resolved.option : null;
  const countyMatches = countyOpt ? racesForChamberLocality(d.races, countyOpt.id) : [];
  const countyIds = new Set(countyMatches.map((m) => m.race.id));
  const scopeRaces = countyOpt ? countyMatches.map((m) => m.race) : d.races;
  const v = s.view ? VIEW_BY_ID.get(s.view) : undefined;
  const rows = v ? rowsForView(scopeRaces, v) : [];
  const inView = new Set(rows.map((r) => r.race.id));
  const counts = new Map(CHAMBER_VIEWS.map((x) => [x.id, rowsForView(scopeRaces, x).length]));
  const fullCounts = new Map(CHAMBER_VIEWS.map((x) => [x.id, rowsForView(d.races, x).length]));
  const sel = d.races.find((r) => r.id === s.seat);
  const unclear = unclearSeats(d.races);
  const label = LABEL[office];
  const scopeLabel = countyOpt?.displayName.replace(/ County$/, "").replace(/^City of /, "");
  const summary = countyOpt ? localityCoverageSummary(countyMatches, office, countyOpt.displayName) : null;
  const dimFor = (r: Race) => (countyOpt ? !countyIds.has(r.id) : !!v && !inView.has(r.id));
  return (
    <main className="agx-dark flex-1 bg-navy-800 text-white">
      <Election2027Hero crumbs={[{ label: "2027 Election Dashboard", to: "/2027" }, { label }]} label={label} asOf={d.as_of} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className={CARD}>
          <h2 className="font-serif text-2xl font-semibold uppercase">{office === "house" ? "House of Delegates: 100 districts" : "State Senate: 40 districts"}</h2>
          <p className="mt-2 text-sm text-on-dark-muted">Each square is a district, colored by its registered 2027 campaign committees plus the incumbent, who is presumed to run. Tap a district to see its committees and current member.{v && !countyOpt ? " Squares not in the list below are dimmed." : ""}{countyOpt ? " Squares for other localities are dimmed; every district stays on the chart." : ""}</p>
          <div className="mt-4 max-w-xl">
            <CountyFilter options={options} selected={countyOpt} unknown={resolved.kind === "unknown" ? resolved.raw : null} onPick={onCounty} />
          </div>
          {resolved.kind === "unknown" ? (
            <p className="mt-3 rounded-md border border-dashed border-navy-line p-3 text-sm text-on-dark-muted" role="status" data-county-unknown="">{unknownCountyMessage(resolved.raw)}</p>
          ) : null}
          {summary ? (
            <div className="mt-3">
              <p className="text-sm font-medium text-[#F6F3EA]" role="status" data-county-summary="">{summary.line}</p>
              <CountyDistrictList office={office} matches={countyMatches} s={s} onSeat={onSeat} />
            </div>
          ) : null}
          <Legend office={office} presumed />
          <div className="mt-4 grid grid-cols-10 gap-1 md:grid-cols-20 lg:gap-1.5" data-seat-grid={office}>
            {d.races.map((r) => <Tile key={r.id} r={r} office={office} dim={dimFor(r)} selected={sel?.id === r.id} onPick={() => onSeat(sel?.id === r.id ? undefined : r.id)} presumed />)}
          </div>
          <div className="mt-4">
            {sel ? <Card r={sel} office={office} asOf={d.as_of} onClose={() => onSeat(undefined)} inline presumed /> : (
              <p className="rounded-[10px] border border-dashed border-navy-line p-4 text-sm text-on-dark-muted">Tap a district number to see its registered committees and current member here.</p>
            )}
          </div>
        </div>

        <div className={cn(CARD, "mt-6")}>
          <ViewButtons office={office} s={s} counts={counts} fullCounts={fullCounts} scopeLabel={scopeLabel} />
          <p className="mt-5 text-xs text-on-dark-muted">
            "Challengers" are registered 2027 campaign committees in the state's campaign finance records, not certified ballot candidates; official ballot lists are not posted yet. {PRESUMED_NOTE} {ASTERISK_NOTE} As of {fmtDate(d.as_of)}.{" "}
            <a href={REG_SOURCE} {...ext} className="inline-flex items-center gap-1 text-gold underline">Virginia Department of Elections campaign finance reports <ExternalLink className="size-3" aria-hidden /></a>
          </p>
          {unclear.length ? (
            <p className="mt-2 text-xs text-on-dark-muted">Left out of both parties' lists (incumbent unclear in the official member list): {unclear.map((u) => `${u.seat}: ${u.reason}`).join("; ")}.</p>
          ) : null}
        </div>

        {v ? <ViewList office={office} v={v} rows={rows} s={s} scopeLabel={scopeLabel} /> : null}

        <p className="mt-8 text-sm text-night-muted">
          Full race list with every filter: <Link to="/2027/races" search={{ office }} className="text-gold underline">all 2027 races</Link>.
        </p>
      </section>
    </main>
  );
}
