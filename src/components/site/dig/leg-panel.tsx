import { useMemo } from "react";
import { OUT_COLOR, OUT_LABEL, VOTE_COLOR } from "@/components/site/party-compare-charts";
import { BarList, Card, Columns, Ext, MoreList, NotCollected, PARTY_COLOR, PARTY_NAME, Stat, StackBars, dateLabel, money } from "./ui";
import type { Filters, Leg, RollCallFile } from "./types";

const CF = "https://cfreports.elections.virginia.gov";
const CHAMBER = { house: "House of Delegates", senate: "Senate of Virginia" } as const;
const LIS = "Legislative Information System (LIS)";
const OUTCOMES = ["signed", "vetoed", "passed", "failed", "tabled"] as const;
const VOTE_WORD: Record<string, string> = { Y: "Yea (yes)", N: "Nay (no)", A: "Abstained", X: "Did not vote" };
const sessionYear = (s: string) => `20${s.slice(2, 4)}`;

export function legCategories(l: Leg, rc: RollCallFile) {
  const s = new Set<string>();
  for (const b of l.bills) b.c.forEach((c) => s.add(c));
  for (const b of l.bills2027) b.c.forEach((c) => s.add(c));
  rc.rollCalls.forEach((r, i) => { if (l.votes[i] && l.votes[i] !== "-") r.c.forEach((c) => s.add(c)); });
  return [...s].sort();
}
export function legYears(l: Leg) {
  const s = new Set<string>(["2026"]);
  if (l.bills2027.length) s.add("2027");
  l.money?.cells.forEach((c) => s.add(c[1]));
  return [...s];
}

export function LegPanel({ leg: l, rc, f, wide = false }: { leg: Leg; rc: RollCallFile; f: Filters; wide?: boolean }) {
  const year = f.year, cat = f.cat;
  const title = `${l.chamber === "house" ? "Del." : "Sen."} ${l.name}`;
  const anchor = (s: string) => `${l.slug}-${s}`;

  const bills = l.bills.filter((b) => (!year || sessionYear(b.s) === year) && (!cat || b.c.includes(cat)));
  const bills27 = l.bills2027.filter((b) => (!year || year === "2027") && (!cat || b.c.includes(cat)));
  const outcome = OUTCOMES.map((o) => ({ o, n: bills.filter((b) => b.o === o).length }));

  const votes = useMemo(() => rc.rollCalls.map((r, i) => ({ r, v: l.votes[i] })).filter((x) => x.v && x.v !== "-"), [rc, l]);
  const fv = votes.filter((x) => (!year || x.r.d.startsWith(year)) && (!cat || x.r.c.includes(cat)));
  const vc = { Y: 0, N: 0, A: 0, X: 0 } as Record<string, number>;
  fv.forEach((x) => vc[x.v]++);
  const byCat = new Map<string, Record<string, number>>();
  for (const x of fv) for (const c of x.r.c.length ? x.r.c : ["No category"]) {
    const e = byCat.get(c) ?? { Y: 0, N: 0, A: 0, X: 0 };
    e[x.v]++;
    byCat.set(c, e);
  }
  const catRows = [...byCat.entries()].map(([label, parts]) => ({ label, key: label, parts })).sort((a, b) => (b.parts.N - a.parts.N) || (b.parts.Y - a.parts.Y)).slice(0, 10);
  const nays = fv.filter((x) => x.v === "N").sort((a, b) => b.r.d.localeCompare(a.r.d));

  const m = l.money;
  const yearTotals = new Map<string, number>();
  m?.cells.forEach(([, y, amt]) => yearTotals.set(y, (yearTotals.get(y) ?? 0) + amt));
  const donorTot = new Map<number, { amt: number; n: number; rid: number; years: Set<string> }>();
  m?.cells.forEach(([d, y, amt, n, rid]) => {
    if (year && y !== year) return;
    const e = donorTot.get(d) ?? { amt: 0, n: 0, rid: 0, years: new Set<string>() };
    e.amt += amt; e.n += n; e.rid = Math.max(e.rid, rid); e.years.add(y);
    donorTot.set(d, e);
  });
  const top = [...donorTot.entries()].sort((a, b) => b[1].amt - a[1].amt).slice(0, 10);
  const itemizedTotal = [...donorTot.values()].reduce((s, e) => s + e.amt, 0);
  const donorRows = top.map(([d, e]) => {
    const [name, ind, city, st] = m!.donors[d];
    return { key: String(d), label: name, value: e.amt, href: `${CF}/Report/Index/${e.rid}`,
      note: <>{ind ? "Individual" : "Organization or committee"}{city || st ? ` · ${[city, st].filter(Boolean).join(", ")}` : ""} · {e.n} itemized gift{e.n === 1 ? "" : "s"} · {[...e.years].sort().join(", ")} · link opens the latest report listing a gift</> };
  });
  const news = l.news.filter((n) => !year || n.d.startsWith(year));
  const lisAsOf = <>Source: {LIS}, <Ext href="https://lis.virginia.gov">lis.virginia.gov</Ext>, 2026 Regular Session and 2026 Special Session I. Roster data as of {dateLabel(l.asOf)}.</>;
  const catNote = <>Topic labels are <b className="text-white">aguyonx categories</b>: editorial groupings assigned by fixed keyword rules from each measure's official LIS title (an official LIS subject is used where one exists). They are not stances.</>;
  const moneyCoverage = m ? <>Source: Virginia Department of Elections campaign finance reports, <Ext href={CF}>cfreports.elections.virginia.gov</Ext>, read from the Department's monthly bulk files (<Ext href="https://apps.elections.virginia.gov/SBE_CSV/CF/">apps.elections.virginia.gov/SBE_CSV/CF</Ext>) for filing months {m.months[0].replace("_", "-")} through {m.months[1].replace("_", "-")}. Filing months in 2022 and 2026 are not collected yet, so gifts reported in those months are missing. Counts only itemized gifts (Schedule A). Each scheduled report is counted once in its latest amended version; Large Contribution Reports are skipped because those gifts reappear in the next scheduled report; transfers between the member's own committees are left out. Committees: {m.committees.map(([code, name], i) => <span key={code}>{i ? "; " : ""}<Ext href={`${CF}/?CommitteeName=${encodeURIComponent(name)}`}>{name}</Ext> ({code})</span>)}.</> : null;

  return (
    <div className={wide ? "grid min-w-0 items-start gap-5 lg:grid-cols-2" : "min-w-0 space-y-5"}>
      <div className={`rounded-xl border border-navy-line bg-navy-900 p-4 sm:p-5 ${wide ? "lg:col-span-2" : ""}`}>
        <p className="text-[11px] font-bold tracking-[0.14em] text-gold uppercase">Legislator · {CHAMBER[l.chamber]}</p>
        <h2 className="mt-1 font-serif text-3xl leading-tight font-bold uppercase">{title}</h2>
        <p className="mt-1 text-sm text-on-dark-muted">
          <span className="font-semibold" style={{ color: PARTY_COLOR[l.party] }}>{PARTY_NAME[l.party] ?? l.party}</span> · {l.chamber === "house" ? "House" : "Senate"} District {l.district}
          {l.committees.length ? <> · Committees: {l.committees.join(", ")}</> : null}
        </p>
        <p className="mt-2 text-sm"><a className="font-semibold text-gold underline underline-offset-2" href={l.profile}>Full member page on aguyonx.com</a> · <Ext href={l.lis}>Official LIS member page</Ext></p>
      </div>

      <Card id={anchor("bills")} kicker="Bills sponsored" title="Bills this member carried" share
        source={<>{lisAsOf} 2027 measures come from the LIS 2027 bill files in the <a className="text-gold underline" href="/virginia-2027-bills">2027 bill tracker</a>. {catNote}</>}>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Stat k={`Chief patron, ${year && year !== "2027" ? year : "2026"} sessions`} v={bills.length} />
          <Stat k="Signed into law" v={outcome[0].n} />
          <Stat k="2027 filings and carry-overs" v={bills27.length} />
        </dl>
        <div className="mt-4"><BarList rows={outcome.map((o) => ({ key: o.o, label: OUT_LABEL[o.o], value: o.n }))} color={OUT_COLOR.signed} empty="No bills in this view." /></div>
        <h4 className="mt-5 mb-2 text-sm font-bold tracking-wide uppercase">Bill list</h4>
        <MoreList items={[...bills27.map((b) => ({ b: b.b, t: b.t, st: b.st ?? "", when: "2027 Regular Session", h: b.h, c: b.c })), ...bills.map((b) => ({ b: b.b, t: b.t, st: OUT_LABEL[b.o], when: `2026 ${b.s === "20262" ? "Special Session I" : "Regular Session"}`, h: b.h, c: b.c }))]} first={6}
          empty={<p className="text-sm text-on-dark-muted">No bills match these filters.</p>}
          render={(b) => (<div className="text-sm"><Ext href={b.h}>{b.b}</Ext> <span className="text-on-dark-muted">· {b.when} · {b.st}</span><div>{b.t}</div>{b.c.length ? <div className="text-xs text-night-muted">aguyonx categories: {b.c.join(", ")}</div> : null}</div>)} />
      </Card>

      <Card id={anchor("votes")} kicker="Floor votes" title="How this member voted on final passage" share
        source={<>{lisAsOf} Roll calls from LIS HISTORY.CSV and VOTE.CSV. Only final-passage, defeat, third-reading and resolution-adoption floor votes are counted, so procedural motions and amendments are not mixed in. Each listed vote links to its official LIS vote page. {catNote}</>}>
        <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["Y", "N", "A", "X"] as const).map((k) => <Stat key={k} k={VOTE_WORD[k]} v={vc[k].toLocaleString("en-US")} />)}
        </dl>
        <h4 className="mt-5 mb-2 text-sm font-bold tracking-wide uppercase">Votes by topic (aguyonx categories)</h4>
        <StackBars rows={catRows} keys={[{ k: "Y", label: "Yea", color: VOTE_COLOR.Y }, { k: "N", label: "Nay", color: VOTE_COLOR.N }, { k: "X", label: "Did not vote", color: VOTE_COLOR.X }]} />
        <h4 className="mt-5 mb-2 text-sm font-bold tracking-wide uppercase">Nay votes in this view ({nays.length})</h4>
        <MoreList items={nays} first={5} empty={<p className="text-sm text-on-dark-muted">No Nay votes match these filters.</p>}
          render={(x) => (<div className="text-sm"><Ext href={x.r.h}>{x.r.b.join(", ")}{x.r.nb > x.r.b.length ? ` and ${x.r.nb - x.r.b.length} more` : ""}</Ext> <span className="text-on-dark-muted">· {dateLabel(x.r.d)}{x.r.ty ? ` · chamber tally ${x.r.ty}` : ""}</span><div>{x.r.t}</div></div>)} />
      </Card>

      <Card id={anchor("money")} kicker="Campaign money" title="Who gave to this member's campaign" share source={moneyCoverage ?? undefined}>
        {m ? (
          <>
            <dl className="grid grid-cols-2 gap-2">
              <Stat k={`Itemized gifts${year ? `, ${year}` : ", all years collected"}`} v={money(itemizedTotal)} />
              <Stat k="Reports read" v={m.reports} sub="scheduled reports, latest versions" />
            </dl>
            <h4 className="mt-5 mb-2 text-sm font-bold tracking-wide uppercase">Itemized gifts by year</h4>
            <Columns cols={[...yearTotals.entries()].sort().map(([y, v]) => ({ key: y, label: y, value: v, title: y }))} format={(n) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${Math.round(n / 1000)}K`} highlight={year} />
            <h4 className="mt-5 mb-2 text-sm font-bold tracking-wide uppercase">Top 10 givers{year ? ` in ${year}` : ""}</h4>
            <BarList rows={donorRows} format={money} empty={year ? `No itemized gifts in ${year} in the files collected.` : "No itemized gifts in the files collected."} />
          </>
        ) : (
          <NotCollected what="Campaign finance for this member" why={<>No committee for this member was found in the Virginia Department of Elections files collected so far (filing months 2021 and 2023 through 2025). Look the member up directly on <Ext href={CF}>cfreports.elections.virginia.gov</Ext>.</>} />
        )}
      </Card>

      <Card id={anchor("side-by-side")} kicker="Side by side" title="Top givers next to floor votes" share
        source={<>This chart puts two official records next to each other. It does not connect any gift to any vote, and no such link is claimed. Gifts: Virginia Department of Elections. Votes: LIS. Year and topic filters apply as above (topic filters only the votes).</>}>
        <div className="grid min-w-0 gap-5 sm:grid-cols-2">
          <div className="min-w-0"><h4 className="mb-2 text-sm font-bold tracking-wide uppercase">Top 5 givers</h4>{m ? <BarList rows={donorRows.slice(0, 5).map((r) => ({ ...r, note: undefined }))} format={money} /> : <p className="text-sm text-on-dark-muted">Not collected yet.</p>}</div>
          <div className="min-w-0"><h4 className="mb-2 text-sm font-bold tracking-wide uppercase">Floor votes by topic</h4><StackBars rows={catRows.slice(0, 5)} keys={[{ k: "Y", label: "Yea", color: VOTE_COLOR.Y }, { k: "N", label: "Nay", color: VOTE_COLOR.N }]} /></div>
        </div>
      </Card>

      <Card id={anchor("meetings")} kicker="Transcripts and recaps" title="Floor sessions on video"
        source={<>Floor-session transcripts are machine speech-to-text from official {l.chamber === "house" ? "House" : "Senate"} video; Find the Moment links each line to the video. Recaps take votes only from official records.</>}>
        <dl className="grid grid-cols-2 gap-2"><Stat k={`${l.chamber === "house" ? "House" : "Senate"} floor sessions transcribed`} v={l.transcripts.floor} /></dl>
        <p className="mt-3 text-sm"><a className="font-semibold text-gold underline underline-offset-2" href={l.transcripts.ftm}>Search what was said in Find the Moment</a>{l.chamber === "house" ? <> (type “{l.transcripts.q}” in the search box)</> : null} · <a className="font-semibold text-gold underline underline-offset-2" href={l.transcripts.recaps}>Floor session recaps</a></p>
        <p className="mt-2 text-xs text-night-muted">Counts of how often this member spoke are not collected yet: transcripts do not reliably name each speaker.</p>
      </Card>

      <Card id={anchor("news")} kicker="News clips" title="In the news">
        <MoreList items={news} first={5}
          empty={<NotCollected what={`News clips naming ${title}${year ? ` in ${year}` : ""}`} why="No clip on the aguyonx.com News shelf is tagged with this member yet. Clips are tagged by hand when filed, so untagged stories do not show here." />}
          render={(n) => (<div className="text-sm"><Ext href={n.u}>{n.h}</Ext><div className="text-xs text-on-dark-muted">{n.o} · {dateLabel(n.d)}</div></div>)} />
      </Card>
    </div>
  );
}
