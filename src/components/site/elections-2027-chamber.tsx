import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import HOUSE from "@/lib/elections-2027-house.json";
import SENATE from "@/lib/elections-2027-senate.json";
import { candFinanceUrl, memberFinanceUrl, type Cand, type Race } from "@/lib/elections-2027";
import { FinanceLink } from "@/components/site/finance-link";
import { CHAMBER_VIEWS, NO_FILING_TAG, PRESUMED_NOTE, rowsForView, unclearSeats, VIEW_BY_ID, VIEW_GROUPS, type ChallengerRow, type ChamberView } from "@/lib/elections-2027-challengers";
import { Card, Legend, MEMBER_ROUTE, REG_SOURCE, Tile, ext } from "@/components/site/elections-2027-seats";
import { Election2027Hero } from "@/components/site/elections-2027-hero";

/**
 * /2027/delegates and /2027/senate: one template. Seat chart from /2027/races (same tiles, legend, district panel), then the
 * button groups from the view registry (src/lib/elections-2027-challengers.ts). URL: ?view=<view id>&seat=<race id>.
 */
export type ChamberOffice = "house" | "senate";
export type ChamberSearch = { view?: string; seat?: string };
type Data = { as_of: string; races: Race[]; registrations_rule?: string };

const DATA: Record<ChamberOffice, Data> = { house: HOUSE as unknown as Data, senate: SENATE as unknown as Data };
const ROUTE = { house: "/2027/delegates", senate: "/2027/senate" } as const;
const LABEL = { house: "Delegates", senate: "Senate" } as const;
const SEAT = { house: "HD", senate: "SD" } as const;
const PARTY = { D: "Democrat", R: "Republican" } as const;
const CARD = "min-w-0 rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-5 sm:p-7";

const fmtDate = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export function parseChamberSearch(s: Record<string, unknown>): ChamberSearch {
  return {
    ...(typeof s.view === "string" && VIEW_BY_ID.has(s.view) ? { view: s.view } : {}),
    ...(typeof s.seat === "string" && /^[a-z]{2}\d{1,3}$/.test(s.seat) ? { seat: s.seat } : {}),
  };
}

/** Reusable button group: one titled row of toggle buttons. More groups (e.g. Campaign Finance) come from VIEW_GROUPS. */
function ViewButtons({ office, s, counts }: { office: ChamberOffice; s: ChamberSearch; counts: Map<string, number> }) {
  return (
    <div className="space-y-6">
      {VIEW_GROUPS.map((g) => (
        <div key={g.id} role="group" aria-labelledby={`vg-${g.id}`}>
          <h2 id={`vg-${g.id}`} className="font-serif text-2xl font-semibold">{g.title}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CHAMBER_VIEWS.filter((v) => v.group === g.id).map((v) => {
              const on = s.view === v.id;
              return (
                <Link key={v.id} to={ROUTE[office]} search={{ ...(on ? {} : { view: v.id }), ...(s.seat ? { seat: s.seat } : {}) }} replace resetScroll={false}
                  aria-pressed={on} data-view={v.id}
                  className={cn("flex min-h-[72px] items-center gap-4 rounded-xl border border-navy-line border-l-4 px-5 py-3 transition-colors hover:border-gold",
                    on ? "border-gold border-l-gold bg-gold text-navy-900" : "border-l-gold bg-navy-800 hover:bg-navy-600")}>
                  <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg font-serif text-lg font-bold", on ? "bg-navy-900/15" : v.party === "R" ? "bg-flag/20 text-[#ff8a9a]" : "bg-[#2563c9]/25 text-[#8fb4f0]")}>{v.party}</span>
                  <span className="min-w-0 flex-1 text-base font-semibold uppercase sm:text-lg">{v.label}</span>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 font-mono text-sm font-bold", on ? "bg-navy-900/15" : "bg-navy-900/60 text-gold")}>{counts.get(v.id)}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function Names({ cs, empty = "—" }: { cs: Cand[]; empty?: string }) {
  if (!cs.length) return <span className="text-on-dark-muted" aria-label="none">{empty}</span>;
  return (
    <ul className="space-y-1">
      {cs.map((c) => (
        <li key={c.committee_code ?? c.name} className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            <a href={c.committee_url ?? c.filing_source_url} {...ext} className="font-semibold text-white underline decoration-navy-line underline-offset-4 hover:decoration-gold">{c.name}</a>
            {c.party !== "D" && c.party !== "R" ? <span className="text-xs text-on-dark-muted"> ({c.party === "Other" && c.party_label ? c.party_label : c.party ? "other party" : "party not listed"})</span> : null}
          </span>
          <FinanceLink url={candFinanceUrl(c)} name={c.name} />
        </li>
      ))}
    </ul>
  );
}

export function NoFilingTag() {
  return <span className="inline-flex rounded-full border border-navy-line px-2 py-0.5 text-[11px] font-medium text-on-dark-muted" title={PRESUMED_NOTE}>{NO_FILING_TAG}</span>;
}

function Incumbent({ row, office }: { row: ChallengerRow; office: ChamberOffice }) {
  const m = row.incumbent;
  return (
    <div>
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-semibold text-white">
        {m.slug ? <Link to={`${MEMBER_ROUTE[office]}/${m.slug}` as never} className="underline decoration-navy-line underline-offset-4 hover:decoration-gold">{m.name}</Link> : m.name}
        <FinanceLink url={memberFinanceUrl(row.race, m, row.race.candidates.find((c) => c.incumbent))} name={m.name} />
      </p>
      {row.status === "not-filed" ? <p className="mt-1"><NoFilingTag /></p> : null}
      {row.status === "check" && row.race.check ? (
        <p className="mt-1 text-xs text-[#fcd34d]"><span className="font-bold">! Check:</span> {row.race.check.note} <a href={row.race.check.committee_url} {...ext} className="text-gold underline">Committee record</a></p>
      ) : null}
      {row.same.length ? (
        <div className="mt-1 text-xs text-on-dark-muted">Also registered, same party:{" "}
          {row.same.map((c) => <span key={c.committee_code ?? c.name} className="mr-2 inline-flex flex-wrap items-center gap-x-1.5">{c.name} <FinanceLink url={candFinanceUrl(c)} name={c.name} /></span>)}
        </div>
      ) : null}
    </div>
  );
}

function ViewList({ office, v, rows }: { office: ChamberOffice; v: ChamberView; rows: ChallengerRow[] }) {
  const opp = v.party === "D" ? "R" : "D";
  const cols = [`${PARTY[v.party]} incumbent`, `${PARTY[opp]} challenger(s)`, "Other (independent / third party)"];
  const seatLink = (r: ChallengerRow) => (
    <Link to={ROUTE[office]} search={{ view: v.id, seat: r.race.id }} hash="seat-panel" replace resetScroll={false} className="font-serif text-lg font-bold text-gold underline-offset-4 hover:underline">
      {SEAT[office]}{r.district}
    </Link>
  );
  return (
    <section id="view-list" aria-labelledby="view-list-h" className={cn(CARD, "mt-6 scroll-mt-24")} data-view-list={v.id}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="view-list-h" className="font-serif text-2xl font-semibold uppercase">{v.label}</h2>
        <p className="font-mono text-sm text-gold" role="status">{rows.length} {rows.length === 1 ? "district" : "districts"}</p>
      </div>
      <p className="mt-2 text-sm text-on-dark-muted">
        {v.kind === "gaps"
          ? `Districts with a ${PARTY[v.party]} incumbent and no ${PARTY[opp]} or independent / other registered campaign committee yet.`
          : `Every district with a ${PARTY[v.party]} incumbent, with the ${PARTY[opp]} and other registered campaign committees in that district.`}
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
                  <td className="py-3 pr-3"><Names cs={r.opposite} /></td>
                  <td className="py-3 pr-3"><Names cs={r.other} /></td>
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
                  <dt className="text-xs font-semibold text-on-dark-muted uppercase">{cols[1]}</dt><dd className="min-w-0"><Names cs={r.opposite} /></dd>
                  <dt className="text-xs font-semibold text-on-dark-muted uppercase">Other</dt><dd className="min-w-0"><Names cs={r.other} /></dd>
                </dl>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 rounded-md border border-dashed border-navy-line p-4 text-sm text-on-dark-muted">No districts in this view right now.</p>
      )}
    </section>
  );
}

export function ChamberPage({ office, s, onSeat }: { office: ChamberOffice; s: ChamberSearch; onSeat: (id: string | undefined) => void }) {
  const d = DATA[office];
  const v = s.view ? VIEW_BY_ID.get(s.view) : undefined;
  const rows = v ? rowsForView(d.races, v) : [];
  const inView = new Set(rows.map((r) => r.race.id));
  const counts = new Map(CHAMBER_VIEWS.map((x) => [x.id, rowsForView(d.races, x).length]));
  const sel = d.races.find((r) => r.id === s.seat);
  const unclear = unclearSeats(d.races);
  const label = LABEL[office];
  return (
    <main className="agx-dark flex-1 bg-navy-800 text-white">
      <Election2027Hero crumbs={[{ label: "2027 Election Dashboard", to: "/2027" }, { label }]} label={label} asOf={d.as_of} />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8">
        <div className={CARD}>
          <h2 className="font-serif text-2xl font-semibold uppercase">{office === "house" ? "House of Delegates: 100 districts" : "State Senate: 40 districts"}</h2>
          <p className="mt-2 text-sm text-on-dark-muted">Each square is a district, colored by its registered 2027 campaign committees plus the incumbent, who is presumed to run. Tap a district to see its committees and current member.{v ? " Squares not in the list below are dimmed." : ""}</p>
          <Legend office={office} presumed />
          <div className="mt-4 grid grid-cols-10 gap-1 md:grid-cols-20 lg:gap-1.5" data-seat-grid={office}>
            {d.races.map((r) => <Tile key={r.id} r={r} office={office} dim={!!v && !inView.has(r.id)} selected={sel?.id === r.id} onPick={() => onSeat(sel?.id === r.id ? undefined : r.id)} presumed />)}
          </div>
          <div className="mt-4">
            {sel ? <Card r={sel} office={office} asOf={d.as_of} onClose={() => onSeat(undefined)} inline presumed /> : (
              <p className="rounded-[10px] border border-dashed border-navy-line p-4 text-sm text-on-dark-muted">Tap a district number to see its registered committees and current member here.</p>
            )}
          </div>
        </div>

        <div className={cn(CARD, "mt-6")}>
          <ViewButtons office={office} s={s} counts={counts} />
          <p className="mt-5 text-xs text-on-dark-muted">
            "Challengers" are registered 2027 campaign committees in the state's campaign finance records, not certified ballot candidates; official ballot lists are not posted yet. {PRESUMED_NOTE} As of {fmtDate(d.as_of)}.{" "}
            <a href={REG_SOURCE} {...ext} className="inline-flex items-center gap-1 text-gold underline">Virginia Department of Elections campaign finance reports <ExternalLink className="size-3" aria-hidden /></a>
          </p>
          {unclear.length ? (
            <p className="mt-2 text-xs text-on-dark-muted">Left out of both parties' lists (incumbent unclear in the official member list): {unclear.map((u) => `${u.seat}: ${u.reason}`).join("; ")}.</p>
          ) : null}
        </div>

        {v ? <ViewList office={office} v={v} rows={rows} /> : null}

        <p className="mt-8 text-sm text-night-muted">
          Full race list with every filter: <Link to="/2027/races" search={{ office }} className="text-gold underline">all 2027 races</Link>.
        </p>
      </section>
    </main>
  );
}
