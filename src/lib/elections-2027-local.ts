/**
 * 2027 locality pages (/2027/<slug>): Board of Supervisors (or City Council), School Board and Constitutional Officers tables.
 * Pure functions over src/lib/elections-2027-{bos,sb,co}.json. Incumbent names come from the official rosters in the data;
 * an incumbent's party comes from the roster if it lists one, otherwise from the incumbent's own counted 2027 committee in the
 * state campaign finance record (official), otherwise "Party not listed". Challengers are counted committee registrations
 * (stricter 2027 rule), not ballot listings. Incumbents are presumed to run (Scott's rule) whether or not they have filed.
 */
import { isCheck, memberFinanceUrl, type Announced, type Cand, type Member, type Race } from "./elections-2027.ts";

export type LocalOffice = "bos" | "sb" | "co";
/** runningFor: the member is registered for another 2027 office, so they are not presumed to run for this seat. */
export type LocalIncumbent = { member: Member; party: string | null; partyLabel: string | null; partySource: string | null; partyTitle: string | null; filed: boolean; runningFor: Member["running_for"] | null; financeUrl: string | null };
export type LocalRow = {
  race: Race;
  office: LocalOffice;
  seat: string;
  /** Empty when the data has no official roster for this seat yet. */
  incumbents: LocalIncumbent[];
  /** Counted committees not belonging to an incumbent, minus same-party ones (BOS / CO with a single known-party incumbent). */
  challengers: Cand[];
  /** Same party as the single incumbent: possible primary. Always empty for School Board. */
  same: Cand[];
  /** Candidacies reported by our editor, not registered committees for this seat (shown apart, never counted). */
  announced: { a: Announced; sameParty: boolean }[];
  check: boolean;
  /** Shared office: the race belongs to another locality (a city voting in its county's race). */
  sharedFrom?: string;
};
export type LocLink = { office: string; locality_id: string; locality: string; race_id: string };
export type LocInfo = { id: string; name: string; body: string; on_2027: boolean; note?: string; note_source_url?: string; linked?: LocLink[]; ballot_source_url?: string };
export type NoRace = { locality_id: string; locality: string; body: string; next: string; source_url: string };
export type LocalFile = { as_of: string; races: Race[]; localities?: LocInfo[]; no_2027?: NoRace[]; registrations_source_url?: string };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[.,()]/g, " ").replace(/\b(jr|sr|ii|iii|iv|dr)\b/g, " ").split(/\s+/).filter(Boolean);
const lastName = (s: string) => { const t = norm(s); return t[t.length - 1] ?? ""; };

/** Same person by name: same last name, and every other roster-name token (given names, initials longer than 1 letter) is in the committee name. */
export function sameName(member: string, committee: string): boolean {
  const m = norm(member), c = new Set(norm(committee));
  if (!m.length || lastName(member) !== lastName(committee)) return false;
  const given = m.slice(0, -1).filter((t) => t.length > 1);
  return given.length > 0 && given.every((t) => c.has(t));
}

/** Which roster member an incumbent committee belongs to: the only member, or the member whose last name the committee name ends with. */
export function matchMember(c: Cand, ms: Member[]): Member | null {
  if (!c.incumbent || !ms.length) return null;
  if (ms.length === 1) return ms[0];
  return ms.find((m) => lastName(m.name) === lastName(c.name)) ?? null;
}

export function toLocalRow(r: Race, office: LocalOffice, sharedFrom?: string): LocalRow {
  const ms: Member[] = r.current_members ?? (r.current_member ? [r.current_member] : []);
  // An incumbent's own committee: flagged incumbent in the record, or (when the record does not flag it) a committee whose name
  // carries the roster member's last name and given name, e.g. "Robert Kyle McDaniel" for roster member "Kyle McDaniel".
  const ownOf = (c: Cand) => c.incumbent || ms.some((m) => sameName(m.name, c.name));
  const incCands = r.candidates.filter(ownOf);
  const incumbents: LocalIncumbent[] = ms.map((m) => {
    const own = incCands.find((c) => (c.incumbent ? matchMember(c, ms) === m : sameName(m.name, c.name)));
    const party = m.party ?? (office === "sb" ? null : own?.party ?? null);
    const partySource = m.party ? (m.party_source_url ?? m.source_url) : party ? (own?.committee_url ?? own?.party_source_url ?? null) : null;
    const partyLabel = m.party ? (m.party_label ?? null) : party ? (own?.party_label ?? null) : null;
    const partyTitle = m.party && m.party_election
      ? `Party from the Virginia Department of Elections candidate list, ${m.party_election}${m.party_elect_name && m.party_elect_name !== m.name ? ` (listed as ${m.party_elect_name})` : ""}${m.party_note ? `. ${m.party_note}` : ""}`
      : m.party && m.party_note ? m.party_note : party ? "Party as listed in the official record" : null;
    return { member: m, party, partyLabel, partySource, partyTitle, filed: !!own, runningFor: m.running_for ?? null, financeUrl: memberFinanceUrl(r, m, own) };
  });
  const rest = r.candidates.filter((c) => !ownOf(c));
  const single = incumbents.length === 1 && office !== "sb" ? incumbents[0].party : null;
  const isSame = (c: Cand) => !!single && c.party === single;
  return { race: r, office, seat: r.seat, incumbents, challengers: rest.filter((c) => !isSame(c)), same: rest.filter(isSame),
    announced: (r.announced ?? []).map((a) => ({ a, sameParty: !!single && a.party === single })), check: isCheck(r), ...(sharedFrom ? { sharedFrom } : {}) };
}

export type LocalView = { id: LocalOffice; label: (loc: LocInfo | undefined) => string };
/** Button registry for locality pages. Add a view here (e.g. Campaign Finance) and the page renders it. */
export const LOCAL_VIEWS: LocalView[] = [
  { id: "bos", label: (l) => l?.body ?? "Board of Supervisors" },
  { id: "sb", label: () => "School Board" },
  { id: "co", label: () => "Constitutional Officers" },
];
export const LOCAL_VIEW_IDS = new Set<string>(LOCAL_VIEWS.map((v) => v.id));

export type LocalSection = { view: LocalOffice; label: string; rows: LocalRow[]; loc?: LocInfo; none?: NoRace };

/** The locality's sections: only offices actually on its 2027 ballot (own races, or a shared county race it votes in). */
export function localSections(slug: string, files: Record<LocalOffice, LocalFile>): { shown: LocalSection[]; offBallot: NoRace[] } {
  const shown: LocalSection[] = [];
  const offBallot: NoRace[] = [];
  for (const v of LOCAL_VIEWS) {
    const f = files[v.id];
    const loc = f.localities?.find((l) => l.id === slug);
    const own = f.races.filter((r) => r.locality_id === slug).map((r) => toLocalRow(r, v.id));
    const linked = (loc?.linked ?? []).map((x) => f.races.find((r) => r.id === x.race_id)).filter((r): r is Race => !!r).map((r) => toLocalRow(r, v.id, r.locality));
    const rows = [...own, ...linked];
    const none = f.no_2027?.find((n) => n.locality_id === slug);
    if (rows.length && loc?.on_2027 !== false) shown.push({ view: v.id, label: v.label(loc), rows, loc });
    else if (none) offBallot.push(none);
  }
  return { shown, offBallot };
}

export type LocalSummary = { seats: number; incumbentsKnown: number; incumbentsFiled: number; challengers: number; runningElsewhere: number };
export function summarize(sections: LocalSection[]): LocalSummary {
  const rows = sections.flatMap((s) => s.rows.filter((r) => !r.sharedFrom));
  return {
    seats: rows.reduce((n, r) => n + r.race.seats, 0),
    incumbentsKnown: rows.reduce((n, r) => n + r.incumbents.length, 0),
    incumbentsFiled: rows.reduce((n, r) => n + r.incumbents.filter((i) => i.filed).length, 0),
    challengers: rows.reduce((n, r) => n + r.challengers.length + r.same.length, 0),
    runningElsewhere: rows.reduce((n, r) => n + r.incumbents.filter((i) => i.runningFor).length, 0),
  };
}

/**
 * Landing-tile gap summary for one locality (own races only): seats whose current member has no registered challenger yet.
 * Board of Supervisors / City Council and Constitutional Officers are split by the incumbent's party; School Board is nonpartisan,
 * so its seats count as "unchallenged". Counted per incumbent; a member running for another office is not counted for that seat.
 * A same-party registration (possible primary) is not a challenger from the other side, so it does not close a gap.
 */
export type LocalGaps = { R: number; D: number; other: number; schoolBoard: number; total: number };
export function localGaps(sections: LocalSection[]): LocalGaps {
  const g: LocalGaps = { R: 0, D: 0, other: 0, schoolBoard: 0, total: 0 };
  for (const r of sections.flatMap((s) => s.rows.filter((x) => !x.sharedFrom))) {
    if (r.challengers.length) continue;
    for (const i of r.incumbents) {
      if (i.runningFor) continue;
      if (r.office === "sb") g.schoolBoard++;
      else if (i.party === "R") g.R++;
      else if (i.party === "D") g.D++;
      else g.other++;
      g.total++;
    }
  }
  return g;
}

/**
 * School Board "Supported by": only a verifiable public endorsement by the county's official Republican or Democratic committee,
 * with its source. Keyed by race id + committee name. Empty until such an endorsement for a 2027 race is published.
 */
export type Endorsement = { party: "D" | "R"; by: string; source_url: string };
export const SB_ENDORSEMENTS: Record<string, Record<string, Endorsement>> = {};
export const endorsementFor = (raceId: string, name: string): Endorsement | null => SB_ENDORSEMENTS[raceId]?.[name] ?? null;
