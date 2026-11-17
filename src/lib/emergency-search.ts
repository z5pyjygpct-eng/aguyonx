/** Deep search over Emergency Monitor alerts. No extra dependencies. */

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

const BLOB = new WeakMap<object, string>();

/** Lowercase and strip diacritics so "café" matches "cafe". */
export function foldSearch(s: string): string {
  return s.normalize("NFD").replace(/\p{M}+/gu, "").toLowerCase();
}

/**
 * Unquoted words are ANDed. "Quoted phrases" stay together.
 * An unclosed quote treats the rest of the query as one phrase.
 */
export function parseSearchTerms(q: string): string[] {
  const src = q.trim();
  if (!src) return [];
  const terms: string[] = [];
  let i = 0;
  while (i < src.length) {
    while (i < src.length && /\s/.test(src[i])) i++;
    if (i >= src.length) break;
    if (src[i] === '"') {
      const end = src.indexOf('"', i + 1);
      const raw = (end === -1 ? src.slice(i + 1) : src.slice(i + 1, end)).trim();
      i = end === -1 ? src.length : end + 1;
      const t = foldSearch(raw);
      if (t) terms.push(t);
      continue;
    }
    const start = i;
    while (i < src.length && !/\s/.test(src[i]) && src[i] !== '"') i++;
    const raw = src.slice(start, i).replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    const t = foldSearch(raw);
    if (t) terms.push(t);
  }
  return terms;
}

const SKIP_HANDLE = /^(i|intent|share|search|hashtag|explore|home|compose|settings|privacy)$/i;
const X_HOST = /(?:^|\.)(?:x|twitter)\.com$/i;

export function handlesFromUrl(url: string): string[] {
  try {
    const u = new URL(url);
    if (!X_HOST.test(u.hostname)) return [];
    const first = u.pathname.split("/").filter(Boolean)[0] ?? "";
    if (!first || SKIP_HANDLE.test(first)) return [];
    return [first];
  } catch {
    return [];
  }
}

function linkBlob(l: { url: string; label?: string }): string {
  const parts: string[] = [];
  if (l.label) parts.push(l.label);
  if (l.url) parts.push(l.url);
  for (const h of handlesFromUrl(l.url)) {
    parts.push(h, `@${h}`);
  }
  return parts.join("\n");
}

/** Build (and memoize) the folded haystack for one alert. Call only when a query is active. */
export function searchBlob(it: SearchableItem): string {
  const cached = BLOB.get(it);
  if (cached !== undefined) return cached;
  const parts: string[] = [];
  if (it.title) parts.push(it.title);
  if (it.summary) parts.push(it.summary);
  if (it.text) parts.push(it.text);
  if (it.location) parts.push(it.location);
  if (it.status) parts.push(it.status);
  if (it.type) parts.push(it.type);
  if (it.severity) parts.push(it.severity);
  for (const l of it.links ?? []) parts.push(linkBlob(l));
  const blob = foldSearch(parts.join("\n"));
  BLOB.set(it, blob);
  return blob;
}

export function itemMatchesTerms(it: SearchableItem, terms: string[]): boolean {
  if (!terms.length) return true;
  const hay = searchBlob(it);
  return terms.every((t) => hay.includes(t));
}

export function linkMatchesTerms(l: { url: string; label?: string }, terms: string[]): boolean {
  if (!terms.length) return false;
  const hay = foldSearch(linkBlob(l));
  return terms.some((t) => hay.includes(t));
}

/** Split `text` into plain/hit slices for wrapping matches in <mark>. */
export function splitHighlights(text: string, terms: string[]): { t: string; hit: boolean }[] {
  if (!text) return [];
  if (!terms.length) return [{ t: text, hit: false }];
  const unique = [...new Set(terms.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!unique.length) return [{ t: text, hit: false }];

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
  const hits = new Uint8Array(text.length);
  for (const term of unique) {
    let from = 0;
    while (from <= folded.length - term.length) {
      const at = folded.indexOf(term, from);
      if (at < 0) break;
      const start = origAt[at];
      const endOrig = origAt[at + term.length - 1];
      if (start != null && endOrig != null) {
        for (let i = start; i <= endOrig; i++) hits[i] = 1;
      }
      from = at + 1;
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

export function timeSearch(items: SearchableItem[], q: string) {
  const terms = parseSearchTerms(q);
  const t0 = now();
  let hits = 0;
  for (const it of items) if (itemMatchesTerms(it, terms)) hits++;
  return { ms: now() - t0, hits, items: items.length, terms };
}

function now() {
  const p = (globalThis as { performance?: { now: () => number } }).performance;
  return p ? p.now() : Date.now();
}
