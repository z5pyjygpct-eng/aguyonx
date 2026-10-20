/**
 * Voter-onboarding mockups (preview only, /mockups/*). Read-only views over data already in the repo:
 * official decisions in recaps (loudoun-recaps.ts, city-recaps.ts) and LIS roll-call files for the
 * House and Senate (public/files/va-house|va-senate/votes). Nothing here invents a vote, quote or number.
 */
import { LOUDOUN_RECAPS, type RecapDecision, type RecapMoment } from "@/content/loudoun-recaps";
import { CITY_RECAPS } from "@/content/city-recaps";
import { CITY_VENUES } from "@/content/cities";
import { HOUSE_RECAPS } from "@/content/va-house";
import { SENATE_RECAPS } from "@/content/va-senate";
import { VBOE_MEETINGS } from "@/content/va-boe";
import { searchSite, type SearchHit } from "@/lib/search";

export type VenueKey =
  | "loudoun-bos" | "loudoun-lcps" | "albemarle-bos" | "albemarle-schools" | "fairfax-city-council"
  | "fairfax-city-schools" | "manassas-council" | "manassas-schools" | "va-house" | "va-senate" | "va-boe";

export const VENUE_LABEL: Record<VenueKey, string> = {
  "loudoun-bos": "Loudoun Board of Supervisors",
  "loudoun-lcps": "Loudoun School Board",
  "albemarle-bos": "Albemarle Board of Supervisors",
  "albemarle-schools": "Albemarle School Board",
  "fairfax-city-council": "City of Fairfax City Council",
  "fairfax-city-schools": "City of Fairfax School Board",
  "manassas-council": "Manassas City Council",
  "manassas-schools": "Manassas City School Board",
  "va-house": "Virginia House of Delegates (floor)",
  "va-senate": "Senate of Virginia (floor)",
  "va-boe": "Virginia Board of Education",
};
export const VENUE_FTM: Record<VenueKey, string> = {
  "loudoun-bos": "/dashboards/loudoun/bos/find-the-moment", "loudoun-lcps": "/dashboards/loudoun/schools/find-the-moment",
  "albemarle-bos": "/dashboards/albemarle/bos/find-the-moment", "albemarle-schools": "/dashboards/albemarle/schools/find-the-moment",
  "fairfax-city-council": "/dashboards/fairfax-city/council/find-the-moment", "fairfax-city-schools": "/dashboards/fairfax-city/schools/find-the-moment",
  "manassas-council": "/dashboards/manassas/council/find-the-moment", "manassas-schools": "/dashboards/manassas/schools/find-the-moment",
  "va-house": "/dashboards/house/find-the-moment", "va-senate": "/dashboards/senate/find-the-moment", "va-boe": "/dashboards/board-of-education/find-the-moment",
};
export const VENUE_MEMBERS: Partial<Record<VenueKey, string>> = {
  "loudoun-bos": "/dashboards/loudoun/bos/members", "loudoun-lcps": "/dashboards/loudoun/schools/members",
  "albemarle-bos": "/dashboards/albemarle/bos/members", "albemarle-schools": "/dashboards/albemarle/schools/members",
  "fairfax-city-council": "/dashboards/fairfax-city/council/members", "fairfax-city-schools": "/dashboards/fairfax-city/schools/members",
  "manassas-council": "/dashboards/manassas/council/members", "manassas-schools": "/dashboards/manassas/schools/members",
  "va-house": "/dashboards/house/members", "va-senate": "/dashboards/senate/members",
};

/** One meeting with its official decisions. GA rows load their roll calls from votesUrl on demand. */
export type MeetingRow = {
  venue: VenueKey;
  slug: string;
  href: string;
  dateLabel: string;
  title: string;
  decisions: RecapDecision[];
  moments: RecapMoment[];
  votesPosted: boolean;
  noVotesRecorded: boolean;
  note: string;
  votesUrl?: string | null;
  rollCallCount?: number;
};

const local: MeetingRow[] = [
  ...LOUDOUN_RECAPS.map((r) => ({
    venue: (r.venue ?? "loudoun-bos") as VenueKey, slug: r.slug, href: `/counties/loudoun/recaps/${r.slug}`,
    dateLabel: r.dateLabel, title: r.title, decisions: r.decisions, moments: r.moments,
    votesPosted: r.decisions.length > 0, noVotesRecorded: false, note: r.official.note,
  })),
  ...CITY_RECAPS.map((r) => ({
    venue: r.venue as VenueKey, slug: r.slug, href: `/cities/${CITY_VENUES[r.venue].city}/recaps/${r.slug}`,
    dateLabel: r.dateLabel, title: r.title, decisions: r.decisions, moments: r.moments,
    votesPosted: r.decisions.length > 0, noVotesRecorded: !!r.noVotesRecorded, note: r.official.note,
  })),
];
const ga: MeetingRow[] = [
  ...HOUSE_RECAPS.map((r) => ({ venue: "va-house" as VenueKey, slug: r.slug, href: `/general-assembly/house/recaps/${r.slug}`, dateLabel: r.dateLabel, title: `House floor session${r.sessions.length ? ` · ${r.sessions.join(" · ")}` : ""}`, decisions: [], moments: [], votesPosted: !!r.votesUrl, noVotesRecorded: !r.votesUrl, note: "Roll calls from the Legislative Information System (LIS) public vote files.", votesUrl: r.votesUrl, rollCallCount: r.rollCallCount })),
  ...SENATE_RECAPS.map((r) => ({ venue: "va-senate" as VenueKey, slug: r.slug, href: `/general-assembly/senate/recaps/${r.slug}`, dateLabel: r.dateLabel, title: `Senate floor session${r.sessions.length ? ` · ${r.sessions.join(" · ")}` : ""}`, decisions: [], moments: [], votesPosted: !!r.votesUrl, noVotesRecorded: !r.votesUrl, note: "Roll calls from the Legislative Information System (LIS) public vote files.", votesUrl: r.votesUrl, rollCallCount: r.rollCallCount })),
];
export const MEETINGS: MeetingRow[] = [...local, ...ga];

export type Coverage = { venue: VenueKey; meetings: number; withVotes: number; items: number; noVotes: number };
export function coverage(): Coverage[] {
  const keys = Object.keys(VENUE_LABEL) as VenueKey[];
  return keys.map((venue) => {
    if (venue === "va-boe") return { venue, meetings: VBOE_MEETINGS.length, withVotes: 0, items: 0, noVotes: 0 };
    const rows = MEETINGS.filter((m) => m.venue === venue);
    return {
      venue,
      meetings: rows.length,
      withVotes: rows.filter((m) => m.votesPosted).length,
      items: rows.reduce((a, m) => a + (m.rollCallCount ?? m.decisions.length), 0),
      noVotes: rows.filter((m) => m.noVotesRecorded && !m.votesPosted).length,
    };
  });
}

export type RollCall = { voteId: string; tally?: string | null; bills: { bill: string; title: string; action: string; href: string; voteHref: string }[] };
export async function loadRollCalls(url: string): Promise<RollCall[]> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(String(r.status));
  const d = (await r.json()) as { rollCalls: RollCall[] };
  return d.rollCalls;
}

/* ---------- Issues ---------- */
export type Issue = { id: string; label: string; plain: string; re: RegExp; searchTerms: string[]; ftmQuery: string };
export const ISSUES: Issue[] = [
  { id: "taxes", label: "Taxes and the budget", plain: "What your local boards decided about tax rates, budgets and spending.", re: /\b(tax(es)?|budget|appropriat\w*|levy|fiscal|real estate rate)\b/i, searchTerms: ["taxes", "budget"], ftmQuery: "budget" },
  { id: "data-centers", label: "Data centers", plain: "Votes and meeting moments about data centers, power lines and zoning for them.", re: /\b(data ?cent(er|re)s?|transmission line|substation)\b/i, searchTerms: ["data centers"], ftmQuery: "data centers" },
  { id: "schools", label: "Schools", plain: "School budgets, policies and other school decisions, on school boards and county boards.", re: /\b(school|schools|student|students|teacher|teachers|curriculum|LCPS|ACPS)\b/i, searchTerms: ["schools"], ftmQuery: "schools" },
  { id: "safety", label: "Public safety", plain: "Police, sheriff, fire and rescue, emergency services and school safety.", re: /\b(police|sheriff\w*|fire|rescue|public safety|safety|emergency|crime|SRO|law enforcement)\b/i, searchTerms: ["safety", "police"], ftmQuery: "public safety" },
];
export type IssueVote = { row: MeetingRow; d: RecapDecision };
export type IssueMoment = { row: MeetingRow; m: RecapMoment };
export function issueVotes(issue: Issue): IssueVote[] {
  const out: IssueVote[] = [];
  for (const row of local) for (const d of row.decisions) if (issue.re.test(d.action)) out.push({ row, d });
  return out;
}
export function issueMoments(issue: Issue): IssueMoment[] {
  const out: IssueMoment[] = [];
  for (const row of local) for (const m of row.moments) if (issue.re.test(m.label)) out.push({ row, m });
  return out;
}
export function issueStories(issue: Issue): SearchHit[] {
  const seen = new Set<string>();
  const out: SearchHit[] = [];
  for (const t of issue.searchTerms) for (const h of searchSite(t)) {
    if ((h.shelf === "Investigation" || h.shelf === "Article") && !seen.has(h.id)) { seen.add(h.id); out.push(h); }
  }
  return out;
}

/* ---------- Search onboarding ---------- */
export type Prompt = { q: string; label: string; guide?: "supervisor" };
export const EXAMPLE_PROMPTS: Prompt[] = [
  { q: "taxes", label: "taxes" },
  { q: "data centers", label: "data centers" },
  { q: "school safety", label: "school safety" },
  { q: "what did my supervisor vote on", label: "what did my supervisor vote on", guide: "supervisor" },
];
export const TRY_CHIPS = ["budget", "data centers", "school board", "police", "zoning", "teachers", "housing", "energy", "2027 candidates", "FOIA"];

/** Plain-language neighbors. Shown only when the neighbor itself returns results. */
const RELATED: Record<string, string[]> = {
  committee: ["school board", "board of supervisors", "budget", "policy"],
  ghana: ["immigration", "international", "refugees"],
  taxes: ["budget", "real estate", "tax rate"],
  tax: ["budget", "real estate"],
  safety: ["police", "sheriff", "school safety"],
  school: ["school board", "teachers", "LCPS"],
  vote: ["recaps", "school board", "supervisors"],
  supervisor: ["board of supervisors", "Loudoun"],
};
const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").trim();
export function relatedTerms(q: string): { term: string; n: number }[] {
  const words = fold(q).split(/\s+/).filter(Boolean);
  const cands = new Set<string>();
  for (const w of [fold(q), ...words]) for (const r of RELATED[w] ?? RELATED[w.replace(/s$/, "")] ?? []) cands.add(r);
  if (!cands.size) for (const r of ["budget", "data centers", "school board", "police"]) cands.add(r);
  return [...cands].map((term) => ({ term, n: searchSite(term).length })).filter((x) => x.n > 0);
}

/** Meetings whose title or official decisions contain every word of q. Not in today's site search index. */
export function meetingMatches(q: string, cap = 8): { row: MeetingRow; why: string }[] {
  const words = fold(q).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  const has = (s: string) => { const f = fold(s); return words.every((w) => new RegExp(`\\b${w.replace(/[^a-z0-9]/g, "")}`).test(f)); };
  const out: { row: MeetingRow; why: string }[] = [];
  for (const row of MEETINGS) {
    if (has(row.title)) out.push({ row, why: "Meeting title" });
    else { const d = row.decisions.find((x) => has(x.action)); if (d) out.push({ row, why: `Vote: ${d.action.slice(0, 110)}${d.action.length > 110 ? "…" : ""}` }); }
  }
  return out.slice(0, cap).concat([]).map((x) => x) as { row: MeetingRow; why: string }[];
}
export function meetingMatchCount(q: string): number {
  return meetingMatches(q, 100000).length;
}
