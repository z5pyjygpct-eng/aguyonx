/**
 * Site search → Find the Moment transcripts. Client side, lazy: nothing loads until the first search.
 * Index built at deploy by tools/search-ftm/build.mjs (public/files/search/ftm): meta.json (one row per
 * transcribed meeting) + 2-letter shards s/<ab>.json (3-letter s/<abc>.json for big prefixes listed in meta.split) mapping word → [meetingIdx, window idxs (delta)...].
 * Snippets come from the meeting's own transcript windows file, fetched only for meetings on screen.
 * Captions/transcripts are machine speech-to-text: an index, not quotes.
 */
const BASE = "/files/search/ftm";
type Venue = { id: string; label: string; page: string };
type MetaRow = [number, string, string, string | null, string, number];
type Meta = { v: number; split: string[]; venues: Venue[]; m: MetaRow[] };
type Shard = Record<string, number[][]>;

export type FtmMeetingHit = { idx: number; venue: Venue; dateLabel: string; title: string; jumpTpl: string | null; windowsUrl: string; windows: number[] };
export type FtmResult = { meetings: FtmMeetingHit[]; moments: number; byVenue: { venue: Venue; meetings: number; moments: number }[]; terms: string[] };
export type FtmSnippet = { text: string; start: number; href: string };

const STOP = new Set("the and for that this with you are was have not but they all can our from his her its she him had has were will would there their what when who which about into been one out just also them then than your yes okay thank thanks very well know like going get got need want said say see did does here how why way may any some more most much now only other over such these those through too two three four five six seven eight nine ten use used make made let lets yeah uh um mrs mr ms".split(" "));
const fold = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

let metaP: Promise<Meta> | null = null;
const shardP = new Map<string, Promise<Shard>>();
const winP = new Map<string, Promise<{ start: number; end: number; text: string }[]>>();
export const ftmStats = { metaBytes: 0, shardBytes: 0, snippetBytes: 0, lastMs: 0 };

async function getJson<T>(url: string, bucket: "metaBytes" | "shardBytes" | "snippetBytes"): Promise<T> {
  const r = await fetch(url);
  if (r.status === 404) return {} as T;
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  const t = await r.text();
  ftmStats[bucket] += t.length;
  return JSON.parse(t) as T;
}
const meta = () => (metaP ??= getJson<Meta>(`${BASE}/meta.json`, "metaBytes").catch((e) => { metaP = null; throw e; }));
function shard(k: string) {
  let p = shardP.get(k);
  if (!p) { p = getJson<Shard>(`${BASE}/s/${k}.json`, "shardBytes").catch((e) => { shardP.delete(k); throw e; }); shardP.set(k, p); }
  return p;
}

export function ftmTerms(raw: string): string[] {
  return [...new Set(fold(raw).split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !STOP.has(t)))];
}

/** Every transcribed meeting where all words appear in the same transcript window (words match as prefixes). */
export async function searchFtm(raw: string): Promise<FtmResult | null> {
  const terms = ftmTerms(raw);
  if (!terms.length) return null;
  const t0 = performance.now();
  const M = await meta();
  const key = (t: string) => (M.split.includes(t.slice(0, 2)) ? t.slice(0, 3) : t.slice(0, 2));
  const shards = await Promise.all(terms.map((t) => shard(key(t))));
  let acc: Map<number, Set<number>> | null = null;
  terms.forEach((term, i) => {
    const cur = new Map<number, Set<number>>();
    for (const [tok, rows] of Object.entries(shards[i])) {
      if (!tok.startsWith(term)) continue;
      for (const [mi, ...d] of rows) {
        let set = cur.get(mi); if (!set) cur.set(mi, (set = new Set()));
        let w = 0; d.forEach((x, k) => { w = k ? w + x : x; set!.add(w); });
      }
    }
    if (!acc) { acc = cur; return; }
    const next = new Map<number, Set<number>>();
    for (const [mi, ws] of acc) { const o = cur.get(mi); if (!o) continue; const both = new Set([...ws].filter((w) => o.has(w))); if (both.size) next.set(mi, both); }
    acc = next;
  });
  const meetings: FtmMeetingHit[] = [...(acc ?? new Map<number, Set<number>>())].map(([mi, ws]) => {
    const r = M.m[mi];
    return { idx: mi, venue: M.venues[r[0]], dateLabel: r[1], title: r[2], jumpTpl: r[3], windowsUrl: r[4], windows: [...ws].sort((a, b) => a - b) };
  });
  meetings.sort((a, b) => b.windows.length - a.windows.length || Date.parse(b.dateLabel) - Date.parse(a.dateLabel));
  const byV = new Map<string, { venue: Venue; meetings: number; moments: number }>();
  for (const h of meetings) { const e = byV.get(h.venue.id) ?? { venue: h.venue, meetings: 0, moments: 0 }; e.meetings++; e.moments += h.windows.length; byV.set(h.venue.id, e); }
  ftmStats.lastMs = Math.round(performance.now() - t0);
  return { meetings, moments: meetings.reduce((a, h) => a + h.windows.length, 0), byVenue: [...byV.values()].sort((a, b) => b.moments - a.moments), terms };
}

export const jumpHref = (h: FtmMeetingHit, start: number, q: string) =>
  h.jumpTpl ? h.jumpTpl.replace("{s}", String(Math.max(0, Math.floor(start)))) : `${h.venue.page}?q=${encodeURIComponent(q)}`;

/** First matching window's text, trimmed around the first term. */
export async function ftmSnippet(h: FtmMeetingHit, terms: string[], q: string): Promise<FtmSnippet | null> {
  let p = winP.get(h.windowsUrl);
  if (!p) { p = getJson(h.windowsUrl, "snippetBytes"); winP.set(h.windowsUrl, p); }
  const wins = await p;
  const w = wins[h.windows[0]];
  if (!w) return null;
  const f = fold(w.text);
  const at = Math.max(0, f.search(new RegExp(`\\b${terms[0]}`)));
  const a = Math.max(0, at - 90), b = Math.min(w.text.length, at + 150);
  return { text: `${a ? "…" : ""}${w.text.slice(a, b).trim()}${b < w.text.length ? "…" : ""}`, start: w.start, href: jumpHref(h, w.start, q) };
}
