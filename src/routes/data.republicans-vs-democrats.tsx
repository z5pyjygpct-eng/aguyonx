import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { V4Main } from "@/components/site/lcps-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import {
  CategoryChart, FaceOff, KeyVotes, METRICS, OutcomeDonuts, PassageAgreement, P_COLOR, PartyKey, Section, SeatDots, Segmented, TrackerPanel, UnityHistogram, pooled, type ChamberSel,
} from "@/components/site/party-compare-charts";
import type { GaMember } from "@/components/site/ga-member-profile";
import { dateLabel } from "@/lib/ga-member-stats";
import { buildPartyCompare, type BillMode, type CategoryFile, type PartyCompare, type PassageFile } from "@/lib/ga-party-compare";
import type { Ledger } from "@/lib/virginia-2027-bills";

const URL = "https://aguyonx.com/data/republicans-vs-democrats";
const TITLE = "Republicans vs. Democrats in the Virginia General Assembly · A Guy on X";

type GaFile = { generated: string; sources: string[]; floorRollCalls: number; members: GaMember[] };

export const Route = createFileRoute("/data/republicans-vs-democrats")({
  loader: async (): Promise<PartyCompare> => {
    const [h, s, l, cats, pass] = await Promise.all([
      import("@/lib/ga-members-2026-house.json"),
      import("@/lib/ga-members-2026-senate.json"),
      import("@/content/virginia-2027-bills.json"),
      import("@/lib/ga-party-categories.json"),
      import("@/lib/ga-party-passage.json"),
    ]);
    return buildPartyCompare({ house: h.default as unknown as GaFile, senate: s.default as unknown as GaFile }, l.default as unknown as Ledger, cats.default as unknown as CategoryFile, pass.default as unknown as PassageFile);
  },
  head: ({ loaderData }) => {
    const asOf = loaderData ? ` Data as of ${dateLabel(loaderData.generated)}.` : "";
    const description = `Virginia House and Senate Republicans and Democrats side by side: floor voting records, bill outcomes and policy areas from official LIS records (2026 sessions and the 2027 tracker).${asOf}`;
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: "Republicans vs. Democrats: the Virginia General Assembly record" },
        { property: "og:description", content: description },
        { property: "og:url", content: URL },
        { name: "twitter:title", content: "Republicans vs. Democrats: the Virginia General Assembly record" },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: URL }],
    };
  },
  component: Page,
});

const CHAMBER_OPTS = [{ value: "both" as const, label: "Both chambers" }, { value: "house" as const, label: "House" }, { value: "senate" as const, label: "Senate" }];
const MODE_OPTS = [{ value: "legis" as const, label: "Legislation only" }, { value: "all" as const, label: "All incl. honor resolutions" }];

function Page() {
  const c = Route.useLoaderData();
  const [sel, setSel] = useState<ChamberSel>("both");
  const [mode, setMode] = useState<BillMode>("legis");
  const R = pooled(c, "both", "R", "all"), D = pooled(c, "both", "D", "all");
  const sx = pooled(c, sel, "R", mode), sd = pooled(c, sel, "D", mode);
  const asOf = dateLabel(c.generated);
  const trAsOf = new Date(c.tracker.capturedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" });
  const partial = R.partial + D.partial;
  const ps = (["house", "senate"] as const).map((k) => c.passage.chambers[k]);
  const pm = ps.reduce((n, x) => n + x.unmatchedMemberVotes, 0), pmAll = ps.reduce((n, x) => n + x.unmatchedMemberVotes + x.matchedMemberVotes, 0), pmN = ps.reduce((n, x) => n + x.unmatchedMembers, 0);
  const pmPct = `${((100 * pm) / pmAll).toFixed(1)}% of member votes`;
  const unmatched = (["new", "continued"] as const).reduce((n, k) => n + c.tracker.byParty[k].house["?"] + c.tracker.byParty[k].senate["?"], 0);
  const lisAsOf = `Source: Legislative Information System (LIS), 2026 Regular and Special I sessions. As of ${asOf}.`;

  return (
    <SiteShell>
      <V4Main>
        <section className="relative overflow-hidden bg-gradient-to-r from-navy-900 from-40% to-navy-700">
          <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
          <div className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
            <Breadcrumbs items={[{ label: "Other Resources", to: "/library" }, { label: "Data" }, { label: "Republicans vs. Democrats" }]} />
          </div>
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-6 pb-12 sm:px-8 lg:grid-cols-[1.15fr_1fr]">
            <div className="min-w-0">
              <p className="font-serif text-sm font-semibold tracking-[0.18em] text-gold uppercase">Data · Virginia General Assembly</p>
              <h1 className="mt-2 font-serif text-5xl leading-[1.02] font-bold uppercase sm:text-6xl lg:text-7xl">
                <span style={{ color: P_COLOR.R }}>Republicans</span> <span className="text-night-muted">vs.</span> <span style={{ color: P_COLOR.D }}>Democrats</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#F6F3EA]">
                The House and Senate records of each party, side by side. Voting records, what happened to each party's bills, and the policy areas those bills cover. Every number comes from official LIS records and is computed the same way for both parties.
              </p>
              <dl className="mt-6 grid max-w-xl grid-cols-3 gap-3 text-center">
                {[{ k: "Members", r: R.members, d: D.members }, { k: "Chief-patron measures", r: R.tally.total, d: D.tally.total }, { k: "Roll-call records", r: R.votes.total, d: D.votes.total }].map((x) => (
                  <div key={x.k} className="rounded-lg border border-navy-line bg-navy-900/70 px-2 py-3">
                    <dt className="text-[11px] leading-tight font-bold tracking-wide text-night-muted uppercase">{x.k}</dt>
                    <dd className="mt-1 font-serif text-lg leading-tight font-bold tabular-nums sm:text-xl"><span className="block" style={{ color: P_COLOR.R }}>{x.r.toLocaleString()}</span><span className="block" style={{ color: P_COLOR.D }}>{x.d.toLocaleString()}</span></dd>
                  </div>
                ))}
              </dl>
              <p className="mt-2 text-xs text-night-muted">Top number <span style={{ color: P_COLOR.R }}>Republicans</span>, bottom number <span style={{ color: P_COLOR.D }}>Democrats</span>; House and Senate combined.</p>
              <p className="mt-4 text-sm text-on-dark-muted">Official source: <a className="font-semibold text-gold underline underline-offset-4" href="https://lis.virginia.gov" target="_blank" rel="noreferrer">LIS (lis.virginia.gov)</a> · Data as of <b className="text-white">{asOf}</b> · 2027 tracker captured {trAsOf}</p>
            </div>
            <SeatDots c={c} />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="z-20 -mx-5 md:sticky md:top-0 border-b border-navy-line/70 bg-navy-800/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
            <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
              <Segmented label="Chamber" value={sel} onChange={setSel} options={CHAMBER_OPTS} />
              <Segmented label="Measures counted" value={mode} onChange={setMode} options={MODE_OPTS} />
              <div className="hidden pb-2 sm:block"><PartyKey /></div>
            </div>
          </div>

          <Section id="face-off" kicker="At a glance" title="The two parties, side by side"
            lead={<>Bars start from the middle and grow outward. Hover, tap or tab to a bar for the exact numbers behind it. Chamber and measure filters above apply to every chart down to the policy areas.</>}
            note={<>{lisAsOf} Honor resolutions (celebrating a life, commending someone) are {mode === "legis" ? <>currently <b>excluded</b>: {sx.honor.toLocaleString()} Republican and {sd.honor.toLocaleString()} Democratic measures left out here</> : <>currently <b>included</b> ({sx.honor.toLocaleString()} Republican and {sd.honor.toLocaleString()} Democratic)</>}. Voting and member rows are not affected by that filter. Yea, Nay and Not voting use only final-passage and third-reading roll calls (rule under Method), so procedural motions, amendments and conference reports are not mixed in.</>}>
            <FaceOff c={c} sel={sel} mode={mode} />
          </Section>

          <Section id="outcomes" kicker="What happened to their bills" title="Outcomes of each party's measures"
            lead="Every measure on which a member is chief patron, grouped by its final LIS status. The same five outcomes are used for both parties." note={lisAsOf}>
            <OutcomeDonuts c={c} sel={sel} mode={mode} />
          </Section>

          <Section id="voting" kicker="Floor voting record" title="How each caucus votes"
            lead="Final-passage and third-reading votes only, so procedural motions are not mixed in: how often the two parties' majorities land on the same side, how closely members stay with their own party's majority, and the most recent roll calls with each party's tally."
            note={<>{lisAsOf} {c.floorRollCalls.house.toLocaleString()} House and {c.floorRollCalls.senate.toLocaleString()} Senate floor roll calls are in the data; {c.passage.chambers.house.rollCallsCounted.toLocaleString()} House and {c.passage.chambers.senate.rollCallsCounted.toLocaleString()} of them are final-passage or third-reading votes. {partial} member{partial === 1 ? " appears" : "s appear"} on fewer roll calls than their chamber total (partial terms); percentages use only the roll calls that list them.</>}>
            <h3 className="mb-3 font-serif text-xl font-bold uppercase">Do the party majorities agree on final passage?</h3>
            <PassageAgreement c={c} sel={sel} />
            <h3 className="mt-10 mb-3 font-serif text-xl font-bold uppercase">Party unity, member by member (no names; all floor roll calls)</h3>
            <UnityHistogram c={c} sel={sel} />
            <h3 className="mt-10 mb-3 font-serif text-xl font-bold uppercase">Most recent roll calls, party tallies</h3>
            <KeyVotes c={c} sel={sel} />
          </Section>

          <Section id="policy" kicker="Policy areas from bills" title="What each party's bills are about"
            lead={<>Policy areas come only from bills the members sponsor. Official LIS subjects exist for very few measures, so the groups below are <b className="text-white">aguyonx categories</b>: editorial labels assigned by fixed keyword rules from each measure's official LIS title and summary (an official LIS subject is used wherever one exists). Measures that no rule clearly fits stay uncategorized. They are not stances, and a bill can carry more than one category. How the rules work is under Method.</>}
            note={<>{lisAsOf} Bills with no clear category are not shown in the bars; the coverage meter at the bottom of the chart gives each party's categorized share. Shares are of a party's categorized bills, so they say what a party's categorized bills are about, not how much it sponsors. “Passed GA” means passed both chambers, including measures later signed.</>}>
            <CategoryChart c={c} sel={sel} mode={mode} />
          </Section>

          <Section id="tracker" kicker="2027 session" title="The 2027 tracker, by party"
            lead={<>How the {c.tracker.total.toLocaleString()} measures in the {c.tracker.sessionLabel} tracker split by the party of the chief patron, and what the {c.tracker.newTotal} new filings are about. This part is not affected by the filters above.</>}
            note={<>Source: LIS 2027 bill files, captured {trAsOf}. Chief-patron party is joined from official chamber rosters; {unmatched} measure{unmatched === 1 ? "" : "s"} had no roster match and {unmatched === 1 ? "is" : "are"} shown as “not matched”. See the full <a className="text-gold underline" href="/virginia-2027-bills">Virginia 2027 bills tracker</a>.</>}>
            <TrackerPanel c={c} />
          </Section>

          <Section id="method" kicker="Method, sources and gaps" title="How these numbers are made">
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl border border-navy-line bg-navy-700 p-5 sm:p-7">
                <h3 className="font-serif text-xl font-bold uppercase">Same method for everyone</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#F6F3EA]">
                  <li>Each party's figures are the sum of its members' own LIS records. No member is weighted, adjusted or singled out, and no individual is named on this page.</li>
                  <li>Bills are counted by chief patron only. Co-patron listings are counted separately.</li>
                  <li>Vote shares use only final-passage and third-reading roll calls (rule below). Party-unity over all roll calls is shown separately and labeled.</li>
                  <li>Percentages always use the party's own total as the denominator, so a party with fewer members is not penalized in rates.</li>
                  <li>Policy areas are <b>aguyonx categories</b> (editorial), derived from official bill titles and summaries. No stance, motive or quote is inferred.</li>
                </ul>
                <h3 className="mt-6 font-serif text-xl font-bold uppercase">Which votes count as “final passage”</h3>
                <p className="mt-3 text-sm leading-relaxed text-[#F6F3EA]">Each floor roll call carries LIS's own action description. A roll call is counted only if <b>every</b> bill in it has a description that starts with one of these, and nothing else is counted:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#F6F3EA]">
                  <li>“Passed House/Senate” or “Read third time and passed House/Senate”, including “with substitute”, “with amendment(s)” and Block Vote versions;</li>
                  <li>“Read third time and defeated by House/Senate”, “Defeated by Senate” or “Failed to pass House” (included so that only successful votes do not tilt the Yea share);</li>
                  <li>Senate “(on 3rd reading)” votes where the reading was dispensed or waived;</li>
                  <li>“Agreed to by House/Senate”, only when every bill in the roll call is a resolution (HJ, HR, SJ, SR).</li>
                </ul>
                <p className="mt-2 text-sm leading-relaxed text-[#F6F3EA]">Left out: first and second readings, amendments, substitutes agreed or rejected, conference reports, concurrence in the Governor's recommendations, reconsiderations, motions, “Passed in enrolled form”, and “Passed by”. {c.passage.chambers.house.rollCallsCounted.toLocaleString()} of {c.passage.chambers.house.rollCallsWithMembers.toLocaleString()} House and {c.passage.chambers.senate.rollCallsCounted.toLocaleString()} of {c.passage.chambers.senate.rollCallsWithMembers.toLocaleString()} Senate roll calls qualify. Member lists match LIS's printed tallies on every roll call checked. The rule is a short script in the repository (<code>scripts/build-ga-passage-votes.mjs</code>) and is the same for both parties.</p>
                <h3 className="mt-6 font-serif text-xl font-bold uppercase">How policy areas are assigned</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#F6F3EA]">
                  <li>1. If LIS published an official subject for a measure, that subject is used (child subjects roll up to their official parent subject).</li>
                  <li>2. Honor resolutions are recognised from the official title (“Celebrating the life of”, “Commending”, “; commending”, “; designating”) and are left out of the legislation-only view.</li>
                  <li>3. Otherwise the same matching the member pages' Bill subjects card uses (official subject vocabulary and fixed phrases in the title and summary), plus keyword rules on the <b>lead phrase of the official LIS title</b> (the words before the first semicolon, which LIS uses to name the subject). A rule needs an explicit topic word, such as “Zoning”, “Medicaid” or “Firearms”.</li>
                  <li>4. If nothing matches, the measure stays <b>uncategorized</b>; it is never guessed. A measure can carry more than one category.</li>
                  <li>Rules are plain regular expressions in <code>tools/ga-members/party-categories.py</code>. Party is never read, so both parties go through identical rules. Categories are editorial aguyonx categories, not official LIS subjects and not stances.</li>
                </ul>
                <h3 className="mt-6 font-serif text-xl font-bold uppercase">Sources</h3>
                <ul className="mt-3 space-y-1 text-sm text-[#F6F3EA]">
                  {c.sources.map((s) => <li key={s}><a className="inline-flex items-center gap-1 break-all text-gold hover:underline" href={s} target="_blank" rel="noreferrer">{s} <ExternalLink className="size-3 shrink-0" aria-hidden /></a></li>)}
                  <li><a className="inline-flex items-center gap-1 break-all text-gold hover:underline" href="https://lis.blob.core.windows.net/lisfiles/20271/BILLS.CSV" target="_blank" rel="noreferrer">https://lis.blob.core.windows.net/lisfiles/20271/BILLS.CSV <ExternalLink className="size-3 shrink-0" aria-hidden /></a></li>
                </ul>
              </div>
              <div className="rounded-xl border border-navy-line bg-navy-700 p-5 sm:p-7">
                <h3 className="font-serif text-xl font-bold uppercase">Known gaps</h3>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#F6F3EA]">
                  <li>House District 20 is vacant and not counted. Counts reflect the roster in the data as of {asOf}.</li>
                  <li>{partial} member{partial === 1 ? "" : "s"} served part of the period and are listed on fewer roll calls; their rates use only the roll calls that list them.</li>
                  <li>The roll-call tally chart itemizes only the 12 most recent roll calls per chamber (the ones held for every member); all final-passage votes are counted in the party totals and the agreement chart.</li>
                  <li>Party for a vote comes from the roster files. {pm} member vote{pm === 1 ? "" : "s"} on final-passage roll calls ({pmPct}) were cast by {pmN} people no longer on the roster, whose party is not in the repo; those votes are left out rather than guessed.</li>
                  <li>Official LIS subjects exist for few measures. In the current view categories cover {sx.categorized.toLocaleString()} of {sx.tally.total.toLocaleString()} Republican and {sd.categorized.toLocaleString()} of {sd.tally.total.toLocaleString()} Democratic measures; the rest stay uncategorized and are left out of the policy bars.</li>
                  <li>The party-unity measure over all floor roll calls cannot separate passage from procedural votes, because LIS descriptions are not in the member summary; the final-passage version above can.</li>
                  <li>Tracker party is joined from rosters; {unmatched} of {c.tracker.total.toLocaleString()} measures have no match. Continued 2027 bills have no topic categories yet.</li>
                  <li>Not on this page, because the repo holds no source for them: committee votes, amendments, floor speeches, and any measure of how a bill's content differs between parties.</li>
                </ul>
                <h3 className="mt-6 font-serif text-xl font-bold uppercase">Metric definitions</h3>
                <dl className="mt-3 space-y-2 text-xs leading-relaxed text-on-dark-muted">
                  {METRICS.map((m) => <div key={m.key}><dt className="inline font-semibold text-white">{m.label}: </dt><dd className="inline">{m.method}</dd></div>)}
                </dl>
              </div>
            </div>
          </Section>
        </div>
      </V4Main>
    </SiteShell>
  );
}
