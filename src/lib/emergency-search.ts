/** Deep search over Emergency Monitor alerts. No extra dependencies. Alias expansion is on the query side so the per-item index stays small. */

import { extractCountries, extractUsStates } from "@/lib/emergency-place";
import { sourceClassesOf } from "@/lib/emergency-source";

export type SearchableItem = {
  text?: string;
  title?: string;
  location?: string;
  type?: string;
  summary?: string;
  status?: string;
  severity?: string;
  links?: { url: string; label?: string }[];
};

export type SearchTerm = {
  raw: string;
  folded: string;
  quoted: boolean;
};

export type SearchAlt = {
  value: string;
  words: string[];
  tokenOnly: boolean;
  acronym: boolean;
  state?: string;
  country?: string;
};

export type CompiledQuery = {
  raw: string;
  and: { alts: SearchAlt[] }[];
};

export type HighlightNeedle = { value: string; tokenOnly: boolean };

type PlaceIndex = { states: Set<string>; countries: Set<string> };

type SearchIndex = {
  section: string;
  hay: string;
  caps: Set<string>;
  handles: string[];
  region: string;
  threat: string;
  type: string;
  status: string;
  sources: string[];
  places?: PlaceIndex;
};

const CACHE = new WeakMap<object, SearchIndex>();

/** Lowercase and strip diacritics so "café" matches "cafe". */
export function foldSearch(s: string): string {
  return s.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase();
}

const STOP = new Set(["a", "an", "and", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);

/** English words that collide with acronyms or short codes — never match these as general prose. */
const COMMON_WORDS = new Set([
  ...STOP,
  "who", "us", "ok", "hi", "id", "me", "am", "be", "do", "no", "so", "we", "it", "if", "as",
  "up", "all", "now", "aid", "fat", "are", "was", "can", "may", "pa", "la", "al", "ma", "co",
  "md", "ms", "mo", "mt", "nd", "ne", "sd", "sc", "de", "fl", "oh", "ut", "wy", "ga", "va",
  "wa", "ca", "ar", "ak", "ks", "ky", "tn", "tx", "ri", "ct", "nj", "nh", "nm", "nv", "ny",
  "nc", "il", "ia", "mi", "mn", "pr", "dc", "uk", "eu", "un",
]);

const USPS: Record<string, string> = {
  al: "alabama", ak: "alaska", az: "arizona", ar: "arkansas", ca: "california",
  co: "colorado", ct: "connecticut", de: "delaware", fl: "florida", ga: "georgia",
  hi: "hawaii", id: "idaho", il: "illinois", in: "indiana", ia: "iowa", ks: "kansas",
  ky: "kentucky", la: "louisiana", me: "maine", md: "maryland", ma: "massachusetts",
  mi: "michigan", mn: "minnesota", ms: "mississippi", mo: "missouri", mt: "montana",
  ne: "nebraska", nv: "nevada", nh: "new hampshire", nj: "new jersey", nm: "new mexico",
  ny: "new york", nc: "north carolina", nd: "north dakota", oh: "ohio", ok: "oklahoma",
  or: "oregon", pa: "pennsylvania", ri: "rhode island", sc: "south carolina",
  sd: "south dakota", tn: "tennessee", tx: "texas", ut: "utah", vt: "vermont",
  va: "virginia", wa: "washington", wv: "west virginia", wi: "wisconsin", wy: "wyoming",
  dc: "washington, d.c.", pr: "puerto rico",
};

const STATE_NAME_TO_CODE: Record<string, string> = {};
for (const [code, name] of Object.entries(USPS)) STATE_NAME_TO_CODE[name] = code;
STATE_NAME_TO_CODE["washington, dc"] = "dc";
STATE_NAME_TO_CODE["washington dc"] = "dc";
STATE_NAME_TO_CODE["washington d.c."] = "dc";
STATE_NAME_TO_CODE["district of columbia"] = "dc";
STATE_NAME_TO_CODE["washington, d.c."] = "dc";

/** ISO and common aliases → canonical country name (folded). Query-side only. */
const COUNTRY_CODE: Record<string, string> = {
  us: "united states", usa: "united states",
  "u.s": "united states", "u.s.a": "united states", america: "united states",
  gb: "united kingdom", uk: "united kingdom", gbr: "united kingdom",
  britain: "united kingdom", "great britain": "united kingdom",
  england: "united kingdom", scotland: "united kingdom", wales: "united kingdom",
  "northern ireland": "united kingdom",
  ae: "united arab emirates", are: "united arab emirates", uae: "united arab emirates",
  cn: "china", chn: "china", prc: "china", "peoples republic of china": "china",
  "people's republic of china": "china",
  ru: "russia", rus: "russia", ua: "ukraine", ukr: "ukraine",
  il: "israel", isr: "israel", ir: "iran", irn: "iran", iq: "iraq", irq: "iraq",
  sy: "syria", syr: "syria", lb: "lebanon", lbn: "lebanon", jo: "jordan", jor: "jordan",
  ps: "palestine", pal: "palestine", gaza: "palestine", "west bank": "palestine",
  ye: "yemen", yem: "yemen", sa: "saudi arabia", sau: "saudi arabia",
  qa: "qatar", kw: "kuwait", bh: "bahrain", om: "oman",
  tr: "turkey", tur: "turkey", turkiye: "turkey",
  eg: "egypt", egy: "egypt", ly: "libya", tn: "tunisia", dz: "algeria", ma: "morocco",
  sd: "sudan", ss: "south sudan", et: "ethiopia", ke: "kenya", so: "somalia",
  ng: "nigeria", nga: "nigeria", za: "south africa",
  cd: "dr congo", drc: "dr congo", cg: "congo",
  mx: "mexico", mex: "mexico", ca_canada: "canada", // placeholder avoided
  ca: "canada", can: "canada",
  gt: "guatemala", hn: "honduras", ni: "nicaragua", pa: "panama", ht: "haiti",
  cu: "cuba", jm: "jamaica", bz: "belize", do: "dominican republic", sv: "el salvador", cr: "costa rica",
  br: "brazil", bra: "brazil", ar: "argentina", arg: "argentina", cl: "chile", pe: "peru",
  co: "colombia", col: "colombia", ve: "venezuela", bo: "bolivia", ec: "ecuador",
  py: "paraguay", uy: "uruguay", gy: "guyana", sr: "suriname",
  de: "germany", deu: "germany", fr: "france", fra: "france", it: "italy", ita: "italy",
  es: "spain", esp: "spain", pt: "portugal", nl: "netherlands", be: "belgium",
  se: "sweden", no: "norway", dk: "denmark", fi: "finland", ie: "ireland", irl: "ireland",
  pl: "poland", ro: "romania", hu: "hungary", cz: "czechia", "czech republic": "czechia",
  at: "austria", ch: "switzerland", gr: "greece", sk: "slovakia", hr: "croatia",
  rs: "serbia", si: "slovenia", bg: "bulgaria", ee: "estonia", lv: "latvia", lt: "lithuania",
  md: "moldova", by: "belarus", al: "albania", is: "iceland", lu: "luxembourg", mt: "malta", cy: "cyprus",
  in: "india", ind: "india", pk: "pakistan", bd: "bangladesh", af: "afghanistan",
  jp: "japan", jpn: "japan", kr: "south korea", kp: "north korea",
  tw: "taiwan", twn: "taiwan", au: "australia", aus: "australia", nz: "new zealand",
  id: "indonesia", idn: "indonesia", my: "malaysia", sg: "singapore", th: "thailand",
  ph: "philippines", vn: "vietnam", mm: "myanmar", kh: "cambodia", np: "nepal",
  am: "armenia", az: "azerbaijan", kz: "kazakhstan", uz: "uzbekistan",
  ge: "georgia",
};

// "ca" maps to Canada in ISO and California in USPS — both are handled separately below.

type AliasGroup = { keys?: string[]; alts: string[]; acronym?: boolean };

const ALIAS_GROUPS: AliasGroup[] = [
  { alts: ["nws", "national weather service"], acronym: true },
  { alts: ["fema", "federal emergency management agency"], acronym: true },
  { alts: ["nhc", "national hurricane center"], acronym: true },
  { alts: ["usgs", "united states geological survey", "u.s. geological survey", "us geological survey"], acronym: true },
  { alts: ["cdc", "centers for disease control and prevention", "centers for disease control"], acronym: true },
  { alts: ["who", "world health organization"], acronym: true },
  { alts: ["dhs", "department of homeland security", "homeland security"], acronym: true },
  { alts: ["cisa", "cybersecurity and infrastructure security agency"], acronym: true },
  { alts: ["fbi", "federal bureau of investigation"], acronym: true },
  { alts: ["faa", "federal aviation administration", "federal aviation"], acronym: true },
  { alts: ["ntsb", "national transportation safety board"], acronym: true },
  { alts: ["uscg", "united states coast guard", "u.s. coast guard", "us coast guard", "coast guard"], acronym: true },
  { alts: ["iaea", "international atomic energy agency"], acronym: true },
  { alts: ["tsa", "transportation security administration"], acronym: true },
  { alts: ["ice", "immigration and customs enforcement"], acronym: true },
  { alts: ["epa", "environmental protection agency"], acronym: true },
  { alts: ["eu", "european union"], acronym: true },
  { alts: ["un", "united nations"], acronym: true },
  { alts: ["nato", "north atlantic treaty organization"], acronym: true },
  { alts: ["idf", "israel defense forces"], acronym: true },
  { alts: ["irgc", "islamic revolutionary guard corps"], acronym: true },
  { alts: ["ukmto", "uk maritime trade operations"], acronym: true },
  { alts: ["cia", "central intelligence agency"], acronym: true },
  { alts: ["nsa", "national security agency"], acronym: true },
  { alts: ["dod", "department of defense", "u.s. department of defense"], acronym: true },
  { alts: ["doj", "department of justice"], acronym: true },
  { alts: ["hhs", "health and human services", "department of health and human services"], acronym: true },
  { alts: ["atf", "bureau of alcohol tobacco firearms and explosives"], acronym: true },
  { alts: ["dea", "drug enforcement administration"], acronym: true },
  // One-way: typing cyber (or close forms) matches the whole set; typing CISA or ransomware does not.
  {
    keys: ["cyber", "cyberattack", "cyber attack", "cyber-attack", "cyber attacks", "cyber-attacks"],
    alts: ["cyber", "cyberattack", "cyber attack", "cyber-attack", "cyberattacks", "cyber attacks", "ransomware", "hack", "hacked", "hacking", "data breach", "ddos", "d-dos", "malware", "cisa"],
  },
  { alts: ["uk", "united kingdom", "britain", "great britain", "gb", "u.k."] },
  { alts: ["us", "usa", "united states", "united states of america", "america", "u.s.", "u.s.a."] },
  { alts: ["dc", "washington dc", "washington d.c.", "washington, d.c.", "washington, dc", "district of columbia"] },
  { alts: ["prc", "china", "peoples republic of china", "people's republic of china"] },
  { alts: ["uae", "united arab emirates"] },
];

const ACRONYM_TERMS = new Set<string>();
const KEY_TO_ALTS = new Map<string, { alts: string[]; acronym: boolean }>();
for (const g of ALIAS_GROUPS) {
  const alts = g.alts.map((a) => foldSearch(a.replace(/['’]/g, "")));
  const keys = (g.keys ?? g.alts).map((a) => foldSearch(a.replace(/['’]/g, "")));
  for (const k of keys) KEY_TO_ALTS.set(k, { alts, acronym: Boolean(g.acronym) });
  if (g.acronym) for (const a of alts) if (!a.includes(" ")) ACRONYM_TERMS.add(a);
}

const SKIP_HANDLE = /^(i|intent|share|search|hashtag|explore|home|compose|settings|privacy)$/i;
export function handlesFromUrl(url: string): string[] {
  const m = /https?:\/\/(?:www\.)?(?:x|twitter)\.com\/([^/?#]+)/i.exec(url);
  if (!m) return [];
  const first = m[1];
  if (!first || SKIP_HANDLE.test(first)) return [];
  return [first];
}

function tokensFrom(s: string): string[] {
  const f = foldSearch(s);
  const out: string[] = [];
  const spaced = f.replace(/['’]/g, "").replace(/[.\-_/]+/g, " ").replace(/[^\p{L}\p{N}\s]+/gu, " ");
  for (const w of spaced.split(/\s+/).filter(Boolean)) out.push(w);
  for (const w of f.split(/[^\p{L}\p{N}.\-]+/u).filter(Boolean)) {
    const c = w.replace(/[.\-]+/g, "");
    if (c && c !== w) out.push(c);
  }
  return out;
}

function capsTokensFrom(s: string): string[] {
  const out: string[] = [];
  const re = /\b[A-Z]{2,6}\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) out.push(foldSearch(m[0]));
  return out;
}

function statusOf(it: SearchableItem) {
  const t = (it.title ?? it.text ?? "").trim();
  const m = t.match(/^(NEW|UPDATE|CONTINUATION|RESOLVED)\b/i);
  if (!m) return "unspecified";
  return m[1].toLowerCase();
}

/**
 * Unquoted words are ANDed. "Quoted phrases" stay together.
 * An unclosed quote treats the rest of the query as one phrase.
 */
export function parseSearchTerms(q: string): SearchTerm[] {
  const src = q.trim();
  if (!src) return [];
  const terms: SearchTerm[] = [];
  let i = 0;
  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) break;
    if (src[i] === '"') {
      const end = src.indexOf('"', i + 1);
      const raw = (end === -1 ? src.slice(i + 1) : src.slice(i + 1, end)).trim();
      i = end === -1 ? src.length : end + 1;
      const folded = foldSearch(raw.replace(/^@/, ""));
      if (folded) terms.push({ raw, folded, quoted: true });
      continue;
    }
    const start = i;
    while (i < src.length && !/\s/.test(src[i]) && src[i] !== '"') i++;
    const raw = src.slice(start, i).replace(/^[^\p{L}\p{N}@]+|[^\p{L}\p{N}]+$/gu, "");
    const folded = foldSearch(raw.replace(/^@/, ""));
    if (folded) terms.push({ raw, folded, quoted: false });
  }
  return terms;
}

function makeAlt(value: string, flags: Partial<SearchAlt> = {}): SearchAlt {
  const v = foldSearch(value.replace(/['’]/g, ""));
  const words = tokensFrom(v);
  return {
    value: v,
    words: words.length ? words : [v],
    tokenOnly: Boolean(flags.tokenOnly) || v.length <= 2,
    acronym: Boolean(flags.acronym),
    state: flags.state,
    country: flags.country,
  };
}

function expandTerm(term: SearchTerm): SearchAlt[] {
  const key = term.folded.replace(/^@/, "");
  const alts: SearchAlt[] = [];
  const seen = new Set<string>();
  const add = (a: SearchAlt) => {
    const id = `${a.value}|${a.tokenOnly}|${a.acronym}|${a.state ?? ""}|${a.country ?? ""}`;
    if (seen.has(id)) return;
    seen.add(id);
    alts.push(a);
  };

  const mapped = KEY_TO_ALTS.get(key) ?? KEY_TO_ALTS.get(key.replace(/-/g, " "));
  if (mapped) {
    for (const v of mapped.alts) add(makeAlt(v, { acronym: mapped.acronym && !v.includes(" "), tokenOnly: foldSearch(v).length <= 2 || mapped.acronym && !v.includes(" ") }));
  } else {
    add(makeAlt(key, { acronym: ACRONYM_TERMS.has(key), tokenOnly: key.length <= 2 || ACRONYM_TERMS.has(key) }));
  }

  const stateName = USPS[key] ?? (STATE_NAME_TO_CODE[key] ? key : undefined);
  if (stateName) {
    const code = STATE_NAME_TO_CODE[stateName] ?? key;
    add(makeAlt(stateName, { tokenOnly: true, state: stateName }));
    add(makeAlt(code, { tokenOnly: true, state: stateName }));
    if (stateName === "washington, d.c.") {
      add(makeAlt("washington dc", { tokenOnly: true, state: stateName }));
      add(makeAlt("district of columbia", { tokenOnly: true, state: stateName }));
    }
  }

  const country = COUNTRY_CODE[key];
  if (country) add(makeAlt(country, { tokenOnly: true, country }));

  // Handle queries: @NWS or NWSBoston
  if (term.raw.startsWith("@") || key.length >= 3) {
    add(makeAlt(key, { tokenOnly: false, acronym: false }));
  }

  return alts;
}

export function compileQuery(q: string): CompiledQuery {
  const parsed = parseSearchTerms(q);
  const and: CompiledQuery["and"] = [];
  // Drop stopwords unless quoted, the sole term, or a short code/acronym the user clearly meant (uppercase or alias).
  const usable = parsed.filter((t, _, all) => {
    if (t.quoted) return true;
    if (all.length === 1) return true;
    if (!STOP.has(t.folded)) return true;
    if (/^[A-Z]{2,}$/.test(t.raw)) return true;
    return false;
  });
  const terms = usable.length ? usable : parsed;
  for (const t of terms) and.push({ alts: expandTerm(t) });
  return { raw: q, and };
}

function wordMatches(word: string, term: string): boolean {
  if (word === term) return true;
  if (term.length >= 3 && word.startsWith(term)) return true;
  if (word === `${term}s` || word === `${term}es` || term === `${word}s` || term === `${word}es`) return true;
  if (term.endsWith("y") && term.length >= 3 && word === `${term.slice(0, -1)}ies`) return true;
  if (word.endsWith("y") && word.length >= 3 && term === `${word.slice(0, -1)}ies`) return true;
  return false;
}

function phraseMatches(words: string[], phrase: string[]): boolean {
  if (!phrase.length) return false;
  for (let i = 0; i <= words.length - phrase.length; i++) {
    let ok = true;
    for (let j = 0; j < phrase.length; j++) {
      if (!wordMatches(words[i + j], phrase[j])) {
        ok = false;
        break;
      }
    }
    if (ok) return true;
  }
  return false;
}


function padHay(words: string[]): string {
  return words.length ? ` ${words.join(" ")} ` : " ";
}

function hayHasToken(hay: string, term: string): boolean {
  return hay.includes(` ${term} `);
}

function hayHasPrefix(hay: string, term: string): boolean {
  return hay.includes(` ${term}`);
}

function stemsOf(term: string): string[] {
  const out = [term];
  if (term.endsWith("ies") && term.length >= 5) out.push(`${term.slice(0, -3)}y`);
  else if (term.endsWith("es") && term.length >= 5) out.push(term.slice(0, -2));
  else if (term.endsWith("s") && !term.endsWith("ss") && term.length >= 4) out.push(term.slice(0, -1));
  return out;
}

function buildIndex(it: SearchableItem, section = ""): SearchIndex {
  const hit = CACHE.get(it);
  if (hit && hit.section === section) return hit;

  const fields = [it.title, it.summary, it.text, it.location, it.status, it.type, it.severity].filter(Boolean).join("\n");
  const words = tokensFrom(fields);
  const caps = new Set(capsTokensFrom(fields));
  const handles: string[] = [];
  for (const l of it.links ?? []) {
    if (l.label) {
      words.push(...tokensFrom(l.label));
      for (const c of capsTokensFrom(l.label)) caps.add(c);
    }
    for (const h of handlesFromUrl(l.url ?? "")) {
      const f = foldSearch(h);
      handles.push(f);
      words.push(f);
      caps.add(f);
    }
  }

  const threat = foldSearch(it.severity ?? "unspecified");
  const typ = foldSearch(it.type ?? "unspecified");
  const status = statusOf(it);
  const region = foldSearch(section || "");
  if (region) words.push(...tokensFrom(region));
  words.push(threat, typ, status);

  const idx: SearchIndex = {
    section,
    hay: padHay(words),
    caps,
    handles,
    region,
    threat,
    type: typ,
    status,
    sources: [],
  };
  CACHE.set(it, idx);
  return idx;
}

function placeHints(alt: SearchAlt): string[] {
  const hints: string[] = [];
  if (alt.state) {
    hints.push(alt.state, alt.value);
    const first = alt.state.split(",")[0].trim();
    if (first) hints.push(first);
    if (alt.state.includes("d.c.") || alt.value === "dc") hints.push("dc", "washington", "columbia");
  }
  if (alt.country) {
    hints.push(alt.country, alt.value);
    for (const w of alt.country.split(/[^\p{L}\p{N}]+/u).filter((x) => x.length >= 2)) hints.push(w);
  }
  return hints;
}

function looksLikePlace(idx: SearchIndex, alt: SearchAlt): boolean {
  return placeHints(alt).some((h) => (h.length <= 2 ? hayHasToken(idx.hay, h) : hayHasPrefix(idx.hay, h)) || idx.handles.some((x) => x === h || x.startsWith(h)));
}

function ensurePlaces(idx: SearchIndex, it: SearchableItem, section: string): PlaceIndex {
  if (idx.places) return idx.places;
  const states = new Set<string>();
  for (const name of extractUsStates(it.location, section)) {
    const f = foldSearch(name);
    states.add(f);
    const code = STATE_NAME_TO_CODE[f] ?? STATE_NAME_TO_CODE[f.replace(/,/g, "")];
    if (code) states.add(code);
    if (/d\.?c\.?/.test(f) || f.includes("district of columbia")) {
      states.add("dc");
      states.add("washington, d.c.");
      states.add("washington dc");
    }
  }
  const countries = new Set<string>();
  for (const name of extractCountries(it.location, section)) countries.add(foldSearch(name));
  idx.places = { states, countries };
  return idx.places;
}

function altMatches(idx: SearchIndex, alt: SearchAlt, it: SearchableItem, section: string): boolean {
  if (alt.state || alt.country) {
    if (looksLikePlace(idx, alt)) {
      const places = ensurePlaces(idx, it, section);
      if (alt.state && (places.states.has(alt.state) || places.states.has(alt.value))) return true;
      if (alt.country && (places.countries.has(alt.country) || places.countries.has(alt.value))) return true;
    }
  }

  const v = alt.value;
  if (alt.acronym || (ACRONYM_TERMS.has(v) && !v.includes(" "))) {
    if (idx.caps.has(v)) return true;
    if (idx.handles.some((h) => h === v || (v.length >= 3 && h.startsWith(v)))) return true;
    if (alt.words.length > 1 && hayHasPrefix(idx.hay, alt.words.join(" "))) return true;
    return false;
  }

  if (alt.words.length > 1) return hayHasPrefix(idx.hay, alt.words.join(" "));

  if (v.length >= 3 && idx.handles.some((h) => h === v || h.startsWith(v) || h.includes(v))) return true;

  if (alt.tokenOnly || v.length <= 2) {
    if (idx.caps.has(v)) return true;
    if (hayHasToken(idx.hay, v) && !COMMON_WORDS.has(v)) return true;
    if (v === "official" || v === "news" || v === "other") {
      if (!idx.sources.length) idx.sources = [...sourceClassesOf(it.links)].map((s) => foldSearch(s));
      return idx.sources.includes(v);
    }
    return idx.region === v || idx.threat === v || idx.type === v || idx.status === v;
  }

  return stemsOf(v).some((n) => hayHasPrefix(idx.hay, n));
}

export function itemMatchesQuery(it: SearchableItem, query: CompiledQuery, section = ""): boolean {
  if (!query.and.length) return true;
  const idx = buildIndex(it, section);
  return query.and.every((term) => term.alts.some((alt) => altMatches(idx, alt, it, section)));
}

/** Back-compat wrapper. Prefer itemMatchesQuery. */
export function itemMatchesTerms(it: SearchableItem, terms: string[] | CompiledQuery, section = ""): boolean {
  if (Array.isArray(terms)) {
    if (!terms.length) return true;
    return itemMatchesQuery(it, compileQuery(terms.map((t) => (t.includes(" ") ? `"${t}"` : t)).join(" ")), section);
  }
  return itemMatchesQuery(it, terms, section);
}

export function linkMatchesTerms(l: { url: string; label?: string }, terms: string[] | CompiledQuery): boolean {
  const query = Array.isArray(terms) ? compileQuery(terms.join(" ")) : terms;
  if (!query.and.length) return false;
  const handles = handlesFromUrl(l.url).map((h) => foldSearch(h));
  const words = [...tokensFrom(l.label ?? ""), ...handles];
  const caps = new Set(capsTokensFrom(l.label ?? ""));
  const fake: SearchIndex = {
    section: "",
    hay: padHay(words),
    caps,
    handles,
    region: "",
    threat: "",
    type: "",
    status: "",
    sources: [],
  };
  return query.and.some((term) => term.alts.some((alt) => altMatches(fake, alt, {}, "")));
}

export function highlightNeedles(query: CompiledQuery): HighlightNeedle[] {
  const out: HighlightNeedle[] = [];
  const seen = new Set<string>();
  for (const term of query.and) {
    for (const alt of term.alts) {
      const tokenOnly = alt.tokenOnly || alt.acronym || alt.value.length <= 2 || Boolean(alt.state) || Boolean(alt.country);
      const id = `${alt.value}|${tokenOnly}`;
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ value: alt.value, tokenOnly });
      if (alt.words.length > 1) {
        for (const w of alt.words) {
          const wid = `${w}|${w.length <= 2}`;
          if (seen.has(wid) || w.length < 3) continue;
          seen.add(wid);
          out.push({ value: w, tokenOnly: w.length <= 2 });
        }
      }
    }
  }
  return out.sort((a, b) => b.value.length - a.value.length);
}

/** Split `text` into plain/hit slices for wrapping matches in <mark>. */
export function splitHighlights(text: string, terms: string[] | HighlightNeedle[]): { t: string; hit: boolean }[] {
  if (!text) return [];
  const needles: HighlightNeedle[] = (terms as (string | HighlightNeedle)[]).map((t) =>
    typeof t === "string" ? { value: foldSearch(t), tokenOnly: t.length <= 2 } : t,
  ).filter((t) => t.value);
  if (!needles.length) return [{ t: text, hit: false }];

  const foldedChars: string[] = [];
  const origAt: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const chunk = foldSearch(text[i]);
    for (let k = 0; k < chunk.length; k++) {
      foldedChars.push(chunk[k]);
      origAt.push(i);
    }
  }
  const folded = foldedChars.join("");
  const isWord = (ch: string | undefined) => Boolean(ch && /[0-9a-z]/i.test(ch));
  const hits = new Uint8Array(text.length);

  const markRange = (foldStart: number, foldEnd: number) => {
    const start = origAt[foldStart];
    const endOrig = origAt[foldEnd - 1];
    if (start == null || endOrig == null) return;
    for (let i = start; i <= endOrig; i++) hits[i] = 1;
  };

  for (const n of needles) {
    const term = n.value;
    if (!term) continue;
    if (n.tokenOnly || term.length <= 2) {
      let from = 0;
      while (from <= folded.length - term.length) {
        const at = folded.indexOf(term, from);
        if (at < 0) break;
        const before = folded[at - 1];
        const after = folded[at + term.length];
        if (!isWord(before) && !isWord(after)) markRange(at, at + term.length);
        from = at + 1;
      }
      continue;
    }
    // Word-prefix / exact: walk folded letters, find word starts
    let i = 0;
    while (i < folded.length) {
      if (isWord(folded[i]) && (i === 0 || !isWord(folded[i - 1]))) {
        let j = i;
        while (j < folded.length && isWord(folded[j])) j++;
        const word = folded.slice(i, j);
        if (wordMatches(word, term)) markRange(i, j);
        i = j;
      } else i++;
    }
  }

  const out: { t: string; hit: boolean }[] = [];
  let i = 0;
  while (i < text.length) {
    const hit = hits[i] === 1;
    let j = i + 1;
    while (j < text.length && hits[j] === (hit ? 1 : 0)) j++;
    out.push({ t: text.slice(i, j), hit });
    i = j;
  }
  return out;
}

export type Countable = { it: SearchableItem; section?: string };

export function timeSearch(items: Countable[], q: string) {
  const query = compileQuery(q);
  const t0 = now();
  let hits = 0;
  for (const row of items) if (itemMatchesQuery(row.it, query, row.section ?? "")) hits++;
  return { ms: now() - t0, hits, items: items.length, terms: query.and.map((t) => t.alts[0]?.value) };
}

export function countQueries(items: Countable[], qs: string[]): number[] {
  const compiled = qs.map(compileQuery);
  const out = compiled.map(() => 0);
  for (const row of items) {
    const section = row.section ?? "";
    for (let i = 0; i < compiled.length; i++) {
      if (itemMatchesQuery(row.it, compiled[i], section)) out[i]++;
    }
  }
  return out;
}

function now() {
  const p = (globalThis as { performance?: { now: () => number } }).performance;
  return p ? p.now() : Date.now();
}

/** Agency / topic chips. Hide any with zero hits in the full log, except Cyber, which always shows. */
export const QUICK_SEARCH_CANDIDATES: { id: string; label: string; q: string; always?: boolean }[] = [
  { id: "nws", label: "NWS", q: "NWS" },
  { id: "fema", label: "FEMA", q: "FEMA" },
  { id: "cdc", label: "CDC", q: "CDC" },
  { id: "who", label: "WHO", q: "WHO" },
  { id: "dhs", label: "DHS", q: "DHS" },
  { id: "cisa", label: "CISA", q: "CISA" },
  { id: "fbi", label: "FBI", q: "FBI" },
  { id: "faa", label: "FAA", q: "FAA" },
  { id: "cyber", label: "Cyber", q: "cyber", always: true },
];

export function quickQueryActive(current: string, buttonQ: string): boolean {
  return foldSearch(current.trim()) === foldSearch(buttonQ.trim());
}
