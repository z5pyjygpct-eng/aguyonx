import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { P_COLOR, P_NAME, PartyKey, Section, Segmented, TipLine, useTip, type ChamberSel } from "@/components/site/party-compare-charts";
import {
  MIN_CHAMBER, MIN_SPLIT, chamberLabel, money, rate, rateLabel, seatLabel, shareLabel,
  type Chamber, type CommitteeBill, type CommitteeFile, type DemoFile, type RankMember, type RanksFile,
} from "@/lib/ga-visual-sections";

const fmt = (n: number) => n.toLocaleString("en-US");
function useGrow() {
  const [on, set] = useState(false);
  useEffect(() => { const t = requestAnimationFrame(() => set(true)); return () => cancelAnimationFrame(t); }, []);
  return on;
}
function chambersOf(sel: ChamberSel): Chamber[] { return sel === "both" ? ["house", "senate"] : [sel]; }

type SortKey = string;
function useSort<T>(rows: T[], initial: SortKey, initialDir: "asc" | "desc" = "desc") {
  const [key, setKey] = useState(initial);
  const [dir, setDir] = useState<"asc" | "desc">(initialDir);
  const toggle = (k: SortKey) => { if (k === key) setDir((d) => (d === "asc" ? "desc" : "asc")); else { setKey(k); setDir("desc"); } };
  return { key, dir, toggle };
}

/* ============================================================
 * 1. Most representative vs. most extreme
 * ============================================================ */
type RankMetric = "chamber" | "split";
const RANK_OPTS = [
  { value: "chamber" as const, label: "With the chamber" },
  { value: "split" as const, label: "With their party when the parties split" },
];

function score(m: RankMember, metric: RankMetric) {
  return metric === "chamber" ? rate(m.withChamber, m.chamberN) : rate(m.withPartySplit, m.splitN);
}
function enough(m: RankMember, metric: RankMetric) {
  return metric === "chamber" ? m.chamberN >= MIN_CHAMBER : m.splitN >= MIN_SPLIT;
}

export function MemberRanks({ ranks, sel }: { ranks: RanksFile; sel: ChamberSel }) {
  const [metric, setMetric] = useState<RankMetric>("chamber");
  const [q, setQ] = useState("");
  const sort = useSort<RankMember>([], metric === "chamber" ? "chamber" : "split");
  const { bind, layer, container } = useTip();
  const on = useGrow();
  const chs = chambersOf(sel);

  return (
    <Section id="representative" kicker="Members, one by one" title="Most with the chamber, and most with their party"
      lead={<>On each final-passage vote, the chamber has a majority — more Yea than Nay, or the other way around. A member who often votes that same way usually lands with the majority of the House or Senate. Sometimes most Republicans vote one way and most Democrats vote the other way. On those split votes, a member who almost always stays with their own party is on the “party” end of the list. Both ends are shown. No one is singled out as a featured member. District partisan lean is not shown: official statewide-race results are published by locality and precinct, not as official totals by current House or Senate district, and this page does not re-add precincts.</>}
      note={<>{ranks.rule} A member is ranked on “with the chamber” only if they have at least {MIN_CHAMBER} Yea or Nay votes on those roll calls, and on “with their party when the parties split” only if they have at least {MIN_SPLIT} Yea or Nay votes on party-split roll calls; everyone still appears in the full table, with their vote counts. Abstentions and not-voting are left out of the rates (they are not Yea or Nay). Party for each member comes from the official chamber roster. {ranks.lean.reason} House: {fmt(ranks.chambers.house.rollCallsCounted)} final-passage roll calls, {fmt(ranks.chambers.house.partySplitRollCalls)} of them party-split. Senate: {fmt(ranks.chambers.senate.rollCallsCounted)} and {fmt(ranks.chambers.senate.partySplitRollCalls)}.</>}>
      <div {...container} className="relative">
        <div className="mb-5"><Segmented label="Rank members by" value={metric} onChange={setMetric} options={RANK_OPTS} /></div>
        {chs.map((ch) => (
          <ChamberEnds key={ch} ch={ch} ranks={ranks} metric={metric} bind={bind} on={on} />
        ))}
        <RankTable ranks={ranks} sel={sel} q={q} setQ={setQ} sort={sort} />
        {layer}
      </div>
    </Section>
  );
}

function ChamberEnds({ ch, ranks, metric, bind, on }: { ch: Chamber; ranks: RanksFile; metric: RankMetric; bind: (n: ReactNode) => object; on: boolean }) {
  const pool = ranks.chambers[ch].members.filter((m) => enough(m, metric));
  const sorted = [...pool].sort((a, b) => (score(b, metric) ?? -1) - (score(a, metric) ?? -1) || a.name.localeCompare(b.name));
  const high = sorted.slice(0, 8);
  const low = [...sorted].slice(-8).reverse();
  const maxBar = 100;
  const tip = (m: RankMember) => (
    <>
      <TipLine p={m.party}><b>{m.name}</b> · {seatLabel(ch, m.district)}</TipLine>
      <div className="mt-0.5">With the chamber: {rateLabel(m.withChamber, m.chamberN)} ({fmt(m.withChamber)} of {fmt(m.chamberN)})</div>
      <div>With their party on splits: {rateLabel(m.withPartySplit, m.splitN)} ({fmt(m.withPartySplit)} of {fmt(m.splitN)})</div>
      <div className="text-on-dark-muted">Yea {fmt(m.Y)} · Nay {fmt(m.N)} · Not voting {fmt(m.X)}{m.partialTerm ? " · served only part of the period" : ""}</div>
    </>
  );
  const col = (title: string, rows: RankMember[], empty: string) => (
    <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-6">
      <h3 className="font-serif text-lg font-bold uppercase sm:text-xl">{title}</h3>
      <p className="mt-1 text-xs text-night-muted">{chamberLabel(ch)} · {metric === "chamber" ? "share of Yea/Nay votes that matched the chamber majority" : "share of Yea/Nay votes that matched their party’s majority, only when the two parties’ majorities disagreed"}</p>
      <ul className="mt-4 space-y-2">
        {rows.map((m, i) => {
          const v = score(m, metric) ?? 0;
          return (
            <li key={m.lisId}>
              <a href={m.href} className="mb-0.5 flex items-baseline justify-between gap-2 text-sm hover:text-gold">
                <span className="min-w-0 truncate font-semibold"><span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: P_COLOR[m.party] }} aria-hidden />{m.name}</span>
                <span className="shrink-0 text-xs tabular-nums text-night-muted">{seatLabel(ch, m.district)}</span>
              </a>
              <div className="flex items-center gap-2">
                <div className="h-4 min-w-0 flex-1 rounded-sm bg-navy-900">
                  <div {...bind(tip(m))} className="h-full rounded-sm outline-offset-[-2px] transition-[width,filter] duration-700 ease-out hover:brightness-125 focus-visible:brightness-125 motion-reduce:transition-none"
                    style={{ width: on ? `${Math.max((v / maxBar) * 100, 1)}%` : "0%", background: P_COLOR[m.party], transitionDelay: `${i * 30}ms` }} />
                </div>
                <span className="w-14 shrink-0 text-right text-xs font-bold tabular-nums" style={{ color: P_COLOR[m.party] }}>{rateLabel(metric === "chamber" ? m.withChamber : m.withPartySplit, metric === "chamber" ? m.chamberN : m.splitN)}</span>
              </div>
            </li>
          );
        })}
        {rows.length === 0 ? <li className="text-sm text-night-muted">{empty}</li> : null}
      </ul>
    </div>
  );
  const highTitle = metric === "chamber" ? "Highest: voted with the chamber" : "Highest: stayed with their party on splits";
  const lowTitle = metric === "chamber" ? "Lowest: voted with the chamber" : "Lowest: stayed with their party on splits";
  return (
    <div className="mb-8">
      {selHeader(ch, ranks)}
      <div className="grid gap-4 lg:grid-cols-2">
        {col(highTitle, high, "No members meet the minimum vote count.")}
        {col(lowTitle, low, "No members meet the minimum vote count.")}
      </div>
    </div>
  );
}

function selHeader(ch: Chamber, ranks: RanksFile) {
  const c = ranks.chambers[ch];
  return <h3 className="mb-3 font-serif text-xl font-bold uppercase">{chamberLabel(ch)} · {fmt(c.rollCallsCounted)} final-passage votes · {fmt(c.partySplitRollCalls)} party-split</h3>;
}

function RankTable({ ranks, sel, q, setQ, sort }: { ranks: RanksFile; sel: ChamberSel; q: string; setQ: (s: string) => void; sort: { key: string; dir: "asc" | "desc"; toggle: (k: string) => void } }) {
  const rows = useMemo(() => {
    const list: (RankMember & { chamber: Chamber })[] = [];
    for (const ch of chambersOf(sel)) for (const m of ranks.chambers[ch].members) list.push({ ...m, chamber: ch });
    const needle = q.trim().toLowerCase();
    const filtered = needle ? list.filter((m) => `${m.name} ${seatLabel(m.chamber, m.district)} ${m.party}`.toLowerCase().includes(needle)) : list;
    const val = (m: RankMember & { chamber: Chamber }) => {
      switch (sort.key) {
        case "name": return m.name;
        case "district": return m.district;
        case "party": return m.party;
        case "chamber": return rate(m.withChamber, m.chamberN) ?? -1;
        case "split": return rate(m.withPartySplit, m.splitN) ?? -1;
        case "yea": return m.chamberN ? (100 * m.Y) / (m.Y + m.N || 1) : -1;
        case "n": return m.chamberN;
        default: return rate(m.withChamber, m.chamberN) ?? -1;
      }
    };
    return [...filtered].sort((a, b) => {
      const av = val(a), bv = val(b);
      const cmp = typeof av === "string" && typeof bv === "string" ? av.localeCompare(bv) : (av as number) - (bv as number);
      return (sort.dir === "asc" ? 1 : -1) * (cmp || a.name.localeCompare(b.name));
    });
  }, [ranks, sel, q, sort.key, sort.dir]);
  const Th = ({ k, children, className }: { k: string; children: ReactNode; className?: string }) => (
    <th className={className}>
      <button type="button" onClick={() => sort.toggle(k)} className="inline-flex min-h-9 items-center gap-1 font-semibold hover:text-gold">
        {children}{sort.key === k ? <span aria-hidden>{sort.dir === "asc" ? "↑" : "↓"}</span> : null}
      </button>
    </th>
  );
  return (
    <div className="rounded-xl border border-navy-line bg-navy-700 p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-serif text-xl font-bold uppercase">Full list (sortable)</h3>
        <label className="block text-xs font-bold tracking-wide text-night-muted uppercase">Search members
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, district, party"
            className="mt-1 block min-h-10 w-64 max-w-full rounded-md border border-navy-line bg-navy-900 px-3 text-sm font-medium text-white placeholder:text-night-muted" />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="text-xs tracking-wide text-night-muted uppercase">
            <tr className="border-b border-navy-line">
              <Th k="name">Member</Th>
              <Th k="district">Seat</Th>
              <Th k="party">Party</Th>
              <Th k="chamber">With chamber</Th>
              <Th k="split">With party on splits</Th>
              <Th k="n">Yea/Nay votes</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={`${m.chamber}-${m.lisId}`} className="border-b border-navy-line/50">
                <td className="py-2 pr-3 font-semibold"><a href={m.href} className="hover:text-gold">{m.name}</a>{m.partialTerm ? <span className="ml-2 text-[10px] font-bold tracking-wide text-gold uppercase">Partial term</span> : null}</td>
                <td className="py-2 pr-3 tabular-nums text-night-muted">{seatLabel(m.chamber, m.district)}</td>
                <td className="py-2 pr-3 font-bold" style={{ color: P_COLOR[m.party] }}>{m.party === "R" ? "Rep." : "Dem."}</td>
                <td className="py-2 pr-3 tabular-nums">{rateLabel(m.withChamber, m.chamberN)} <span className="text-[11px] text-night-muted">({fmt(m.withChamber)}/{fmt(m.chamberN)})</span></td>
                <td className="py-2 pr-3 tabular-nums">{rateLabel(m.withPartySplit, m.splitN)} <span className="text-[11px] text-night-muted">({fmt(m.withPartySplit)}/{fmt(m.splitN)})</span></td>
                <td className="py-2 tabular-nums text-night-muted">{fmt(m.Y)} Y · {fmt(m.N)} N</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-night-muted">{fmt(rows.length)} member{rows.length === 1 ? "" : "s"} shown. “Partial term” means the member appears on fewer than 85% of this chamber’s final-passage roll calls.</p>
    </div>
  );
}

/* ============================================================
 * 2. Bipartisan bills that died in committee
 * ============================================================ */
export function CommitteeDeaths({ data, sel }: { data: CommitteeFile; sel: ChamberSel }) {
  const [honor, setHonor] = useState<"legis" | "all">("legis");
  const [q, setQ] = useState("");
  const sort = useSort<CommitteeBill>([], "bill", "asc");
  const { bind, layer, container } = useTip();
  const on = useGrow();
  const pass = (b: CommitteeBill) => (honor === "all" || !b.honor) && (sel === "both" || b.committeeChamber === sel);
  const bills = data.bills.filter(pass);
  const countOf = (c: { total: number; legis: number; honor: number }) => (honor === "all" ? c.total : c.legis);
  const sessions = data.bySession.map((s) => ({ ...s, n: honor === "all" ? s.total : s.legis }));
  const committees = data.byCommittee
    .filter((c) => sel === "both" || c.chamber === sel)
    .map((c) => ({ ...c, n: countOf(c) }))
    .filter((c) => c.n > 0)
    .sort((a, b) => b.n - a.n || a.committee.localeCompare(b.committee));
  const maxC = Math.max(...committees.map((c) => c.n), 1);
  const maxS = Math.max(...sessions.map((s) => s.n), 1);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = needle ? bills.filter((b) => `${b.bill} ${b.title} ${b.chiefName} ${b.committee} ${b.kindLabel}`.toLowerCase().includes(needle)) : bills;
    const val = (b: CommitteeBill): string | number => {
      switch (sort.key) {
        case "title": return b.title;
        case "chief": return b.chiefName;
        case "patrons": return b.rPatrons + b.dPatrons;
        case "committee": return b.committee;
        case "kind": return b.kindLabel;
        case "date": return b.date;
        default: return `${b.session}|${b.bill}`;
      }
    };
    return [...list].sort((a, b) => {
      const av = val(a), bv = val(b);
      const cmp = typeof av === "string" && typeof bv === "string" ? av.localeCompare(bv, undefined, { numeric: true }) : (av as number) - (bv as number);
      return (sort.dir === "asc" ? 1 : -1) * (cmp || a.bill.localeCompare(b.bill, undefined, { numeric: true }));
    });
  }, [bills, q, sort.key, sort.dir]);

  const Th = ({ k, children }: { k: string; children: ReactNode }) => (
    <th><button type="button" onClick={() => sort.toggle(k)} className="inline-flex min-h-9 items-center gap-1 font-semibold hover:text-gold">{children}{sort.key === k ? <span aria-hidden>{sort.dir === "asc" ? "↑" : "↓"}</span> : null}</button></th>
  );

  return (
    <Section id="committee" kicker="Bipartisan bills" title="Bills that died in committee, despite Republican and Democratic patrons"
      lead={<>These measures had at least one Republican and one Democrat as a patron or co-patron, and then stopped in a committee instead of reaching a floor vote that finished them. “Died in committee” is a specific LIS history test, not a guess about a bill’s chances. Hover a bar for the exact count.</>}
      note={<>{data.definition} Party is joined from official chamber rosters; unmatched patrons are not guessed and are not used to decide whether a bill is bipartisan. Official bill pages are linked on each row. {honor === "legis" ? "Honor resolutions (celebrating a life or commending someone) are currently excluded." : "Honor resolutions are currently included."} Source: LIS BILLS.CSV, HISTORY.CSV and Sponsors.csv for the 2026 Regular and Special I sessions.</>}>
      <div className="mb-5 flex flex-wrap items-end gap-6">
        <Segmented label="Measures counted" value={honor} onChange={setHonor} options={[{ value: "legis", label: "Legislation only" }, { value: "all", label: "All incl. honor resolutions" }]} />
        <p className="pb-2 text-sm text-night-muted">{fmt(bills.length)} measure{bills.length === 1 ? "" : "s"} match this test{sel !== "both" ? ` in ${chamberLabel(sel)} committees` : ""}.</p>
      </div>
      <div className="mb-6 rounded-xl border border-gold/40 bg-navy-700 p-4 text-sm leading-relaxed text-[#F6F3EA] sm:p-5">
        <p className="font-serif text-sm font-bold tracking-[0.14em] text-gold uppercase">What “died in committee” means here</p>
        <p className="mt-2">{data.definition}</p>
      </div>
      <div {...container} className="relative grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-6">
          <h3 className="mb-3 font-serif text-xl font-bold uppercase">By session</h3>
          <ul className="space-y-3">
            {sessions.map((s, i) => (
              <li key={s.session}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-semibold">{s.label}</span><span className="tabular-nums">{fmt(s.n)}</span></div>
                <div className="h-6 rounded-sm bg-navy-900">
                  <div {...bind(<><div><b>{s.label}</b></div><div>{fmt(s.n)} bipartisan measure{s.n === 1 ? "" : "s"} died in committee{honor === "all" && s.honor ? ` (including ${s.honor} honor ${s.honor === 1 ? "resolution" : "resolutions"})` : ""}.</div></>)}
                    className="h-full rounded-sm bg-gold transition-[width,filter] duration-700 hover:brightness-110 motion-reduce:transition-none"
                    style={{ width: on ? `${s.n ? Math.max((s.n / maxS) * 100, 2) : 0}%` : "0%", transitionDelay: `${i * 40}ms` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-6">
          <h3 className="mb-3 font-serif text-xl font-bold uppercase">By committee</h3>
          <ul className="space-y-1.5">
            {committees.map((c, i) => (
              <li key={`${c.chamber}-${c.committee}`} className="flex items-center gap-2">
                <div className="w-36 shrink-0 truncate text-right text-[11px] leading-tight text-night-muted sm:w-48 sm:text-xs">{c.chamber === "house" ? "House" : c.chamber === "senate" ? "Senate" : ""} {c.committee}</div>
                <div className="h-5 min-w-0 flex-1 rounded-sm bg-navy-900">
                  <div {...bind(<><div><b>{c.chamber === "house" ? "House" : "Senate"} {c.committee}</b></div><div>{fmt(c.n)} measure{c.n === 1 ? "" : "s"}</div></>)}
                    className="h-full rounded-sm transition-[width,filter] duration-700 hover:brightness-125 motion-reduce:transition-none"
                    style={{ width: on ? `${Math.max((c.n / maxC) * 100, 2)}%` : "0%", background: c.chamber === "house" ? "#7EE0A0" : "#7FA7FF", transitionDelay: `${i * 25}ms` }} />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-bold tabular-nums">{c.n}</span>
              </li>
            ))}
          </ul>
        </div>
        {layer}
      </div>
      <div className="mt-8 rounded-xl border border-navy-line bg-navy-700 p-4 sm:p-6">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-serif text-xl font-bold uppercase">Searchable list</h3>
          <label className="block text-xs font-bold tracking-wide text-night-muted uppercase">Search bills
            <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Number, title, patron, committee"
              className="mt-1 block min-h-10 w-72 max-w-full rounded-md border border-navy-line bg-navy-900 px-3 text-sm font-medium text-white placeholder:text-night-muted" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="text-xs tracking-wide text-night-muted uppercase">
              <tr className="border-b border-navy-line">
                <Th k="bill">Bill</Th>
                <Th k="title">Title</Th>
                <Th k="chief">Chief patron</Th>
                <Th k="patrons">R / D patrons</Th>
                <Th k="committee">Committee</Th>
                <Th k="kind">What happened</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={`${b.session}|${b.bill}`} className="border-b border-navy-line/50 align-top">
                  <td className="py-2 pr-3 font-semibold whitespace-nowrap"><a href={b.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-gold hover:underline">{b.bill} <ExternalLink className="size-3 shrink-0" aria-hidden /><span className="sr-only"> (opens official LIS page)</span></a></td>
                  <td className="py-2 pr-3">{b.title}{b.honor ? <span className="ml-2 text-[10px] font-bold tracking-wide text-gold uppercase">Honor</span> : null}</td>
                  <td className="py-2 pr-3">{b.chiefName}{b.chiefParty ? <span className="ml-1 font-bold" style={{ color: P_COLOR[b.chiefParty] }}>({b.chiefParty})</span> : null}</td>
                  <td className="py-2 pr-3 tabular-nums"><span style={{ color: P_COLOR.R }}>{b.rPatrons} R</span> · <span style={{ color: P_COLOR.D }}>{b.dPatrons} D</span></td>
                  <td className="py-2 pr-3">{b.committeeChamber ? (b.committeeChamber === "house" ? "House" : "Senate") : ""} {b.committee}</td>
                  <td className="py-2 text-night-muted">{b.kindLabel}{b.date ? <span className="block text-[11px]">{b.date}</span> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-night-muted">{fmt(filtered.length)} row{filtered.length === 1 ? "" : "s"}. Each bill number opens its official LIS page.</p>
      </div>
    </Section>
  );
}

/* ============================================================
 * 3. Votes vs. district demographics
 * ============================================================ */
type DemoX = "income" | "bachelors";
type DemoY = "chamber" | "split" | "yea";
const X_OPTS = [{ value: "income" as const, label: "Median household income" }, { value: "bachelors" as const, label: "Bachelor's degree or higher" }];
const Y_OPTS = [
  { value: "chamber" as const, label: "Voted with the chamber" },
  { value: "split" as const, label: "Voted with their party on splits" },
  { value: "yea" as const, label: "Yea share (final passage)" },
];

export function Demographics({ ranks, demo, sel }: { ranks: RanksFile; demo: DemoFile; sel: ChamberSel }) {
  const [xKey, setX] = useState<DemoX>("income");
  const [yKey, setY] = useState<DemoY>("split");
  const { bind, layer, container } = useTip();
  const chs = chambersOf(sel);

  type Row = RankMember & { chamber: Chamber; x: number; y: number; income: number | null; incomeTop: boolean; bach: number | null };
  const rows: Row[] = [];
  for (const ch of chs) {
    const block = demo[ch];
    for (const m of ranks.chambers[ch].members) {
      if (!enough(m, yKey === "split" ? "split" : "chamber") && yKey !== "yea") continue;
      if (yKey === "yea" && m.Y + m.N < MIN_CHAMBER) continue;
      const d = block[String(m.district)];
      if (!d) continue;
      const x = xKey === "income" ? (d.medianIncomeTopcoded ? 250000 : d.medianIncome) : d.bachelorsShare;
      const y = yKey === "chamber" ? rate(m.withChamber, m.chamberN) : yKey === "split" ? rate(m.withPartySplit, m.splitN) : rate(m.Y, m.Y + m.N);
      if (x == null || y == null) continue;
      rows.push({ ...m, chamber: ch, x, y, income: d.medianIncome, incomeTop: d.medianIncomeTopcoded, bach: d.bachelorsShare });
    }
  }
  const xs = rows.map((r) => r.x), ys = rows.map((r) => r.y);
  const xMin = xs.length ? Math.min(...xs) : 0, xMax = xs.length ? Math.max(...xs) : 1;
  const yMin = 0, yMax = 100;
  const padX = (xMax - xMin) * 0.06 || 1;
  const x0 = xMin - padX, x1 = xMax + padX;
  const toX = (v: number) => ((v - x0) / (x1 - x0)) * 100;
  const toY = (v: number) => 100 - ((v - yMin) / (yMax - yMin)) * 100;
  const xTick = (v: number) => (xKey === "income" ? money(Math.round(v), v >= 250000) : `${(100 * v).toFixed(0)}%`);

  return (
    <Section id="demographics" kicker="Votes and districts" title="How members vote, next to official district figures"
      lead={<>Each dot is one member. Side to side is an official Census figure for that member’s current district — median household income, or the share of adults 25 and older with a bachelor’s degree or higher. Up and down is that member’s final-passage voting record. Hover or tap a dot for the numbers. Urban and rural shares are not shown: the Census ACS tables for these districts do not publish that split, and the 2020 Census urban/rural tables use earlier district lines.</>}
      note={<>{demo.survey}. Geography: {demo.geography}. {demo.geographyNote} {demo.urban.reason} Income is Census table B19013 (2024 inflation-adjusted dollars); one House district is top-coded at $250,000 or more and is plotted at that cap. Education is table B15003; “bachelor’s or higher” is the sum of bachelor’s, master’s, professional, and doctorate estimates, divided by the 25-and-older population. Figures are estimates and have margins of error in the source tables. Members need the same minimum Yea/Nay counts as the rankings section. Districts are joined by official district number (HD 1–100, SD 1–40) to Census GEO_IDs for Virginia’s 2024 legislative-session map. {demo.missing.length ? `Unmatched districts: ${demo.missing.join(", ")}.` : "Every current district matched a Census GEO_ID."} Official files: {demo.sources[0]} and {demo.sources[1]}.</>}>
      <div className="mb-5 flex flex-wrap items-end gap-6">
        <Segmented label="Across (Census)" value={xKey} onChange={setX} options={X_OPTS} />
        <Segmented label="Up (voting record)" value={yKey} onChange={setY} options={Y_OPTS} />
        <PartyKey />
      </div>
      <div {...container} className="relative rounded-xl border border-navy-line border-t-4 border-t-gold bg-navy-700 p-4 sm:p-6">
        <div className="mb-2 flex justify-between text-xs text-night-muted">
          <span>{yKey === "chamber" ? "With the chamber →" : yKey === "split" ? "With their party on splits →" : "Yea share →"} 100%</span>
          <span>{fmt(rows.length)} members</span>
        </div>
        <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
          <div className="absolute inset-0 rounded-md bg-navy-900" />
          {/* y ticks */}
          {[0, 25, 50, 75, 100].map((t) => (
            <div key={t} className="absolute right-0 left-8 border-t border-navy-line/40" style={{ top: `${toY(t)}%` }}>
              <span className="absolute -left-8 -translate-y-1/2 w-8 text-right text-[10px] tabular-nums text-night-muted">{t}%</span>
            </div>
          ))}
          {rows.map((r) => (
            <a key={`${r.chamber}-${r.lisId}`} href={r.href} {...bind(
              <>
                <TipLine p={r.party}><b>{r.name}</b> · {seatLabel(r.chamber, r.district)}</TipLine>
                <div className="mt-0.5">{xKey === "income" ? <>Median household income: {money(r.income, r.incomeTop)}</> : <>Bachelor’s or higher: {shareLabel(r.bach)}</>}</div>
                <div>With the chamber: {rateLabel(r.withChamber, r.chamberN)}</div>
                <div>With party on splits: {rateLabel(r.withPartySplit, r.splitN)}</div>
                <div>Yea share: {rateLabel(r.Y, r.Y + r.N)}</div>
              </>,
            )} className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full outline-offset-2 hover:z-10 hover:size-4 focus-visible:z-10 sm:size-3.5"
              style={{ left: `${toX(r.x)}%`, top: `${toY(r.y)}%`, background: P_COLOR[r.party] }}
              aria-label={`${r.name}, ${seatLabel(r.chamber, r.district)}`} />
          ))}
        </div>
        <div className="mt-2 flex justify-between gap-2 text-[11px] text-night-muted">
          <span>{xTick(xMin)}</span>
          <span className="text-center font-semibold text-[#F6F3EA]">{xKey === "income" ? "Median household income (ACS 2020–2024)" : "Share of adults 25+ with a bachelor’s degree or higher"}</span>
          <span>{xTick(xMax)}</span>
        </div>
        {layer}
      </div>
    </Section>
  );
}
