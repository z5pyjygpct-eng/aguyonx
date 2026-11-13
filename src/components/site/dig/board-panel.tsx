import { Link } from "@tanstack/react-router";
import { BarList, Card, Columns, Ext, MoreList, NotCollected, Stat, dateLabel, yearOf } from "./ui";
import type { Board, Filters, NewsRow, Place } from "./types";

const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const boardYears = (b: Board) => [...new Set(b.meetings.map((m) => yearOf(m.d)).filter(Boolean))];
const recapHref = (slug: string) => `/counties/loudoun/recaps/${slug}`;

function months(from: string, to: string) {
  const out: string[] = [];
  let [y, m] = from.split("-").map(Number);
  const [ty, tm] = to.split("-").map(Number);
  while (y < ty || (y === ty && m <= tm)) { out.push(`${y}-${String(m).padStart(2, "0")}`); m++; if (m > 12) { m = 1; y++; } }
  return out;
}

export function BoardPanel({ b, f, compact = false, wide = false, className = "" }: { b: Board; f: Filters; compact?: boolean; wide?: boolean; className?: string }) {
  const year = f.year;
  const topic = b.topics.find((t) => t[0] === f.topic);
  const anchor = (s: string) => `${b.id.replace(".", "-")}-${s}`;
  const meetings = b.meetings.filter((m) => !year || yearOf(m.d) === year);
  const recaps = b.recaps.filter((r) => (!year || yearOf(r.d) === year));
  const tRecaps = recaps.filter((r) => !topic || r.tp.includes(topic[0]));
  const dated = b.recaps.map((r) => r.d).filter(Boolean).sort() as string[];
  const span = year ? months(`${year}-01`, `${year}-12`) : dated.length ? months(dated[0].slice(0, 7), dated[dated.length - 1].slice(0, 7)) : [];
  const perMonth = new Map<string, number>();
  tRecaps.forEach((r) => r.d && perMonth.set(r.d.slice(0, 7), (perMonth.get(r.d.slice(0, 7)) ?? 0) + 1));
  const cols = span.map((k) => { const [y, m] = k.split("-"); return { key: k, label: m === "01" || year ? `${MON[+m - 1]}${year ? "" : ` ${y}`}` : "", value: perMonth.get(k) ?? 0, title: `${MON[+m - 1]} ${y}` }; });
  const topicCounts = b.topics.map(([id, label]) => ({ key: id, label, value: recaps.filter((r) => r.tp.includes(id)).length }));
  const actions = tRecaps.flatMap((r) => r.dec.map((d) => ({ r, d })));
  const withVotes = recaps.filter((r) => r.dec.length).length;
  const source = <>Meetings, video and recaps are the ones filed on aguyonx.com. Recorded actions and tallies are copied from the official record linked on each line; nothing is taken from video or transcripts. Topic labels are <b className="text-white">aguyonx categories</b>: fixed keyword rules applied to each recap's agenda titles, topic labels and recorded actions. A meeting counts once per topic however often the topic came up.</>;

  return (
    <div className={`${wide ? "grid min-w-0 items-start gap-5 lg:grid-cols-2" : "min-w-0 space-y-5"} ${className}`}>
      <div className={`rounded-xl border border-navy-line bg-navy-900 p-4 sm:p-5 ${wide ? "lg:col-span-2" : ""}`}>
        <p className="text-[11px] font-bold tracking-[0.14em] text-gold uppercase">Board</p>
        <h2 className="mt-1 font-serif text-3xl leading-tight font-bold uppercase">{b.label}</h2>
        <p className="mt-2 text-sm"><Ext href={b.official}>Official board site</Ext> · <a className="font-semibold text-gold underline underline-offset-2" href={b.links.recaps}>All recaps</a> · <a className="font-semibold text-gold underline underline-offset-2" href={b.links.ftm}>Find the Moment</a> · <a className="font-semibold text-gold underline underline-offset-2" href={b.links.members}>Members</a></p>
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat k={`Meetings on file${year ? `, ${year}` : ""}`} v={meetings.length} />
          <Stat k="With machine transcript" v={meetings.filter((m) => m.tx).length} />
          <Stat k="Recaps" v={recaps.length} />
          <Stat k="Recaps with official recorded actions" v={withVotes} />
        </dl>
      </div>

      <Card id={anchor("topic")} kicker="Topic over time" title={topic ? `How often “${topic[1]}” came up` : "Recapped meetings per month"} share source={source}>
        <p className="mb-3 text-sm text-on-dark-muted">{topic ? <>Meetings per month whose recap touches <b className="text-white">{topic[1]}</b>{year ? ` in ${year}` : ""}: {tRecaps.length.toLocaleString("en-US")} of {recaps.length.toLocaleString("en-US")} recaps.</> : <>Pick a topic in the filter bar to see how often it came up. Showing all {recaps.length.toLocaleString("en-US")} recaps{year ? ` in ${year}` : ""}.</>}</p>
        <Columns cols={cols} />
        {!compact ? <><h4 className="mt-5 mb-2 text-sm font-bold tracking-wide uppercase">Recaps by topic{year ? `, ${year}` : ""}</h4><BarList rows={topicCounts.sort((x, y) => y.value - x.value)} /></> : null}
      </Card>

      <Card id={anchor("votes")} kicker="Votes" title="Recorded actions and tallies" source={<>Each action links to the official minutes or action report it comes from. Recaps whose official record is not posted yet show no actions here.</>}>
        <MoreList items={actions} first={compact ? 4 : 8}
          empty={<NotCollected what={`Official recorded actions${topic ? ` on ${topic[1]}` : ""}${year ? ` in ${year}` : ""}`} why="The recaps in this view do not carry official recorded actions yet. Actions are added only once the board posts its minutes or action report." />}
          render={({ r, d }) => (<div className="text-sm"><div className="text-xs text-on-dark-muted">{dateLabel(r.d)} · <a className="text-gold underline underline-offset-2" href={recapHref(r.slug)}>{r.t}</a>{d.i ? ` · item ${d.i}` : ""}</div><div className="mt-0.5">{d.a}</div><div className="mt-0.5 text-xs">{d.ty ? <span className="font-semibold text-white">Tally {d.ty} · </span> : null}<Ext href={d.h}>{d.l}</Ext></div></div>)} />
      </Card>

      {!compact ? (
        <Card id={anchor("meetings")} kicker="Transcripts and recaps" title="Meetings on file" source={<>Video links go to the board's official player. Transcripts are machine speech-to-text, searchable in Find the Moment.</>}>
          <MoreList items={[...meetings].sort((x, y) => (y.d ?? "").localeCompare(x.d ?? ""))} first={6} empty={<p className="text-sm text-on-dark-muted">No meetings on file in this view.</p>}
            render={(m) => (<div className="text-sm"><div>{m.t}</div><div className="text-xs text-on-dark-muted">{dateLabel(m.d)} · <Ext href={m.v}>Official video</Ext>{m.r ? <> · <a className="text-gold underline underline-offset-2" href={recapHref(m.r)}>Recap</a></> : null}{m.tx ? " · transcript in Find the Moment" : ""}</div></div>)} />
        </Card>
      ) : null}

      {!compact ? (
        <Card id={anchor("people")} kicker="Members" title="Who sits on the board">
          <ul className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-2">{b.roster.map((p) => <li key={p.name}><span className="font-semibold">{p.name}</span> <span className="text-on-dark-muted">· {p.role} · {p.district}{p.party ? ` · ${p.party === "D" ? "Democrat" : p.party === "R" ? "Republican" : p.party}` : ""}</span></li>)}</ul>
          <p className="mt-3 text-xs text-night-muted">Roster as listed on aguyonx.com. How each member voted, one by one, is not collected yet: the recaps carry board tallies, and member-by-member votes appear only where the official record names them.</p>
        </Card>
      ) : null}
    </div>
  );
}

export function NewsCard({ id, news, f, title, more }: { id: string; news: NewsRow[]; f: Filters; title: string; more?: string }) {
  const rows = news.filter((n) => !f.year || n.d.startsWith(f.year));
  return (
    <Card id={id} kicker="News clips" title={title} source={<>Headlines from public outlets filed on the aguyonx.com News shelf and tagged to this place. Each links to the original story.{more ? <> <a className="text-gold underline" href={more}>All Loudoun news</a>.</> : null}</>}>
      <MoreList items={rows} first={6} empty={<NotCollected what="News clips in this view" why="No clip on the News shelf matches these filters." />}
        render={(n) => (<div className="text-sm"><Ext href={n.u}>{n.h}</Ext><div className="text-xs text-on-dark-muted">{n.o} · {dateLabel(n.d)}</div></div>)} />
    </Card>
  );
}

export function PlacePanel({ p, boards, f, wide = false }: { p: Place; boards: Board[]; f: Filters; wide?: boolean }) {
  return (
    <div className={wide ? "grid min-w-0 items-start gap-5 lg:grid-cols-2" : "min-w-0 space-y-5"}>
      <div className={`rounded-xl border border-navy-line bg-navy-900 p-4 sm:p-5 ${wide ? "lg:col-span-2" : ""}`}>
        <p className="text-[11px] font-bold tracking-[0.14em] text-gold uppercase">Locality · everything on file</p>
        <h2 className="mt-1 font-serif text-3xl leading-tight font-bold uppercase">{p.label}</h2>
        <p className="mt-2 text-sm text-on-dark-muted">The Board of Supervisors, the Loudoun County Public Schools (LCPS) School Board, Loudoun's members of the Virginia General Assembly, and Loudoun news, all in one place.</p>
      </div>

      <Card id="loudoun-delegation" kicker="General Assembly" title="Loudoun's state legislators"
        source={<>Who represents Loudoun: <Ext href={p.delegationSource}>Loudoun County, State and Federal Legislators</Ext> (official county page, checked Nov 13, 2026). Some districts also cover parts of other counties. Party and district: Legislative Information System (LIS) rosters.</>}>
        <ul className="divide-y divide-navy-line/60">
          {p.delegation.map((d) => (
            <li key={d.slug} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2 text-sm first:pt-0">
              <span><span className="font-semibold">{d.chamber === "house" ? "Del." : "Sen."} {d.name}</span> <span className="text-on-dark-muted">· {d.chamber === "house" ? "House" : "Senate"} District {d.district} · {d.party === "D" ? "Democrat" : d.party === "R" ? "Republican" : d.party}</span></span>
              <span className="flex gap-3"><Link to="/dig" search={{ a: `leg.${d.slug}` }} className="font-semibold text-gold underline underline-offset-2">Dig in</Link><a href={`/dashboards/${d.chamber}/members/${d.slug}`} className="text-on-dark-muted underline underline-offset-2">Member page</a></span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-night-muted">Votes, bills and campaign money for each legislator open with “Dig in”, or pick two to compare side by side.</p>
      </Card>

      <NewsCard id="loudoun-news" news={p.news} f={f} title="Loudoun in the news" more={p.newsUrl} />
      {boards.map((b) => <BoardPanel key={b.id} b={b} f={f} compact wide={wide} className={wide ? "lg:col-span-2" : ""} />)}
    </div>
  );
}
