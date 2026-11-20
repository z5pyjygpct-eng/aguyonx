/**
 * /2027 election directory helpers: flatten the five official data files into one race list, derive each race's status only from
 * the official filings in the data, filter with combinable pills (OR inside a group, AND across groups), and group by office then
 * locality. Pure functions so they can be tested without the page.
 */
export type Office = "house" | "senate" | "sb" | "bos" | "co";
export type Cand = { name: string; incumbent: boolean; party: string | null; endorsement?: string | null; party_source_url: string | null; filing_source_url: string };
export type Race = {
  id: string; seat: string; seats: number; source_url: string; filing_source_url: string; local_filing_source_url?: string; candidates: Cand[];
  shared_with?: { locality_id: string | null; locality: string; source_url: string }[];
  district?: number; locality?: string; locality_id?: string; body?: string; note?: string; note_source_url?: string;
  current_member?: { name: string; party: string; slug: string; source_url: string } | null;
};
export type Loc = { id: string; name: string; kind: string; body: string; on_2027: boolean };
export type OfficeFile = { races: Race[]; localities?: Loc[] };
export type Status = "contested" | "D" | "R" | "Other" | "unopposed" | "none";
export type StatusFilter = "contested" | "one" | "none" | "open";
export type PartyFilter = "D" | "R" | "Other";

export const OFFICE_ORDER: Office[] = ["house", "senate", "bos", "sb", "co"];
export const OFFICE_LABEL: Record<Office, string> = {
  house: "House of Delegates", senate: "State Senate", bos: "Board of Supervisors", sb: "School Board", co: "Constitutional Officers",
};
export const STATUS_LABEL: Record<StatusFilter, string> = { contested: "Contested", one: "One party only", none: "No filing yet", open: "Open seat" };
export const PARTY_LABEL: Record<PartyFilter, string> = { D: "Democrat", R: "Republican", Other: "Other" };

export function statusOf(r: Race, office: Office): Status {
  if (!r.candidates.length) return "none";
  if (office === "sb") return r.candidates.length > r.seats ? "contested" : "unopposed";
  const ps = new Set(r.candidates.map((c) => c.party ?? "Other"));
  if (ps.has("D") && ps.has("R")) return "contested";
  if (ps.size === 1) return [...ps][0] as Status;
  return "contested";
}
/** Open seat = at least one official filing and none of the filers is the incumbent. A seat with no filing is not called open. */
export const isOpen = (r: Race) => r.candidates.length > 0 && !r.candidates.some((c) => c.incumbent);

export type Entry = { office: Office; race: Race; status: Status; localityIds: string[]; localityName: string | null };

export function flatten(files: Record<Office, OfficeFile>): Entry[] {
  const out: Entry[] = [];
  for (const office of OFFICE_ORDER) {
    for (const race of files[office].races) {
      const ids = race.locality_id ? [race.locality_id, ...(race.shared_with ?? []).map((s) => s.locality_id).filter((x): x is string => !!x)] : [];
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

export type DirFilters = { offices: Office[]; localities: string[]; statuses: StatusFilter[]; parties: PartyFilter[]; q: string };
export const EMPTY: DirFilters = { offices: [], localities: [], statuses: [], parties: [], q: "" };

export function statusMatches(e: Entry, s: StatusFilter): boolean {
  if (s === "contested") return e.status === "contested";
  if (s === "one") return ["D", "R", "Other", "unopposed"].includes(e.status);
  if (s === "none") return e.status === "none";
  return isOpen(e.race);
}
export function partyMatches(e: Entry, p: PartyFilter): boolean {
  return e.race.candidates.some((c) => (p === "Other" ? c.party !== null && c.party !== "D" && c.party !== "R" : c.party === p));
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
  const hay = [raceTitle(e), OFFICE_LABEL[e.office], e.race.seat, ...(e.race.shared_with ?? []).map((s) => s.locality), ...e.race.candidates.map((c) => c.name), e.race.current_member?.name ?? ""].join(" | ").toLowerCase();
  return hay.includes(n);
}

export function matches(e: Entry, f: DirFilters): boolean {
  if (f.offices.length && !f.offices.includes(e.office)) return false;
  if (f.localities.length && !f.localities.some((l) => e.localityIds.includes(l))) return false;
  if (f.statuses.length && !f.statuses.some((s) => statusMatches(e, s))) return false;
  if (f.parties.length && !f.parties.some((p) => partyMatches(e, p))) return false;
  return queryMatches(e, f.q);
}
export const filterEntries = (es: Entry[], f: DirFilters) => es.filter((e) => matches(e, f));

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
const STATUSES = new Set<string>(["contested", "one", "none", "open"]);
const PARTIES = new Set<string>(["D", "R", "Other"]);
const list = (v: unknown) => (typeof v === "string" ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
/** URL query <-> filters. Keys: r_office, r_loc, r_status, r_party, r_q (comma-separated values). Unknown values are dropped. */
export function parseDirSearch(s: Record<string, unknown>): Partial<Record<"r_office" | "r_loc" | "r_status" | "r_party" | "r_q", string>> {
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
  return out;
}
export function toFilters(s: Partial<Record<"r_office" | "r_loc" | "r_status" | "r_party" | "r_q", string>>): DirFilters {
  return { offices: list(s.r_office) as Office[], localities: list(s.r_loc), statuses: list(s.r_status) as StatusFilter[], parties: list(s.r_party) as PartyFilter[], q: s.r_q ?? "" };
}
export function toggle<T extends string>(cur: T[], v: T): string | undefined {
  const next = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
  return next.length ? next.join(",") : undefined;
}
