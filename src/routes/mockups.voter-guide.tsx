import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { V4Main, parseDate } from "@/components/site/lcps-v4";
import { V4VenueHero } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { ISSUES, VENUE_LABEL, issueMoments, issueStories, issueVotes, type VenueKey } from "@/lib/voter-mock";

/** Voter guide by issue (preview mockup). Every link is computed from repo data: official decisions, recap moments, our stories. */
export const Route = createFileRoute("/mockups/voter-guide")({
  validateSearch: (s: Record<string, unknown>) => ({ issue: typeof s.issue === "string" && ISSUES.some((i) => i.id === s.issue) ? s.issue : "taxes" }),
  head: () => ({ meta: [{ title: "Mockup: Voter guide by issue · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

const card = "rounded-xl border border-navy-line bg-navy-700";
const lab = "font-mono text-xs tracking-widest text-gold uppercase";
const fmt = (s: number) => `${Math.floor(s / 3600) ? `${Math.floor(s / 3600)}:` : ""}${String(Math.floor((s % 3600) / 60)).padStart(Math.floor(s / 3600) ? 2 : 1, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function Page() {
  const { issue: id } = Route.useSearch();
  const nav = Route.useNavigate();
  const issue = ISSUES.find((i) => i.id === id)!;
  const [board, setBoard] = useState<"all" | VenueKey>("all");
  const votes = useMemo(() => issueVotes(issue).sort((a, b) => parseDate(b.row.dateLabel) - parseDate(a.row.dateLabel)), [issue]);
  const moments = useMemo(() => issueMoments(issue).sort((a, b) => parseDate(b.row.dateLabel) - parseDate(a.row.dateLabel)), [issue]);
  const stories = useMemo(() => issueStories(issue), [issue]);
  const boards = [...new Set(votes.map((v) => v.row.venue))];
  const shown = votes.filter((v) => board === "all" || v.row.venue === board);
  const e = encodeURIComponent(issue.ftmQuery);
  return (
    <SiteShell>
      <V4Main>
        <V4VenueHero venue={{ crumbs: [{ label: "Mockups" }], titleA: "Voter guide", titleB: "by issue", foia: V4_VENUES["loudoun-bos"].foia }} kicker="Voter guide" />
        <div role="status" className="bg-gold text-navy-900"><p className="mx-auto max-w-7xl px-4 py-3 text-center font-serif text-lg font-bold tracking-[0.14em] uppercase sm:px-8">Preview mockup · start from an issue</p></div>
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-8">
          <p className="font-serif text-3xl font-bold sm:text-4xl">Pick what you care about. See how your boards actually voted.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" role="tablist">
            {ISSUES.map((i) => {
              const n = issueVotes(i).length;
              return (
                <button key={i.id} role="tab" aria-selected={i.id === id} onClick={() => { setBoard("all"); nav({ search: { issue: i.id }, replace: true }); }} className={`rounded-xl border p-4 text-left ${i.id === id ? "border-gold bg-gold text-navy-900" : "border-navy-line bg-navy-700 hover:border-gold"}`}>
                  <span className="block font-serif text-xl font-bold uppercase">{i.label}</span>
                  <span className={`mt-1 block text-sm ${i.id === id ? "text-navy-800" : "text-on-dark-muted"}`}>{n} recorded votes</span>
                </button>
              );
            })}
          </div>
          <p className="text-on-dark-muted">{issue.plain}</p>
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section className={`${card} p-5`}>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <p className={lab}>Recorded votes ({shown.length})</p>
                <select value={board} onChange={(ev) => setBoard(ev.target.value as VenueKey | "all")} className="h-10 rounded-md border border-navy-line bg-navy-800 px-2 text-sm">
                  <option value="all">All local boards</option>
                  {boards.map((b) => <option key={b} value={b}>{VENUE_LABEL[b]}</option>)}
                </select>
              </div>
              <ol className="mt-3 divide-y divide-navy-line">
                {shown.slice(0, 12).map(({ row, d }, k) => (
                  <li key={k} className="py-3 text-sm">
                    <p className="font-mono text-xs text-night-muted">{VENUE_LABEL[row.venue]} · {row.dateLabel}</p>
                    <p className="mt-1">{d.action}</p>
                    <p className="mt-1 text-on-dark-muted">{d.tally ? <>{d.tally} · </> : null}<a href={d.source.href} target="_blank" rel="noreferrer" className="underline">{d.source.label}</a> · <a href={row.href} className="text-gold underline">Meeting page</a></p>
                  </li>
                ))}
              </ol>
              {shown.length > 12 ? <p className="mt-2 text-xs text-night-muted">Showing 12 of {shown.length}, newest first.</p> : null}
              <p className="mt-3 text-xs text-night-muted">Matched by keyword in the official action text, so a few may be only loosely on topic. State votes: see the House and Senate links.</p>
            </section>
            <div className="space-y-6">
              <section className={`${card} p-5`}>
                <p className={lab}>Find the Moment clips ({moments.length})</p>
                <ul className="mt-2 divide-y divide-navy-line">
                  {moments.slice(0, 6).map(({ row, m }, k) => (
                    <li key={k} className="py-2 text-sm"><a href={row.href} className="font-semibold text-gold">{m.label}</a><span className="block text-on-dark-muted">{VENUE_LABEL[row.venue]} · {row.dateLabel} · at {fmt(m.seconds)}</span></li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">Search what was said: <a className="text-gold underline" href={`/dashboards/house/find-the-moment?q=${e}`}>House floor</a> · <a className="text-gold underline" href={`/dashboards/senate/find-the-moment?q=${e}`}>Senate floor</a> · <a className="text-gold underline" href="/find-the-moment">All places</a></p>
              </section>
              <section className={`${card} p-5`}>
                <p className={lab}>Our reporting ({stories.length})</p>
                <ul className="mt-2 divide-y divide-navy-line">
                  {stories.slice(0, 6).map((h) => <li key={h.id} className="py-2 text-sm"><a href={h.href} className="font-semibold text-gold">{h.title}</a><span className="block text-on-dark-muted">{h.shelf}</span></li>)}
                </ul>
              </section>
            </div>
          </div>
        </div>
      </V4Main>
    </SiteShell>
  );
}
