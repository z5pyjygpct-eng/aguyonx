// Party-level comparison of Republicans and Democrats in the General Assembly.
// Pure aggregation over data already in the repo (src/lib/ga-members-2026-*.json = LIS 2026 sessions,
// src/content/virginia-2027-bills.json = LIS 2027 tracker). Same method for every member; nothing is hardcoded per person.
// No member-level output leaves this module: every number is a party total or a party distribution.
import type { GaBill, GaMember } from "@/components/site/ga-member-profile";
import { isHonorResolution } from "@/lib/ga-member-stats";
import type { Ledger } from "@/lib/virginia-2027-bills";

export type Party = "R" | "D";
export type Chamber = "house" | "senate";
export const PARTIES: Party[] = ["R", "D"];
export const CHAMBERS: Chamber[] = ["house", "senate"];

/** Bill-based tallies. `mode` all = every measure the member is chief patron of; legis = honor resolutions removed. */
export type OutcomeTally = { total: number; signed: number; vetoed: number; passed: number; failed: number; tabled: number };
export type CategoryTally = { n: number; signed: number; passed: number; failed: number; tabled: number };
export type BillMode = "all" | "legis";
export type BillAgg = { tally: OutcomeTally; categorized: number; official: number; uncategorized: number; categories: Record<string, CategoryTally> };

/** Per-bill categories from tools/ga-members/party-categories.py: [labels, "o" = official LIS subject | "a" = aguyonx title rules]. */
export type CategoryFile = { generated: string; bills: Record<string, [string[], "o" | "a"]> };
/** Party tallies on final-passage / third-reading roll calls only, from scripts/build-ga-passage-votes.mjs. */
export type PassageChamber = {
  rollCallsWithMembers: number; rollCallsCounted: number; byKind: { passage: number; defeat: number; thirdReading: number; adoption: number };
  party: Record<Party, { Y: number; N: number; A: number; X: number; withMajority: number; yeaNay: number }>;
  unmatchedMemberVotes: number; matchedMemberVotes: number; unmatchedMembers: number;
  agreement: { unanimous: number; sameSide: number; opposite: number; noMajority: number };
};
export type PassageFile = { generated: string; chambers: Record<Chamber, PassageChamber> };

export type VoteAgg = { total: number; yea: number; nay: number; abstain: number; notVoting: number; withParty: number; againstParty: number };

export type PartyChamberAgg = {
  members: number;
  coPatron: number;
  bills: Record<BillMode, BillAgg>;
  votes: VoteAgg;
  /** Members counted in the party-unity histogram, and how many fall in each 2-point bucket (lowest bucket is "under 80%"; see UNITY_BUCKETS). */
  unityHist: number[];
  unityMembers: number;
  partialTermMembers: number;
};

export type KeyVoteRow = { action: string; date: string; session: string; href: string; tallies: Record<Party, { Y: number; N: number; A: number; X: number }>; passedTally: string | null };

export type Tracker = {
  capturedAt: string;
  sessionLabel: string;
  total: number;
  /** [filing class][chamber][party or "?"] */
  byParty: Record<"new" | "continued", Record<Chamber, Record<Party | "?", number>>>;
  newCategories: { id: string; label: string; R: number; D: number; unmatched: number; total: number }[];
  newTotal: number;
};

export type PartyCompare = {
  generated: string;
  sources: string[];
  floorRollCalls: Record<Chamber, number>;
  data: Record<Chamber, Record<Party, PartyChamberAgg>>;
  keyVotes: Record<Chamber, KeyVoteRow[]>;
  tracker: Tracker;
  passage: PassageFile;
  excludedHonor: Record<Chamber, Record<Party, number>>;
};

export const HONOR_CATEGORIES = new Set(["Memorial resolutions", "Commendations", "Commemorations"]);
/** 2-point buckets: "under 80", 80–81.9, 82–83.9, ... 98–100. */
export const UNITY_BUCKETS = ["<80", ...Array.from({ length: 10 }, (_, i) => (i === 9 ? "98–100" : `${80 + 2 * i}–${81 + 2 * i}`))];
const bucketOf = (pct: number) => (pct < 80 ? 0 : Math.min(Math.floor((pct - 80) / 2), 9) + 1);

const HONOR_TITLE = /^(Celebrating the life of|Commending)\b/i;
/** Honor resolution = LIS-title or category match, whatever its outcome (so tabled or failed commendations are removed too). */
export const isHonor = (b: GaBill, cats: string[] = []) => isHonorResolution(b) || HONOR_TITLE.test(b.title) || cats.some((c) => HONOR_CATEGORIES.has(c));

const emptyTally = (): OutcomeTally => ({ total: 0, signed: 0, vetoed: 0, passed: 0, failed: 0, tabled: 0 });
const emptyBillAgg = (): BillAgg => ({ tally: emptyTally(), categorized: 0, official: 0, uncategorized: 0, categories: {} });

function addBill(a: BillAgg, b: GaBill, entry: [string[], "o" | "a"] | undefined) {
  const t = a.tally;
  t.total++;
  t[b.outcome]++;
  const cats = entry?.[0] ?? [];
  if (!cats.length) { a.uncategorized++; return; }
  a.categorized++;
  if (entry?.[1] === "o") a.official++;
  for (const c of cats) {
    const e = (a.categories[c] ??= { n: 0, signed: 0, passed: 0, failed: 0, tabled: 0 });
    e.n++;
    if (b.outcome === "signed") e.signed++;
    if (b.outcome === "signed" || b.outcome === "vetoed" || b.outcome === "passed") e.passed++;
    else if (b.outcome === "failed") e.failed++;
    else if (b.outcome === "tabled") e.tabled++;
  }
}

const VOTE_RE = /\((\d+)-Y (\d+)-N (\d+)-A\)/;

export function buildPartyCompare(
  files: Record<Chamber, { generated: string; sources: string[]; floorRollCalls: number; members: GaMember[] }>,
  ledger: Ledger,
  catFile: CategoryFile,
  passage: PassageFile,
): PartyCompare {
  const data = {} as PartyCompare["data"];
  const keyVotes = { house: [], senate: [] } as PartyCompare["keyVotes"];
  const floorRollCalls = { house: files.house.floorRollCalls, senate: files.senate.floorRollCalls };
  const excludedHonor = { house: { R: 0, D: 0 }, senate: { R: 0, D: 0 } } as PartyCompare["excludedHonor"];

  for (const ch of CHAMBERS) {
    data[ch] = {} as Record<Party, PartyChamberAgg>;
    for (const p of PARTIES) {
      data[ch][p] = {
        members: 0, coPatron: 0, bills: { all: emptyBillAgg(), legis: emptyBillAgg() },
        votes: { total: 0, yea: 0, nay: 0, abstain: 0, notVoting: 0, withParty: 0, againstParty: 0 },
        unityHist: UNITY_BUCKETS.map(() => 0), unityMembers: 0, partialTermMembers: 0,
      };
    }
    // Per-roll-call party tallies come from every member's own recentVotes list. Only kept when every member of the chamber has the roll call.
    const byHref = new Map<string, { row: KeyVoteRow; seen: number }>();
    const roster = files[ch].members;
    for (const m of roster) {
      const a = data[ch][m.party];
      a.members++;
      a.coPatron += Object.values(m.coPatronCounts ?? {}).reduce((s, n) => s + n, 0);
      for (const b of m.bills) {
        const entry = catFile.bills[`${b.session}|${b.bill}`];
        addBill(a.bills.all, b, entry);
        if (isHonor(b, entry?.[0])) excludedHonor[ch][m.party]++;
        else addBill(a.bills.legis, b, entry);
      }
      const v = a.votes;
      v.total += m.votes.total; v.yea += m.votes.yea; v.nay += m.votes.nay; v.abstain += m.votes.abstain; v.notVoting += m.votes.notVoting;
      v.withParty += m.votes.withParty; v.againstParty += m.votes.againstParty;
      if (m.votes.total < files[ch].floorRollCalls) a.partialTermMembers++;
      const dn = m.votes.withParty + m.votes.againstParty;
      if (dn > 0) { a.unityHist[bucketOf((100 * m.votes.withParty) / dn)]++; a.unityMembers++; }
      for (const rv of m.recentVotes) for (const b of rv.bills) {
        const e = byHref.get(b.voteHref) ?? {
          row: { action: b.action.replace(/\s+/g, " ").trim(), date: rv.date, session: rv.session, href: b.voteHref, tallies: { R: { Y: 0, N: 0, A: 0, X: 0 }, D: { Y: 0, N: 0, A: 0, X: 0 } }, passedTally: null },
          seen: 0,
        };
        const k = (["Y", "N", "A", "X"].includes(rv.vote) ? rv.vote : "X") as "Y" | "N" | "A" | "X";
        e.row.tallies[m.party][k]++;
        e.seen++;
        byHref.set(b.voteHref, e);
      }
    }
    keyVotes[ch] = [...byHref.values()]
      .filter((e) => e.seen === roster.length)
      .map((e) => ({ ...e.row, passedTally: e.row.action.match(VOTE_RE)?.[0] ?? null }))
      .sort((a, b) => a.href.localeCompare(b.href, undefined, { numeric: true }));
  }

  // 2027 tracker
  const mk = () => ({ R: 0, D: 0, "?": 0 }) as Record<Party | "?", number>;
  const tr: Tracker = {
    capturedAt: ledger.meta.captured_at, sessionLabel: ledger.meta.session_label,
    total: ledger.new_filings.length + ledger.continued.length,
    byParty: { new: { house: mk(), senate: mk() }, continued: { house: mk(), senate: mk() } },
    newCategories: [], newTotal: ledger.new_filings.length,
  };
  const cat = new Map<string, Tracker["newCategories"][number]>();
  for (const [cls, list] of [["new", ledger.new_filings], ["continued", ledger.continued]] as const) {
    for (const b of list) {
      const ch: Chamber = b.chamber === "Senate" ? "senate" : "house";
      const p = b.chief_patron_party_code === "R" || b.chief_patron_party_code === "D" ? b.chief_patron_party_code : "?";
      tr.byParty[cls][ch][p]++;
      if (cls === "new") for (const id of new Set(b.category_ids ?? [])) {
        const label = ledger.taxonomy.find((t) => t.id === id)?.label ?? id;
        const e = cat.get(id) ?? { id, label, R: 0, D: 0, unmatched: 0, total: 0 };
        if (p === "?") e.unmatched++; else e[p]++;
        e.total++;
        cat.set(id, e);
      }
    }
  }
  tr.newCategories = [...cat.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));

  return {
    generated: files.house.generated > files.senate.generated ? files.house.generated : files.senate.generated,
    sources: [...new Set([...files.house.sources, ...files.senate.sources])],
    floorRollCalls, data, keyVotes, tracker: tr, excludedHonor, passage,
  };
}
