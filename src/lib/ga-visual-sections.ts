/** Types for the three Visual Data add-on sections. Built by tools/ga-members/visual-sections.py. */

export type Party = "R" | "D";
export type Chamber = "house" | "senate";

export type RankMember = {
  slug: string;
  name: string;
  lisId: string;
  district: number;
  party: Party;
  href: string;
  Y: number; N: number; A: number; X: number;
  withChamber: number; chamberN: number;
  withPartySplit: number; splitN: number;
  listed: number;
  partialTerm: boolean;
};

export type RanksFile = {
  generated: string;
  rule: string;
  sources: string[];
  lean: { available: false; reason: string; sought: string[] };
  chambers: Record<Chamber, {
    rollCallsCounted: number;
    partySplitRollCalls: number;
    floorRollCalls: number;
    unmatchedNameSlots: number;
    members: RankMember[];
  }>;
};

export type CommitteeBill = {
  session: string;
  sessionLabel: string;
  bill: string;
  title: string;
  href: string;
  honor: boolean;
  chiefName: string;
  chiefParty: Party | null;
  rPatrons: number;
  dPatrons: number;
  unmatchedPatrons: number;
  kind: string;
  kindLabel: string;
  committee: string;
  committeeChamber: Chamber | null;
  date: string;
  action: string;
  carriedOver: boolean;
};

export type CommitteeCounts = { total: number; legis: number; honor: number };
export type CommitteeFile = {
  generated: string;
  sources: string[];
  definition: string;
  bySession: ({ session: string; label: string } & CommitteeCounts)[];
  byCommittee: ({ chamber: string; committee: string } & CommitteeCounts)[];
  byKind: ({ kind: string; label: string } & CommitteeCounts)[];
  bills: CommitteeBill[];
};

export type DemoDistrict = {
  medianIncome: number | null;
  medianIncomeMoe: number | null;
  medianIncomeTopcoded: boolean;
  pop25: number | null;
  pop25Moe: number | null;
  bachelors: number | null;
  bachelorsShare: number | null;
  bachelorsShareMoe: number | null;
  geoId: string;
};

export type DemoFile = {
  generated: string;
  survey: string;
  geography: string;
  geographyNote: string;
  urban: { available: false; reason: string };
  sources: string[];
  tables: { income: string; education: string };
  house: Record<string, DemoDistrict>;
  senate: Record<string, DemoDistrict>;
  missing: string[];
};

export const MIN_CHAMBER = 50;
export const MIN_SPLIT = 30;

export const rate = (n: number, d: number) => (d > 0 ? (100 * n) / d : null);
export const rateLabel = (n: number, d: number, dp = 1) => (d > 0 ? `${((100 * n) / d).toFixed(dp)}%` : "—");
export const money = (n: number | null, top?: boolean) => {
  if (n == null) return "—";
  if (top || n >= 250000) return "$250,000+";
  return `$${n.toLocaleString("en-US")}`;
};
export const shareLabel = (p: number | null) => (p == null ? "—" : `${(100 * p).toFixed(1)}%`);
export const chamberLabel = (ch: Chamber) => (ch === "house" ? "House" : "Senate");
export const seatLabel = (ch: Chamber, d: number) => `${ch === "house" ? "HD" : "SD"} ${d}`;
