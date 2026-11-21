/**
 * News about the 2027 Virginia elections (General Assembly, boards of supervisors, school boards,
 * constitutional officers, and the primaries and polling changes for those races).
 * Source: the site's existing news shelf (src/content/news.ts), the same items the dashboard News boxes use.
 * Never invent stories: this only picks from NEWS.
 *
 * An item counts when its id is on the reviewed list below (read by hand: the story is about a 2027 race,
 * its candidates, or how the 2027 vote will run), or when a newly ingested headline names 2027 together
 * with an election word. Anything else is left out.
 */
import { NEWS, type NewsItem } from "@/content/news";

export const ELECTION_2027_REVIEWED = new Set<string>([
  "randall-announces-bid-for-fourth-term-as-loudoun-c-blueridgeleader-2026-11-19",
  "former-mckay-staffer-seeks-to-oust-fairfax-cou-ffxnow-2026-11-18",
  "democrats-hope-to-make-big-gains-in-the-general-as-cardinal-2026-11-18",
  "aps-students-will-have-off-if-arlington-holds-arlnow-2026-11-17",
  "randall-launches-reelection-campaign-for-count-loudounnow-2026-11-17",
  "randall-officially-launches-reelection-campaig-ltm-2026-11-17",
  "from-protecting-her-home-to-seeking-a-seat-at-blueridgeld-2026-11-17",
  "ex-cia-officer-seeks-democratic-nod-for-sully-dist-ffxnow-2026-11-16",
  "ross-snare-announces-bid-for-brentsville-district--potomaclocal-2026-11-16",
  "hu-announces-run-for-sterling-district-supervisor-loudounnow-2026-11-16",
  "virginia-democrats-2026-roadmap-2027-majorities-wvtf-2026-11-15",
  "willett-announces-2027-reelection-henrico-citizen-2026-11-12",
  "vanvalkenburg-reelection-affordability-dogwood-2026-11-10",
  "briskman-turns-up-heat-loudoun-chair-loudounnow-2026-11-10",
  "sizemore-heizer-announces-reelection-patch-2026-11-10",
  "briskman-criticizes-by-right-data-center-broadlands-loudountimes-2026-11-10",
  "pope-adams-seeks-reelection-82nd-district-aol-2026-11-04",
  "fairfax-county-proposes-new-ffxnow-2026-11-04",
  "doge-victim-launches-campaign-for-annandaletoday-2026-10-26",
  "aps-students-could-lose-a-day-arlnow-2026-10-23",
  "glen-pine-challenges-mcpike-hd5-alxnow-2026-10-20",
  "descano-dunn-pirio-primary-fox-2026-09-24",
  "descano-dunn-pirio-primary-ffxnow-2026-09-23",
  "data-center-backlash-midterms-axios-2026-09-09",
  "umstattd-loudoun-no-reelection-2026-08-31",
  "briskman-loudoun-chair-2026-08-25",
  "zargarpur-coles-supervisor-2027-insidenova-2026-06-09",
  "ruzic-loudoun-ca-2026-05-06",
]);

const YEAR = /\b2027\b/;
const ELECTION_WORD = /\b(elections?|re-?election|campaigns?|primary|primaries|ballots?|candidates?|majorit(?:y|ies)|nominations?|bid)\b/i;

export function isElection2027News(n: Pick<NewsItem, "id" | "headline">): boolean {
  return ELECTION_2027_REVIEWED.has(n.id) || (YEAR.test(n.headline) && ELECTION_WORD.test(n.headline));
}

/** Newest first; same sort as the location News boxes. */
export function election2027News(): NewsItem[] {
  return NEWS.filter(isElection2027News).sort((a, b) => b.date.localeCompare(a.date));
}
