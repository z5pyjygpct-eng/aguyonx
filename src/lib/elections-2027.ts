/**
 * /2027 election directory helpers: flatten the five official data files into one race list, derive each race's status only from
 * the official filings in the data, filter with combinable pills (OR inside a group, AND across groups), and group by office then
 * locality. Pure functions so they can be tested without the page.
 */
import { calendarDateInZone, daysSinceFiled, parseOfficialFiledDate, type CalendarDate } from "./virginia-2027-bills.ts";

export type Office = "house" | "senate" | "sb" | "bos" | "co";
/** filed_date: the official filing date exactly as the Virginia Department of Elections or county registrar record prints it (M/D/YYYY),
 * with the record's URL. Missing = no official date; such candidates never count toward the date pills. */
export type Cand = {
  name: string; incumbent: boolean; party: string | null; endorsement?: string | null; party_source_url: string | null; filing_source_url: string; filed_date?: string | null; filed_date_source_url?: string | null;
  /** "registration" = a registered 2027 campaign committee in the Department of Elections campaign finance system (not a ballot listing). */
  filing_kind?: "registration" | "ballot"; label?: string; party_label?: string | null; committee_name?: string; committee_code?: string; committee_url?: string;
  statement_url?: string; residence?: string; latest_report_filed?: string | null; office_sought_record?: string; district_record?: string | null;
  other_committees?: { committee_name: string; committee_url: string }[];
  /** Why the committee counts under the 2027 rule (plain words), e.g. "raised $1,200 on 2026 reports", "current officeholder". */
  activity?: string[];
  /** The candidate's own public announcement, not an official filing or ballot status. Kept through data rebuilds by tools/elections-2027/announcements.json. */
  announcement?: CandidateAnnouncement;
};
export type CandidateAnnouncement = { date: string; text: string; source_url: string; source_label: string };
/** The seat's current officeholder has a Virginia Department of Elections record-keeping flag (final report after 2026 money, or "Do Not Use"). */
export type CheckFlag = { label: string; member: string; note: string; committee_url: string };
export type Member = {
  name: string; party: string | null; slug?: string | null; source_url: string; party_source_url?: string | null;
  /** Party as the official record prints it ("Independent"), the election it comes from, and a note when the record's name differs. */
  party_label?: string | null; party_election?: string | null; party_elect_name?: string | null; party_note?: string | null;
  /** Registered for a different 2027 office: still this seat's current member, but not presumed to run for this seat. */
  /** basis "editor": a candidacy reported by our editor, not (yet) a registered committee for that office; note says what the official record shows. */
  running_for?: { office_id: string; race_id: string; office: string; committee_url?: string | null; basis?: string; note?: string } | null;
  /** The member's most recent official committee for this seat when they have no counted 2027 committee (campaign finance link only). */
  finance_committee?: { committee_url: string; committee_name: string; election_cycle?: string | null; latest_report_filed?: string | null; do_not_use?: boolean } | null;
};
/** A candidacy reported by our editor that is not a registered committee for this seat in the official record. Never counted as a registration. */
export type Announced = { name: string; party: string | null; party_label?: string | null; basis: string; reported: string; finance_committee_url?: string | null; record_url?: string | null; note: string };
export type Coverage = { locality_id: string; locality: string; coverage: "all" | "part"; precincts: number; locality_precincts: number; source_url: string };
export type Race = {
  /** Committees dropped on review (e.g. stale: the registrant now holds another office), with the reason and its source. */
  excluded?: { name: string; party: string | null; committee_url?: string | null; reason: string; source_url: string }[];
  id: string; seat: string; seats: number; source_url: string; filing_source_url: string; local_filing_source_url?: string; candidates: Cand[];
  shared_with?: { locality_id: string | null; locality: string; source_url: string }[];
  district?: number; locality?: string; locality_id?: string; body?: string; note?: string; note_source_url?: string;
  current_member?: Member | null; current_members?: Member[]; members_known?: boolean; members_source_url?: string;
  /** House / Senate only: covered localities this district includes all or part of (official registrant-by-precinct data). */
  localities?: Coverage[];
  check?: CheckFlag | null;
  announced?: Announced[];
};

/** Campaign finance links go only to an official committee page on the state's campaign finance reports site. */
const CF_COMMITTEE = /^https:\/\/cfreports\.elections\.virginia\.gov\/Committee\/Index\/[0-9a-f-]{36}$/i;
export const isFinanceUrl = (u?: string | null): u is string => !!u && CF_COMMITTEE.test(u);
export const candFinanceUrl = (c: Pick<Cand, "committee_url">): string | null => (isFinanceUrl(c.committee_url) ? c.committee_url : null);
/**
 * A current member's campaign finance page: their own counted 2027 committee, else their most recent official committee for this seat
 * (finance_committee, from the state record), else the committee on the race's check flag when it is theirs. Never guessed: null otherwise.
 */
export function memberFinanceUrl(r: Race, m: Member, own?: Cand | null): string | null {
  const urls = [own?.committee_url, m.finance_committee?.committee_url, r.check && r.check.member === m.name ? r.check.committee_url : null];
  return urls.find(isFinanceUrl) ?? null;
}
export type Loc = { id: string; name: string; kind: string; body: string; on_2027: boolean };
export type OfficeFile = { races: Race[]; localities?: Loc[] };
export type Status = "contested" | "D" | "R" | "Other" | "unopposed" | "none";
export type StatusFilter = "contested" | "one" | "none" | "member" | "check";
export type PartyFilter = "D" | "R" | "Other" | "none";

export const OFFICE_ORDER: Office[] = ["house", "senate", "bos", "sb", "co"];
export const OFFICE_LABEL: Record<Office, string> = {
  house: "House of Delegates", senate: "State Senate", bos: "Board of Supervisors", sb: "School Board", co: "Constitutional Officers",
};
/** Statuses are computed from registered campaign committees until ballot lists are posted, and the labels say so. */
export const STATUS_LABEL: Record<StatusFilter, string> = {
  contested: "Contested (registrations)", one: "One party only (registrations)", none: "No registered committee yet", member: "Member not filed yet", check: "Check record",
};
export const MEMBER_NOT_FILED_NOTE = "The current officeholder (official member list) has no counted 2027 committee yet. It does not mean the seat is vacant: no official record says the member is leaving or not running.";
export const PARTY_LABEL: Record<PartyFilter, string> = { D: "Democrat", R: "Republican", Other: "Other party", none: "Party not listed" };

/** Status from the registrations in the data. Partisan seats: two or more different listed parties = contested; one listed party
 * only = that party; a lone committee with no party listed = unopposed; several committees where any party is not listed =
 * contested (more than one registered committee, parties not all known). School board: more committees than seats = contested. */
export function statusOf(r: Race, office: Office): Status {
  if (!r.candidates.length) return "none";
  if (office === "sb") return r.candidates.length > r.seats ? "contested" : "unopposed";
  const named = new Set(r.candidates.map((c) => c.party).filter((p): p is string => !!p));
  const unlisted = r.candidates.some((c) => !c.party);
  if (named.size >= 2) return "contested";
  if (r.candidates.length === 1) return named.size ? ([...named][0] as Status) : "unopposed";
  if (unlisted) return r.candidates.length > r.seats ? "contested" : "unopposed";
  return [...named][0] as Status;
}
/** The page never calls a seat "open": no official record of vacancies or retirements exists yet, and a sitting member whose committee
 * is still on an older cycle is not leaving. Instead: "Member not filed yet" = the current member is known from an official roster
 * and has no counted 2027 committee (and no record-keeping flag); "Check" = the member's committee carries a Department of Elections flag. */
export const isCheck = (r: Race) => !!r.check && !r.candidates.some((c) => c.incumbent);
export const memberNotFiled = (r: Race) => !!r.members_known && !r.candidates.some((c) => c.incumbent) && !isCheck(r);

export type Entry = { office: Office; race: Race; status: Status; localityIds: string[]; localityName: string | null };

export function flatten(files: Record<Office, OfficeFile>): Entry[] {
  const out: Entry[] = [];
  for (const office of OFFICE_ORDER) {
    for (const race of files[office].races) {
      const ids = race.locality_id ? [race.locality_id, ...(race.shared_with ?? []).map((s) => s.locality_id).filter((x): x is string => !!x)] : (race.localities ?? []).map((l) => l.locality_id);
      out.push({ office, race, status: statusOf(race, office), localityIds: ids, localityName: race.locality ?? null });
    }
  }
  return out;
}

/** Localities that appear in the local-office data, in data order, with ids. */
export function localityOptions(files: Record<Office, OfficeFile>): { id: string; name: string }[] {
  const seen = new Map<string, string>();
  for (const o of ["bos", "sb", "co"] as Office[]) for (const l of files[o].localities ?? []) if (!seen.has(l.id)) seen.set(l.id, l.name);
  return [...seen].map(([id, name]) => ({ id, name }));
}

export type FiledWindow = "today" | "7d" | "30d" | "45d" | "60d";
/** Same windows and day math as the /virginia-2027-bills tracker (days counted in America/New_York, inclusive), plus 45 and 60 days. */
export const FILED_WINDOWS: { value: FiledWindow; label: string; days: number }[] = [
  { value: "today", label: "Filed today", days: 0 }, { value: "7d", label: "Last 7 days", days: 7 }, { value: "30d", label: "Last 30 days", days: 30 },
  { value: "45d", label: "Last 45 days", days: 45 }, { value: "60d", label: "Last 60 days", days: 60 },
];
export const NEW_BADGE_DAYS = 7;
export const todayET = (now: Date = new Date()): CalendarDate => calendarDateInZone(now);
export function candidateInWindow(c: Cand, w: FiledWindow, today: CalendarDate): boolean {
  if (!c.filed_date || !c.filed_date_source_url) return false;
  const days = daysSinceFiled(c.filed_date, today);
  if (days == null || days < 0) return false;
  return days <= FILED_WINDOWS.find((x) => x.value === w)!.days;
}
export const isNewCandidate = (c: Cand, today: CalendarDate) => candidateInWindow(c, "7d", today);
export const hasOfficialDate = (c: Cand) => !!(c.filed_date_source_url && parseOfficialFiledDate(c.filed_date));

/** match: optional query matcher (the page passes the deep search from elections-2027-search.ts); without it, q is a plain substring search. */
export type DirFilters = { offices: Office[]; localities: string[]; statuses: StatusFilter[]; parties: PartyFilter[]; q: string; filed?: FiledWindow; today?: CalendarDate; match?: (e: Entry) => boolean };
export const EMPTY: DirFilters = { offices: [], localities: [], statuses: [], parties: [], q: "" };

export function statusMatches(e: Entry, s: StatusFilter): boolean {
  if (s === "contested") return e.status === "contested";
  if (s === "one") return ["D", "R", "Other", "unopposed"].includes(e.status);
  if (s === "none") return e.status === "none";
  if (s === "check") return isCheck(e.race);
  return memberNotFiled(e.race);
}
export function partyMatches(e: Entry, p: PartyFilter): boolean {
  return e.race.candidates.some((c) => (p === "none" ? !c.party : p === "Other" ? !!c.party && c.party !== "D" && c.party !== "R" : c.party === p));
}
export function raceTitle(e: Entry): string {
  if (e.office === "house") return `House District ${e.race.district}`;
  if (e.office === "senate") return `Senate District ${e.race.district}`;
  return `${e.race.locality} ${e.race.body} · ${e.race.seat}`;
}
function queryMatches(e: Entry, q: string): boolean {
  const n = q.trim().toLowerCase();
  if (!n) return true;
  const num = n.replace(/^(house district|senate district|district|hd|sd)\s*/, "");
  if (/^\d+$/.test(num) && (e.office === "house" || e.office === "senate")) return e.race.district === Number(num);
  const hay = [raceTitle(e), OFFICE_LABEL[e.office], e.race.seat, ...(e.race.shared_with ?? []).map((s) => s.locality), ...(e.race.localities ?? []).map((l) => l.locality),
    ...e.race.candidates.map((c) => c.name), ...(e.race.current_members ?? []).map((m) => m.name), e.race.current_member?.name ?? ""].join(" | ").toLowerCase();
  return hay.includes(n);
}

export function matches(e: Entry, f: DirFilters): boolean {
  if (f.offices.length && !f.offices.includes(e.office)) return false;
  if (f.localities.length && !f.localities.some((l) => e.localityIds.includes(l))) return false;
  if (f.statuses.length && !f.statuses.some((s) => statusMatches(e, s))) return false;
  if (f.parties.length && !f.parties.some((p) => partyMatches(e, p))) return false;
  if (f.filed && !e.race.candidates.some((c) => candidateInWindow(c, f.filed!, f.today ?? todayET()))) return false;
  return f.match ? f.match(e) : queryMatches(e, f.q);
}
export const filterEntries = (es: Entry[], f: DirFilters) => es.filter((e) => matches(e, f));

/** Date pill count = candidates (not races) with an official filed date in the window, among races matching the other filters. */
export function filedWindowCandidateCount(es: Entry[], f: DirFilters, w: FiledWindow): number {
  const today = f.today ?? todayET();
  return filterEntries(es, { ...f, filed: undefined }).reduce((n, e) => n + e.race.candidates.filter((c) => candidateInWindow(c, w, today)).length, 0);
}
export const candidatesWithoutDate = (es: Entry[]) => es.reduce((n, e) => n + e.race.candidates.filter((c) => !hasOfficialDate(c)).length, 0);

/** Pill count = races that would show if this one value were added to (or is already in) its group, other groups unchanged. */
export function facetCount<K extends "offices" | "localities" | "statuses" | "parties">(es: Entry[], f: DirFilters, key: K, value: DirFilters[K][number]): number {
  return filterEntries(es, { ...f, [key]: [value] } as DirFilters).length;
}

export type Group = { office: Office; label: string; count: number; localities: { id: string; label: string; entries: Entry[] }[] };
export function groupEntries(es: Entry[]): Group[] {
  const groups: Group[] = [];
  for (const office of OFFICE_ORDER) {
    const inOffice = es.filter((e) => e.office === office);
    if (!inOffice.length) continue;
    const locs = new Map<string, { id: string; label: string; entries: Entry[] }>();
    for (const e of inOffice) {
      const id = e.race.locality_id ?? "statewide";
      const label = e.race.locality ? `${e.race.locality} · ${e.race.body}` : `Statewide · all ${office === "house" ? 100 : 40} districts`;
      if (!locs.has(id)) locs.set(id, { id, label, entries: [] });
      locs.get(id)!.entries.push(e);
    }
    groups.push({ office, label: OFFICE_LABEL[office], count: inOffice.length, localities: [...locs.values()] });
  }
  return groups;
}

const OFFICES = new Set<string>(OFFICE_ORDER);
const STATUSES = new Set<string>(["contested", "one", "none", "member", "check"]);
const PARTIES = new Set<string>(["D", "R", "Other", "none"]);
const list = (v: unknown) => (typeof v === "string" ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
type DirKey = "r_office" | "r_loc" | "r_status" | "r_party" | "r_q" | "r_filed";
/** URL query <-> filters. Keys: r_office, r_loc, r_status, r_party (comma-separated), r_q, r_filed (one window). Unknown values are dropped. */
export function parseDirSearch(s: Record<string, unknown>): Partial<Record<DirKey, string>> {
  const out: Record<string, string> = {};
  const o = list(s.r_office).filter((x) => OFFICES.has(x));
  const l = list(s.r_loc).filter((x) => /^[a-z0-9-]{1,40}$/.test(x));
  const st = list(s.r_status).filter((x) => STATUSES.has(x));
  const p = list(s.r_party).filter((x) => PARTIES.has(x));
  if (o.length) out.r_office = [...new Set(o)].join(",");
  if (l.length) out.r_loc = [...new Set(l)].join(",");
  if (st.length) out.r_status = [...new Set(st)].join(",");
  if (p.length) out.r_party = [...new Set(p)].join(",");
  if (typeof s.r_q === "string" && s.r_q.trim()) out.r_q = s.r_q.slice(0, 80);
  if (typeof s.r_filed === "string" && FILED_WINDOWS.some((w) => w.value === s.r_filed)) out.r_filed = s.r_filed;
  return out;
}
export function toFilters(s: Partial<Record<DirKey, string>>, today?: CalendarDate): DirFilters {
  return { offices: list(s.r_office) as Office[], localities: list(s.r_loc), statuses: list(s.r_status) as StatusFilter[], parties: list(s.r_party) as PartyFilter[], q: s.r_q ?? "",
    ...(s.r_filed ? { filed: s.r_filed as FiledWindow } : {}), ...(today ? { today } : {}) };
}
export function toggle<T extends string>(cur: T[], v: T): string | undefined {
  const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
  return next.length ? next.join(",") : undefined;
}

/** Chart status: the four buckets the charts color by. Same rules as the filters: "one" and "unopposed" together are the
 * "One party only / unopposed" filter; "contested" and "none" match their filters exactly. School board races have no party
 * on the ballot, so a filled school board seat is either contested (more candidates than seats) or unopposed. */
export type ChartStatus = "contested" | "one" | "unopposed" | "none";
export const CHART_STATUS_ORDER: ChartStatus[] = ["contested", "one", "unopposed", "none"];
export const CHART_STATUS_LABEL: Record<ChartStatus, string> = { contested: "Contested (registrations)", one: "One party only (registrations)", unopposed: "One registered committee", none: "No registered committee yet" };
export function chartStatus(e: Entry): ChartStatus {
  if (e.status === "none") return "none";
  if (e.status === "contested") return "contested";
  if (e.status === "unopposed") return "unopposed";
  return "one";
}
export type Tally = Record<ChartStatus, number> & { memberNotFiled: number; check: number; races: number; candidates: number };
export function tally(es: Entry[]): Tally {
  const t: Tally = { contested: 0, one: 0, unopposed: 0, none: 0, memberNotFiled: 0, check: 0, races: es.length, candidates: 0 };
  for (const e of es) {
    t[chartStatus(e)]++;
    if (memberNotFiled(e.race)) t.memberNotFiled++;
    if (isCheck(e.race)) t.check++;
    t.candidates += e.race.candidates.length;
  }
  return t;
}
/** Races on a locality's 2027 ballot, including county races its voters share (e.g. a city voting in the county sheriff race). */
export const entriesForLocality = (es: Entry[], id: string) => es.filter((e) => e.localityIds.includes(id));

/** Party counts for the Republican vs Democrat charts. Party only from the official committee record; no party in the record =
 * "Party not listed" (gray), which is not Republican, Democrat or Other. */
export type PartyCount = { R: number; D: number; Other: number; notListed: number; total: number };
export function partyCount(e: Entry): PartyCount {
  const c: PartyCount = { R: 0, D: 0, Other: 0, notListed: 0, total: e.race.candidates.length };
  for (const x of e.race.candidates) {
    if (x.party === "R") c.R++;
    else if (x.party === "D") c.D++;
    else if (x.party) c.Other++;
    else c.notListed++;
  }
  return c;
}
export const sumParty = (cs: PartyCount[]): PartyCount =>
  cs.reduce((a, b) => ({ R: a.R + b.R, D: a.D + b.D, Other: a.Other + b.Other, notListed: a.notListed + b.notListed, total: a.total + b.total }), { R: 0, D: 0, Other: 0, notListed: 0, total: 0 });

/** House or Senate districts that include all or part of a locality, from the race coverage data, in district order. */
export function districtsForLocality(es: Entry[], office: "house" | "senate", id: string): { e: Entry; cov: Coverage }[] {
  return es.filter((e) => e.office === office).flatMap((e) => (e.race.localities ?? []).filter((l) => l.locality_id === id).map((cov) => ({ e, cov })))
    .sort((a, b) => (a.e.race.district ?? 0) - (b.e.race.district ?? 0));
}

/** One short status pill per seat for the simple charts (the Loudoun mockup): Contested = more counted committees than seats;
 * Incumbent only / One filed = committees fill the seats, with or without the current member; with none counted: Check (record
 * flag), Member not filed (sitting member known, no counted committee) or None filed. */
export type SeatPill = "Contested" | "Incumbent only" | "One filed" | "Member not filed" | "Check" | "None filed";
export function seatPill(r: Race): SeatPill {
  const n = r.candidates.length;
  if (n > r.seats) return "Contested";
  if (n > 0) return r.candidates.some((c) => c.incumbent) ? "Incumbent only" : "One filed";
  if (isCheck(r)) return "Check";
  if (memberNotFiled(r)) return "Member not filed";
  return "None filed";
}
/** Plain-text counts: "Republican 1 · Democrat 1" (zeros left out), or "No counted committees". */
export function countText(c: PartyCount): string {
  const parts = [["Republican", c.R], ["Democrat", c.D], ["Other", c.Other], ["Party not listed", c.notListed]] as const;
  return parts.filter(([, n]) => n > 0).map(([l, n]) => `${l} ${n}`).join(" · ") || "No counted committees";
}
