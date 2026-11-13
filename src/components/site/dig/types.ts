// Shapes of the static files under public/files/dig/ (built by tools/dig/build.py from data already on aguyonx.com).
export type Subject = { id: string; kind: "leg" | "board" | "place"; label: string; sub: string; party?: string };
export type SubjectIndex = { generated: string; subjects: Subject[] };

export type RollCall = { d: string; s: string; k: string; b: string[]; nb: number; t: string; h: string; c: string[]; ty: string | null };
export type RollCallFile = { chamber: "house" | "senate"; source: string; rule: string; rollCalls: RollCall[] };

export type LegBill = { s: string; b: string; t: string; o: "signed" | "vetoed" | "passed" | "failed" | "tabled"; st: string; sd: string; c: string[]; cs: "o" | "a" | ""; h: string };
export type LegBill27 = { b: string; t: string; cls: "new" | "continued"; st: string | null; c: string[]; h: string };
export type NewsRow = { d: string; h: string; o: string; u: string };
export type Money = {
  committees: [string, string][];
  /** [name, isIndividual 1|0, city, state] */
  donors: [string, number, string, string][];
  /** [donor index, year, amount, gift count, latest report id] */
  cells: [number, string, number, number, number][];
  reports: number;
  months: [string, string];
  /** Itemized expenditures (Schedule D) in /files/dig/money/{slug}.json */
  spendN?: number;
};
/** [payee, purpose, amount, ISO date, report id] */
export type SpendFile = { spend: [string, string, number, string, number][] };
export type Leg = {
  id: string; slug: string; name: string; chamber: "house" | "senate"; party: string; district: number; lisId: string; committees: string[];
  profile: string; lis: string; floorRollCalls: number; asOf: string;
  voteSummary: { total: number; yea: number; nay: number; abstain: number; notVoting: number; withParty: number; againstParty: number };
  billCounts: Record<string, { total: number }>;
  bills: LegBill[]; bills2027: LegBill27[]; votes: string; money: Money | null; news: NewsRow[];
  transcripts: { floor: number; ftm: string; recaps: string; q: string };
};
export type BoardMeeting = { id: string; d: string | null; t: string; k?: string | null; tx: boolean; v: string; r: string | null };
export type BoardDecision = { i?: string; a: string; ty?: string; h: string; l: string };
export type BoardRecap = { slug: string; d: string | null; t: string; tp: string[]; posted: boolean; src: string | null; dec: BoardDecision[] };
export type Board = {
  id: string; label: string; official: string; roster: { name: string; party?: string; district: string; role: string }[];
  meetings: BoardMeeting[]; recaps: BoardRecap[]; topics: [string, string][];
  links: { ftm: string; recaps: string; members: string; news: string };
};
export type Place = {
  id: string; label: string; boards: string[]; delegation: { slug: string; name: string; chamber: "house" | "senate"; district: number; party: string }[];
  delegationSource: string; news: NewsRow[]; newsUrl: string;
};
export type Filters = { year?: string; cat?: string; topic?: string };
export type MoneyQ = { q: string; onQ: (v: string) => void };
