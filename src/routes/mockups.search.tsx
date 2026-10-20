import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { V4VenueHero } from "@/components/site/venue-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { Walkthrough } from "@/components/site/howto";
import { searchSite, type SearchHit } from "@/lib/search";
import { EXAMPLE_PROMPTS, TRY_CHIPS, VENUE_LABEL, VENUE_MEMBERS, meetingMatchCount, meetingMatches, relatedTerms, type VenueKey } from "@/lib/voter-mock";

/** Search onboarding mockup (preview only). Same site index as the homepage box (src/lib/search.ts), plus meeting titles/votes. */
export const Route = createFileRoute("/mockups/search")({
  validateSearch: (s: Record<string, unknown>) => (typeof s.q === "string" && s.q ? { q: s.q } : {}) as { q?: string },
  head: () => ({ meta: [{ title: "Mockup: Search for voters · A Guy on X" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

const card = "rounded-xl border border-navy-line bg-navy-700";
const lab = "font-mono text-xs tracking-widest text-gold uppercase";
const chip = "inline-flex min-h-10 items-center rounded-full border border-navy-line bg-navy-800 px-4 text-sm font-semibold text-white hover:border-gold hover:text-gold";

const external = (h: string) => /^https?:/.test(h) || /\.(pdf|md|csv|txt)$/i.test(h);
const SHELF_ORDER = ["Investigation", "Article", "Page", "2027", "Library", "Book", "Delegate paper", "Senator paper", "News"];
const SHELF_LABEL: Record<string, string> = { Investigation: "Our investigations", Article: "Our articles", Page: "Site pages", "2027": "2027 candidates", Library: "Research Library", Book: "Books", "Delegate paper": "Delegate papers", "Senator paper": "Senator papers", News: "News coverage (other outlets)" };

function Hit({ h }: { h: SearchHit }) {
  return (
    <li><a href={h.href} {...(external(h.href) ? { target: "_blank", rel: "noreferrer" } : {})} className="block rounded-lg px-3 py-2.5 hover:bg-navy-600">
      <p className="font-semibold">{h.title}</p>
      {h.snippet ? <p className="mt-0.5 line-clamp-2 text-sm text-on-dark-muted">{h.snippet}</p> : null}
    </a></li>
  );
}

function SaidLinks({ q }: { q: string }) {
  const e = encodeURIComponent(q);
  return (
    <div className={`${card} border-l-4 border-l-gold p-4`}>
      <p className={lab}>Search what was said in meetings</p>
      <p className="mt-1 text-sm text-on-dark-muted">Meeting transcripts hold far more words than our pages. These open the transcript search{q ? <> for “{q}”</> : null}.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a className={chip} href={`/dashboards/house/find-the-moment?q=${e}`}>House floor</a>
        <a className={chip} href={`/dashboards/senate/find-the-moment?q=${e}`}>Senate floor</a>
        <a className={chip} href="/dashboards/loudoun/bos/find-the-moment">Loudoun supervisors</a>
        <a className={chip} href="/dashboards/loudoun/schools/find-the-moment">Loudoun School Board</a>
        <a className={chip} href="/find-the-moment">All places</a>
      </div>
      <p className="mt-2 text-xs text-night-muted">House and Senate fill in your words. The local searches open empty for now (open item).</p>
    </div>
  );
}

function SupervisorGuide() {
  const boards: VenueKey[] = ["loudoun-bos", "albemarle-bos", "fairfax-city-council", "manassas-council"];
  return (
    <div className={`${card} border-l-4 border-l-gold p-5`}>
      <p className={lab}><Sparkles className="mr-1 inline size-3.5" />Answering “what did my supervisor vote on”</p>
      <p className="mt-2 text-on-dark-muted">Pick your board. Each meeting there lists every item voted on, with the official tally.</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {boards.map((b) => (
          <li key={b} className="rounded-lg bg-navy-800 p-3">
            <p className="font-semibold">{VENUE_LABEL[b]}</p>
            <p className="mt-1 flex flex-wrap gap-3 text-sm">
              <a className="text-gold underline" href={`/mockups/meetings?venue=${b}`}>Meetings and votes</a>
              {VENUE_MEMBERS[b] ? <a className="text-gold underline" href={VENUE_MEMBERS[b]}>Who’s on the board</a> : null}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-night-muted">Albemarle supervisors and Manassas council have no vote data in the repo yet, so their meetings show “votes not posted”.</p>
    </div>
  );
}

function Results({ q, onPick }: { q: string; onPick: (s: string) => void }) {
  const hits = useMemo(() => searchSite(q), [q]);
  const meets = useMemo(() => meetingMatches(q, 6), [q]);
  const meetN = useMemo(() => meetingMatchCount(q), [q]);
  const related = useMemo(() => relatedTerms(q), [q]);
  const prompt = EXAMPLE_PROMPTS.find((p) => p.q === q.trim().toLowerCase());
  const groups = SHELF_ORDER.map((s) => ({ s, list: hits.filter((h) => h.shelf === s) })).filter((g) => g.list.length);
  const none = hits.length === 0 && meets.length === 0;
  return (
    <div className="mt-6 space-y-5" aria-live="polite">
      <p className="text-sm text-night-muted">
        {hits.length >= 40 ? "40+" : hits.length} on our pages · {meetN} meeting{meetN === 1 ? "" : "s"} by title or vote
      </p>
      {prompt?.guide === "supervisor" ? <SupervisorGuide /> : null}
      {none ? (
        <div className={`${card} p-5`}>
          <p className="font-serif text-2xl font-semibold">Nothing on our pages says “{q}” yet.</p>
          <p className="mt-2 text-on-dark-muted">That doesn’t mean nobody said it. Our page search covers articles, investigations, the Library, news headlines and candidate names, but not what was said inside meetings.</p>
          {related.length ? (
            <>
              <p className={`${lab} mt-4`}>Try a related word</p>
              <div className="mt-2 flex flex-wrap gap-2">{related.map((r) => <button key={r.term} type="button" className={chip} onClick={() => onPick(r.term)}>{r.term} <span className="ml-1.5 text-night-muted">{r.n >= 40 ? "40+" : r.n}</span></button>)}</div>
            </>
          ) : null}
        </div>
      ) : null}
      {meets.length ? (
        <section className={`${card} p-3`}>
          <p className={`${lab} px-3 pt-2`}>Meetings ({meetN})</p>
          <ul>{meets.map(({ row, why }) => (
            <li key={row.href}><a href={row.href} className="block rounded-lg px-3 py-2.5 hover:bg-navy-600">
              <p className="font-semibold">{VENUE_LABEL[row.venue]}: {row.title}</p>
              <p className="text-sm text-on-dark-muted">{row.dateLabel} · {why}</p>
            </a></li>))}
          </ul>
          {meetN > meets.length ? <p className="px-3 pb-2 text-xs text-night-muted">Showing {meets.length} of {meetN}.</p> : null}
        </section>
      ) : null}
      {groups.map((g) => (
        <section key={g.s} className={`${card} p-3`}>
          <p className={`${lab} px-3 pt-2`}>{SHELF_LABEL[g.s] ?? g.s} ({g.list.length})</p>
          <ul>{g.list.slice(0, 5).map((h) => <Hit key={h.id} h={h} />)}</ul>
        </section>
      ))}
      <SaidLinks q={q} />
    </div>
  );
}

function Page() {
  const { q: q0 = "" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [text, setText] = useState(q0);
  const q = q0.trim();
  const run = (s: string) => { setText(s); navigate({ search: s ? { q: s } : {}, replace: true }); };
  const onSubmit = (e: FormEvent) => { e.preventDefault(); run(text.trim()); };
  return (
    <SiteShell>
      <V4Main>
        <V4VenueHero venue={{ crumbs: [{ label: "Mockups" }], titleA: "Search", titleB: "for voters", foia: V4_VENUES["loudoun-bos"].foia }} kicker="Search" />
        <div role="status" className="bg-gold text-navy-900"><p className="mx-auto max-w-7xl px-4 py-3 text-center font-serif text-lg font-bold tracking-[0.14em] uppercase sm:px-8">Preview mockup · search onboarding</p></div>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
          <p className="font-serif text-3xl font-bold sm:text-4xl">What do you want to know about your local government?</p>
          <form role="search" onSubmit={onSubmit} className="mt-5 flex h-14">
            <label htmlFor="voter-q" className="sr-only">Search</label>
            <span className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#55627a]" aria-hidden />
              <input id="voter-q" type="search" value={text} onChange={(e) => { setText(e.target.value); if (!e.target.value) run(""); }} placeholder="Try “taxes”, “data centers” or a person’s name" autoComplete="off" className="h-14 w-full rounded-l-xl bg-white pr-4 pl-12 text-base text-navy-800 placeholder:text-[#55627a]" />
            </span>
            <button type="submit" className="rounded-r-xl bg-gold px-6 font-serif font-semibold tracking-[0.06em] text-navy-800 uppercase hover:bg-gold-hover">Search</button>
          </form>
          <div className="mt-4">
            <p className={lab}>Ask it like this</p>
            <div className="mt-2 flex flex-wrap gap-2">{EXAMPLE_PROMPTS.map((p) => <button key={p.q} type="button" className={chip} onClick={() => run(p.q)}>“{p.label}” <ArrowRight className="ml-1.5 size-3.5" /></button>)}</div>
          </div>
          {q ? <Results q={q} onPick={run} /> : (
            <>
              <div className="mt-6">
                <p className={lab}>Try these</p>
                <div className="mt-2 flex flex-wrap gap-2">{TRY_CHIPS.map((c) => <button key={c} type="button" className={chip} onClick={() => run(c)}>{c}</button>)}</div>
              </div>
              <div className="mt-8"><Walkthrough /></div>
              <p className="mt-6 text-sm text-on-dark-muted">Prefer to browse? <a className="text-gold underline" href="/mockups/voter-guide">Start from an issue</a> or <a className="text-gold underline" href="/mockups/meetings">pick a meeting and see every vote</a>.</p>
            </>
          )}
        </div>
      </V4Main>
    </SiteShell>
  );
}
