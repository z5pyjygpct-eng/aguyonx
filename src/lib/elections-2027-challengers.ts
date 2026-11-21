/**
 * Incumbent Challengers and Candidate Challenger Gaps for the 2027 House of Delegates and State Senate pages.
 * Pure functions over the official data files (src/lib/elections-2027-{house,senate}.json): incumbents come from the
 * official member roster on each race, "challengers" are the counted 2027 campaign committee registrations (stricter rule:
 * 2027 cycle, residence inside the seat, 2027 activity). Registrations are not ballot listings. Nothing is inferred:
 * a seat whose roster member or party is missing is reported as unclear and left out of both parties' lists.
 */
import { isCheck, memberNotFiled, statusOf, type Cand, type Member, type Race, type Status } from "./elections-2027.ts";

export type MajorParty = "D" | "R";
export type IncumbentStatus = "filed" | "not-filed" | "check";
export type ChallengerRow = {
  race: Race;
  district: number;
  seat: string;
  incumbent: Member;
  party: MajorParty;
  status: IncumbentStatus;
  /** Counted committees of the other major party. */
  opposite: Cand[];
  /** Counted committees with another party, or no party listed in the record (independent / third party / not listed). */
  other: Cand[];
  /** Same-party committees other than the incumbent's (a possible primary). Not challengers in these views, shown for completeness. */
  same: Cand[];
};
export type UnclearSeat = { seat: string; district: number; reason: string };

const membersOf = (r: Race): Member[] => r.current_members ?? (r.current_member ? [r.current_member] : []);
const isMajor = (p: string | null | undefined): p is MajorParty => p === "D" || p === "R";

/** The seat's incumbent, if the official roster names exactly one member with a D or R party. */
export function incumbentOf(r: Race): { member: Member; party: MajorParty } | null {
  const ms = membersOf(r);
  if (ms.length !== 1 || !isMajor(ms[0].party)) return null;
  return { member: ms[0], party: ms[0].party };
}

export function incumbentStatus(r: Race): IncumbentStatus {
  if (isCheck(r)) return "check";
  if (memberNotFiled(r) || !r.candidates.some((c) => c.incumbent)) return "not-filed";
  return "filed";
}

export function toRow(r: Race): ChallengerRow | null {
  const inc = incumbentOf(r);
  if (!inc) return null;
  const opp: MajorParty = inc.party === "D" ? "R" : "D";
  const others = r.candidates.filter((c) => !c.incumbent);
  return {
    race: r,
    district: r.district ?? 0,
    seat: r.seat,
    incumbent: inc.member,
    party: inc.party,
    status: incumbentStatus(r),
    opposite: others.filter((c) => c.party === opp),
    other: others.filter((c) => !isMajor(c.party)),
    same: others.filter((c) => c.party === inc.party),
  };
}

/** One row per district whose incumbent is in `party` (filed or not), in district order. */
export function challengerRows(races: Race[], party: MajorParty): ChallengerRow[] {
  return races.map(toRow).filter((x): x is ChallengerRow => !!x && x.party === party).sort((a, b) => a.district - b.district);
}

/** Districts where the `party` incumbent has no counted challenger from the other major party AND none independent / other. */
export function gapRows(races: Race[], party: MajorParty): ChallengerRow[] {
  return challengerRows(races, party).filter((x) => x.opposite.length === 0 && x.other.length === 0);
}

/** Seats left out of both lists because the official roster gives no single D or R member. */
export function unclearSeats(races: Race[]): UnclearSeat[] {
  const out: UnclearSeat[] = [];
  for (const r of races) {
    if (incumbentOf(r)) continue;
    const ms = membersOf(r);
    const reason = !ms.length ? "No member on the official member list (vacant on the roster)"
      : ms.length > 1 ? "More than one member listed for this seat"
      : `Party not shown for ${ms[0].name} on the official member list`;
    out.push({ seat: r.seat, district: r.district ?? 0, reason });
  }
  return out.sort((a, b) => a.district - b.district);
}

export type ViewKind = "challengers" | "gaps";
export type ChamberView = { id: string; group: string; label: string; kind: ViewKind; party: MajorParty };
export type ViewGroup = { id: string; title: string };

/** Button registry. Add a group and its views here (e.g. Campaign Finance) and the page renders them. Labels are Scott's. */
export const VIEW_GROUPS: ViewGroup[] = [
  { id: "challengers", title: "INCUMBENT CHALLENGERS" },
  { id: "gaps", title: "CANDIDATE CHALLENGER GAPS (no candidate)" },
];
export const CHAMBER_VIEWS: ChamberView[] = [
  { id: "r-challengers", group: "challengers", label: "Republican Incumbent Challengers", kind: "challengers", party: "R" },
  { id: "d-challengers", group: "challengers", label: "Democrat Incumbent Challengers", kind: "challengers", party: "D" },
  { id: "r-gaps", group: "gaps", label: "Republican Challenger Gaps", kind: "gaps", party: "R" },
  { id: "d-gaps", group: "gaps", label: "Democrat Challenger Gaps", kind: "gaps", party: "D" },
];
export const VIEW_BY_ID = new Map(CHAMBER_VIEWS.map((v) => [v.id, v]));

export function rowsForView(races: Race[], v: ChamberView): ChallengerRow[] {
  return v.kind === "gaps" ? gapRows(races, v.party) : challengerRows(races, v.party);
}

/**
 * Scott's rule (Nov 20, 2026): "It is safely assumed that incumbents will be the candidate running for either party... that is the
 * general rule whether or not you see an official filing." An incumbent with no counted 2027 committee is presumed to run, so the
 * seat is colored as if the incumbent's party were in the race. Display only: no committee is added to any list.
 */
export const PRESUMED_NOTE = "Incumbents are presumed to run for their seat unless officially reported otherwise, whether or not they have a 2027 filing yet.";
export const NO_FILING_TAG = "No 2027 filing yet";

export function presumedStatus(r: Race): Status {
  const inc = incumbentOf(r);
  if (!inc || r.candidates.some((c) => c.incumbent)) return statusOf(r, "house");
  const virtual: Cand = { name: inc.member.name, party: inc.party, incumbent: true, party_source_url: null, filing_source_url: "" };
  return statusOf({ ...r, candidates: [...r.candidates, virtual] }, "house");
}
/** True when the incumbent is presumed to run but has no counted 2027 committee (shown as a muted "No 2027 filing yet" tag). */
export const presumedNoFiling = (r: Race) => !!incumbentOf(r) && !r.candidates.some((c) => c.incumbent);
