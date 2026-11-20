/**
 * Deep search for /2027. One query searches every office at once and returns races (never loose candidates).
 * Matches: registered candidates and committee names, current members (official rosters), partial and last names, district
 * numbers ("HD 30", "30", "SD 31", "House 30", "District 30"), office names, localities (including the localities a House or
 * Senate district covers), seat / magisterial district names, party words and status words. Case, punctuation and accents are
 * ignored; small typos are allowed (edit distance 1 for words of 5-7 letters, 2 for 8+; exact for shorter words).
 * Every term must match somewhere in the race (AND).
 */
import { isOpen, OFFICE_LABEL, raceTitle, type Entry } from "./elections-2027.ts";

export const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const words = (s: string) => norm(s).split(" ").filter(Boolean);

/** Edit distance (insert, delete, substitute, swap two neighbors), capped: returns max + 1 when it is larger than max. */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i++) {
    let best = Infinity;
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      best = Math.min(best, d[i][j]);
    }
    if (best > max) return max + 1;
  }
  return Math.min(d[a.length][b.length], max + 1);
}

/** Allowed typos for a query word of this length. */
export const typoBudget = (n: number) => (n >= 8 ? 2 : n >= 5 ? 1 : 0);
/** Does one query word match one text word? Prefix match for 3+ letters ("helm" -> helmer), otherwise fuzzy within budget. */
export function wordMatches(q: string, w: string): boolean {
  if (w === q) return true;
  if (q.length >= 3 && w.startsWith(q)) return true;
  const k = typoBudget(q.length);
  return k > 0 && editDistance(q, w, k) <= k;
}

export type Chamber = "house" | "senate";
export type Term =
  | { kind: "district"; chamber: Chamber | null; n: number; raw: string }
  | { kind: "status"; value: "open" | "contested" | "none" | "one"; raw: string }
  | { kind: "party"; value: "D" | "R" | "Other" | "none"; raw: string }
  | { kind: "office"; value: Entry["office"]; raw: string }
  | { kind: "word"; w: string; raw: string };

const CHAMBER_WORDS: Record<string, Chamber> = { hd: "house", house: "house", delegate: "house", delegates: "house", hod: "house", sd: "senate", senate: "senate", senator: "senate" };
const PHRASES: [RegExp, Term][] = [
  [/\bno (filing|filings|committee|committees|registration|registrations)( yet)?\b/, { kind: "status", value: "none", raw: "no filing" }],
  [/\bnot filed\b/, { kind: "status", value: "none", raw: "no filing" }],
  [/\bopen seats?\b/, { kind: "status", value: "open", raw: "open" }],
  [/\bone party( only)?\b/, { kind: "status", value: "one", raw: "one party" }],
  [/\bparty not listed\b|\bno party\b/, { kind: "party", value: "none", raw: "party not listed" }],
  [/\bhouse of delegates\b/, { kind: "office", value: "house", raw: "house of delegates" }],
  [/\bstate senate\b/, { kind: "office", value: "senate", raw: "state senate" }],
  [/\bboard of (county )?supervisors\b/, { kind: "office", value: "bos", raw: "board of supervisors" }],
  [/\bschool board\b/, { kind: "office", value: "sb", raw: "school board" }],
  [/\bconstitutional officers?\b/, { kind: "office", value: "co", raw: "constitutional officers" }],
];
const SINGLE: Record<string, Term> = {
  open: { kind: "status", value: "open", raw: "open" }, contested: { kind: "status", value: "contested", raw: "contested" },
  unopposed: { kind: "status", value: "one", raw: "unopposed" },
  republican: { kind: "party", value: "R", raw: "republican" }, republicans: { kind: "party", value: "R", raw: "republican" }, gop: { kind: "party", value: "R", raw: "republican" },
  democrat: { kind: "party", value: "D", raw: "democrat" }, democrats: { kind: "party", value: "D", raw: "democrat" }, democratic: { kind: "party", value: "D", raw: "democrat" },
  independent: { kind: "party", value: "Other", raw: "independent" }, libertarian: { kind: "party", value: "Other", raw: "libertarian" },
  supervisor: { kind: "office", value: "bos", raw: "supervisor" }, supervisors: { kind: "office", value: "bos", raw: "supervisors" },
  sheriff: { kind: "word", w: "sheriff", raw: "sheriff" },
};

/** Parse a query into terms. Handles "HD 30", "HD30", "SD 31", "House 30", "Senate District 31", "District 30", "30". */
export function parseQuery(q: string): Term[] {
  let s = ` ${norm(q).replace(/\b(hd|sd)(\d+)\b/g, "$1 $2")} `;
  const out: Term[] = [];
  s = s.replace(/\b(hd|sd|house|senate|delegates?|senator|hod)( district)? (\d{1,3})\b/g, (_m, c: string, _d, n: string) => {
    out.push({ kind: "district", chamber: CHAMBER_WORDS[c], n: Number(n), raw: `${c} ${n}` });
    return " ";
  });
  s = s.replace(/\b(district|dist|d) (\d{1,3})\b/g, (_m, _d, n: string) => { out.push({ kind: "district", chamber: null, n: Number(n), raw: `district ${n}` }); return " "; });
  for (const [re, t] of PHRASES) if (re.test(s)) { out.push(t); s = s.replace(re, " "); }
  for (const w of s.split(" ").filter(Boolean)) {
    if (/^\d{1,3}$/.test(w)) out.push({ kind: "district", chamber: null, n: Number(w), raw: w });
    else if (SINGLE[w]) out.push(SINGLE[w]);
    else if (!["the", "of", "and", "for", "in", "race", "races", "seat", "county", "city"].includes(w)) out.push({ kind: "word", w, raw: w });
  }
  return out;
}

/** All searchable text for a race. */
export function raceText(e: Entry): string[] {
  const r = e.race;
  return [
    raceTitle(e), OFFICE_LABEL[e.office], r.seat, r.body ?? "", r.locality ?? "",
    ...(r.shared_with ?? []).map((s) => s.locality), ...(r.localities ?? []).map((l) => l.locality),
    ...r.candidates.flatMap((c) => [c.name, c.committee_name ?? "", ...(c.other_committees ?? []).map((o) => o.committee_name)]),
    ...(r.current_members ?? (r.current_member ? [r.current_member] : [])).map((m) => m.name),
  ].filter(Boolean);
}

function termMatches(e: Entry, t: Term, ws: string[]): boolean {
  switch (t.kind) {
    case "district":
      return (e.office === "house" || e.office === "senate") && e.race.district === t.n && (!t.chamber || t.chamber === e.office);
    case "status":
      if (t.value === "open") return isOpen(e.race);
      if (t.value === "contested") return e.status === "contested";
      if (t.value === "none") return e.status === "none";
      return ["D", "R", "Other", "unopposed"].includes(e.status);
    case "party":
      return e.race.candidates.some((c) => (t.value === "none" ? !c.party : t.value === "Other" ? !!c.party && c.party !== "D" && c.party !== "R" : c.party === t.value))
        || (e.race.current_members ?? []).some((m) => m.party === t.value);
    case "office":
      return e.office === t.value;
    case "word":
      return ws.some((w) => wordMatches(t.w, w));
  }
}

export type SearchResult = { entries: Entry[]; terms: Term[] };
export function searchEntries(es: Entry[], q: string): SearchResult {
  const terms = parseQuery(q);
  if (!terms.length) return { entries: q.trim() ? [] : es, terms };
  const entries = es.filter((e) => {
    const ws = raceText(e).flatMap(words);
    return terms.every((t) => termMatches(e, t, ws));
  });
  return { entries, terms };
}
export const raceMatchesQuery = (e: Entry, q: string) => {
  const terms = parseQuery(q);
  if (!terms.length) return !q.trim();
  const ws = raceText(e).flatMap(words);
  return terms.every((t) => termMatches(e, t, ws));
};

/** Split text into [plain, highlighted] runs for the word terms (and district numbers) in a query. */
export function highlight(text: string, terms: Term[]): { t: string; hit: boolean }[] {
  const qs = terms.filter((t): t is Extract<Term, { kind: "word" }> => t.kind === "word").map((t) => t.w);
  const nums = terms.filter((t): t is Extract<Term, { kind: "district" }> => t.kind === "district").map((t) => String(t.n));
  if (!qs.length && !nums.length) return [{ t: text, hit: false }];
  const parts = text.split(/(\s+|[,.()/·-])/);
  return parts.map((p) => {
    const w = norm(p);
    const hit = !!w && (qs.some((q) => wordMatches(q, w)) || nums.includes(w));
    return { t: p, hit };
  });
}
export function summary(n: number, q: string): string {
  return `${n} ${n === 1 ? "race matches" : "races match"} “${q.trim()}”`;
}
