import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, PlayCircle } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main, parseDate } from "@/components/site/lcps-v4";
import { V4VenueHero } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { MEETINGS, VENUE_FTM, VENUE_LABEL, coverage, loadRollCalls, type MeetingRow, type RollCall, type VenueKey } from "@/lib/voter-mock";

/** Find the Moment "next step" mockup (preview only): every official vote on each meeting card + a Start here guide. */
export const Route = createFileRoute("/mockups/meetings")({
  validateSearch: (s: Record<string, unknown>) => ({ venue: (typeof s.venue === "string" && s.venue in VENUE_LABEL ? s.venue : "loudoun-bos") as VenueKey, page: Math.max(1, Number(s.page) || 1), all: s.all === "1" || s.all === 1 ? 1 : 0 }),
  head: () => ({ meta: [{ title: "Mockup: Meetings and every vote · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

const card = "rounded-xl border border-navy-line bg-navy-700";
const lab = "font-mono text-xs tracking-widest text-gold uppercase";
const PER = 8;
const VENUES = (Object.keys(VENUE_LABEL) as VenueKey[]).filter((v) => v !== "va-boe");

function StartHere({ venue }: { venue: VenueKey }) {
  const steps = [
    ["Pick a meeting", "Newest first. A green tag means the official votes are posted."],
    ["Read what they decided", "Every item voted on is listed under the meeting, with the official tally."],
    ["Check the source", "Each vote links to the minutes or roll call it came from."],
    ["Hear the discussion", "Open the meeting page for video moments, or search what was said."],
  ];
  return (
    <section className={`${card} border-l-4 border-l-gold p-5`} aria-labelledby="start">
      <p id="start" className={lab}>Start here</p>
      <ol className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([t, d], i) => (
          <li key={t} className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold font-serif font-bold text-navy-900">{i + 1}</span><span><span className="block font-semibold">{t}</span><span className="block text-sm text-on-dark-muted">{d}</span></span></li>
        ))}
      </ol>
      <p className="mt-3 text-sm"><a className="text-gold underline" href={VENUE_FTM[venue]}>Search what was said at {VENUE_LABEL[venue]} meetings</a></p>
    </section>
  );
}

function GaVotes({ row }: { row: MeetingRow }) {
  const [rc, setRc] = useState<RollCall[] | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => { if (row.votesUrl) loadRollCalls(row.votesUrl).then(setRc).catch(() => setErr(true)); }, [row.votesUrl]);
  if (!row.votesUrl) return <p className="text-sm text-night-muted">LIS records no floor roll calls for this day.</p>;
  if (err) return <p className="text-sm text-night-muted">Couldn’t load the roll calls. <a className="text-gold underline" href={row.votesUrl}>Open the file</a>.</p>;
  if (!rc) return <p className="text-sm text-night-muted">Loading {row.rollCallCount} roll calls…</p>;
  return (
    <ol className="divide-y divide-navy-line">
      {rc.flatMap((r) => r.bills.map((b) => (
        <li key={r.voteId + b.bill} className="py-2 text-sm">
          <a href={b.href} target="_blank" rel="noreferrer" className="font-semibold text-gold">{b.bill}</a> {b.title}
          <span className="block text-on-dark-muted">{b.action} · <a href={b.voteHref} target="_blank" rel="noreferrer" className="underline">LIS roll call</a></span>
        </li>
      )))}
    </ol>
  );
}

function MeetingCard({ row }: { row: MeetingRow }) {
  const ga = row.venue === "va-house" || row.venue === "va-senate";
  const n = ga ? row.rollCallCount ?? 0 : row.decisions.length;
  return (
    <li className={`${card} overflow-hidden`}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-line px-5 py-4">
        <div className="min-w-0">
          <p className="font-serif text-xs tracking-[0.16em] text-gold uppercase">{row.dateLabel}</p>
          <h3 className="mt-0.5 font-serif text-xl font-semibold">{row.title}</h3>
        </div>
        {row.votesPosted ? <span className="rounded-full border border-[#2e8f5e] bg-[#2eb46e]/15 px-3 py-1.5 text-xs font-semibold text-[#7be0ae]">✓ {n} official {ga ? "roll call" : "vote"}{n === 1 ? "" : "s"}</span>
          : row.noVotesRecorded ? <span className="rounded-full border border-navy-line px-3 py-1.5 text-xs text-night-muted">Minutes record no votes</span>
          : <span className="rounded-full border border-gold/60 px-3 py-1.5 text-xs text-gold">Votes not posted yet</span>}
      </div>
      <div className="px-5 py-4">
        <p className={lab}>What they voted on</p>
        <div className="mt-2">
          {ga ? <GaVotes row={row} /> : row.decisions.length ? (
            <ol className="divide-y divide-navy-line">
              {row.decisions.map((d, i) => (
                <li key={i} className="py-2 text-sm">
                  <span className="mr-2 font-mono text-xs text-night-muted">{d.item}</span>{d.action}
                  <span className="block text-on-dark-muted">{d.tally ? <>{d.tally} · </> : null}<a href={d.source.href} target="_blank" rel="noreferrer" className="underline">{d.source.label}</a></span>
                </li>
              ))}
            </ol>
          ) : <p className="text-sm text-night-muted">{row.note}</p>}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href={row.href} className="inline-flex h-10 items-center gap-2 rounded-md bg-gold px-4 text-sm font-semibold text-navy-900"><PlayCircle className="size-4" />Open meeting{row.moments.length ? ` · ${row.moments.length} video moments` : ""}</a>
        </div>
      </div>
    </li>
  );
}

function Page() {
  const { venue, page, all } = Route.useSearch();
  const nav = Route.useNavigate();
  const rows = useMemo(() => MEETINGS.filter((m) => m.venue === venue && (all || m.votesPosted)).sort((a, b) => parseDate(b.dateLabel) - parseDate(a.dateLabel)), [venue, all]);
  const pages = Math.max(1, Math.ceil(rows.length / PER));
  const cur = Math.min(page, pages);
  const cov = useMemo(coverage, []);
  const set = (p: Partial<{ venue: VenueKey; page: number; all: number }>) => nav({ search: (s: { venue: VenueKey; page: number; all: number }) => ({ ...s, page: 1, ...p }), replace: true });
  return (
    <SiteShell>
      <V4Main>
        <V4VenueHero venue={{ crumbs: [{ label: "Mockups" }], titleA: "Meetings", titleB: "and every vote", foia: V4_VENUES["loudoun-bos"].foia }} kicker="Find the Moment" />
        <div role="status" className="bg-gold text-navy-900"><p className="mx-auto max-w-7xl px-4 py-3 text-center font-serif text-lg font-bold tracking-[0.14em] uppercase sm:px-8">Preview mockup · next step after picking a meeting</p></div>
        <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8">
          <StartHere venue={venue} />
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 font-mono text-xs tracking-widest text-night-muted uppercase">Board
              <select value={venue} onChange={(e) => set({ venue: e.target.value as VenueKey })} className="h-11 rounded-md border border-navy-line bg-navy-700 px-2 text-sm normal-case tracking-normal text-white">
                {VENUES.map((v) => <option key={v} value={v}>{VENUE_LABEL[v]}</option>)}
              </select>
            </label>
            <label className="flex h-11 items-center gap-2 text-sm"><input type="checkbox" checked={!!all} onChange={(e) => set({ all: e.target.checked ? 1 : 0 })} />Include meetings without posted votes</label>
            <p className="text-sm text-night-muted">{rows.length} meetings</p>
          </div>
          {rows.length ? (
            <ul className="space-y-5">{rows.slice((cur - 1) * PER, cur * PER).map((r) => <MeetingCard key={r.href} row={r} />)}</ul>
          ) : <p className={`${card} p-5 text-on-dark-muted`}>No meetings for this board have official votes in the repo yet. Tick “Include meetings without posted votes” to see them.</p>}
          {pages > 1 ? (
            <nav className="flex items-center gap-3 text-sm" aria-label="Pages">
              <button disabled={cur === 1} onClick={() => nav({ search: (s: { venue: VenueKey; page: number; all: number }) => ({ ...s, page: cur - 1 }) })} className="h-10 rounded-md border border-navy-line px-3 disabled:opacity-40">Newer</button>
              <span>Page {cur} of {pages}</span>
              <button disabled={cur === pages} onClick={() => nav({ search: (s: { venue: VenueKey; page: number; all: number }) => ({ ...s, page: cur + 1 }) })} className="h-10 rounded-md border border-navy-line px-3 disabled:opacity-40">Older</button>
            </nav>
          ) : null}
          <section className={`${card} p-5`}>
            <p className={lab}>Which boards have vote data</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-night-muted"><tr><th className="py-1 pr-4">Board</th><th className="pr-4">Meetings</th><th className="pr-4">With official votes</th><th>Items voted</th></tr></thead>
                <tbody>{cov.map((c) => (
                  <tr key={c.venue} className="border-t border-navy-line"><td className="py-1.5 pr-4">{VENUE_LABEL[c.venue]}</td><td className="pr-4">{c.meetings}</td><td className="pr-4">{c.withVotes}</td><td>{c.withVotes ? c.items.toLocaleString() : "none yet"}</td></tr>
                ))}</tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-night-muted">Counts come from the recap data in the repo. House and Senate count LIS roll calls. Board of Education meetings have video and transcripts only.</p>
          </section>
          <p className="text-xs text-night-muted"><ExternalLink className="mr-1 inline size-3" />Every vote above is copied from official minutes or LIS roll calls. Nothing is inferred from video or transcripts.</p>
        </div>
      </V4Main>
    </SiteShell>
  );
}
