/**
 * Shared helpers for the Emergency Monitor storage split.
 * See docs/emergency-archive-format.md.
 */
export const ET_ZONE = "America/New_York";
export const MAIN_HOURS = 48;
export const MAX_ARCHIVE_FILE_BYTES = 40 * 1024 * 1024;

/** America/New_York calendar date (YYYY-MM-DD) of an ISO datetime. */
export function etDate(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) throw new Error(`Bad datetime: ${iso}`);
  return new Date(t).toLocaleDateString("en-CA", { timeZone: ET_ZONE });
}

export function byNewest(a, b) {
  return Date.parse(b.datetime) - Date.parse(a.datetime);
}

/** Items of one window, in display-independent storage order. */
export function entryItemCount(e) {
  let n = 0;
  for (const k of Object.keys(e.regions ?? {})) n += (e.regions[k] ?? []).length;
  n += (e.trending ?? []).length + (e.threats ?? []).length;
  return n;
}

const ITEM_FIELDS = ["title", "summary", "location", "type", "severity", "status", "text"];
const TRENDING = "#trending";
const THREATS = "#threats";

/**
 * Compact, deduplicated runtime encoding (v1). Every distinct string is
 * stored once (`s`), every distinct alert snapshot once (`i`), and each window
 * lists the snapshots it contains, in order. Decoding gives back the exact
 * same entries (same fields, same values, same order within each section).
 *
 *   { v: 1, s: string[], l: number[][], i: number[][], w: Window[] }
 *   item  = [title, summary, location, type, severity, status, text, links, extra?]
 *           (string index into s, or -1; links = index into l or -1;
 *            extra = s index of a JSON object with any other keys / non-string values)
 *   l[k]  = [url, label, url, label, ...] (s indexes; label -1 when absent)
 *   Window = [datetime, [sectionName(s idx), item, item, ...], ..., ] — sectionName is a
 *           region key, or "#trending" / "#threats". An entry's other top-level keys, if any,
 *           are kept as an object in a final {"x": sIdx} element.
 */
export function encodeCompact(entries) {
  const s = [];
  const sIdx = new Map();
  const str = (v) => {
    let k = sIdx.get(v);
    if (k === undefined) {
      k = s.length;
      s.push(v);
      sIdx.set(v, k);
    }
    return k;
  };
  const l = [];
  const lIdx = new Map();
  const i = [];
  const iIdx = new Map();
  const encItem = (it) => {
    const extra = {};
    const row = [];
    for (const f of ITEM_FIELDS) {
      const v = it[f];
      if (v === undefined) row.push(-1);
      else if (typeof v === "string") row.push(str(v));
      else {
        row.push(-1);
        extra[f] = v;
      }
    }
    const links = it.links;
    if (links === undefined) row.push(-1);
    else if (
      Array.isArray(links) &&
      links.every((x) => x && typeof x.url === "string" && (x.label === undefined || typeof x.label === "string") && Object.keys(x).every((k) => k === "url" || k === "label"))
    ) {
      const flat = [];
      for (const x of links) flat.push(str(x.url), x.label === undefined ? -1 : str(x.label));
      const key = flat.join(",");
      let k = lIdx.get(key);
      if (k === undefined) {
        k = l.length;
        l.push(flat);
        lIdx.set(key, k);
      }
      row.push(k);
    } else {
      row.push(-1);
      extra.links = links;
    }
    for (const k of Object.keys(it)) if (!ITEM_FIELDS.includes(k) && k !== "links") extra[k] = it[k];
    if (Object.keys(extra).length) row.push(str(JSON.stringify(extra)));
    const key = row.join(",");
    let k = iIdx.get(key);
    if (k === undefined) {
      k = i.length;
      i.push(row);
      iIdx.set(key, k);
    }
    return k;
  };
  const w = [];
  for (const e of entries) {
    const win = [e.datetime];
    for (const r of Object.keys(e.regions ?? {})) {
      const items = e.regions[r];
      if (!Array.isArray(items)) continue;
      win.push([str(r), ...items.map(encItem)]);
    }
    if (Array.isArray(e.trending)) win.push([str(TRENDING), ...e.trending.map(encItem)]);
    if (Array.isArray(e.threats)) win.push([str(THREATS), ...e.threats.map(encItem)]);
    const extra = {};
    for (const k of Object.keys(e)) if (!["datetime", "regions", "trending", "threats"].includes(k)) extra[k] = e[k];
    if (Object.keys(extra).length) win.push({ x: str(JSON.stringify(extra)) });
    w.push(win);
  }
  return { v: 1, s, l, i, w };
}

/** Inverse of encodeCompact (kept in sync with src/lib/emergency-data.ts). */
export function decodeCompact(c) {
  const { s, l, i } = c;
  const decItem = (k) => {
    const row = i[k];
    const it = {};
    ITEM_FIELDS.forEach((f, n) => {
      if (row[n] >= 0) it[f] = s[row[n]];
    });
    if (row[7] >= 0) {
      const flat = l[row[7]];
      const links = [];
      for (let n = 0; n < flat.length; n += 2) links.push(flat[n + 1] >= 0 ? { url: s[flat[n]], label: s[flat[n + 1]] } : { url: s[flat[n]] });
      it.links = links;
    }
    if (row.length > 8) Object.assign(it, JSON.parse(s[row[8]]));
    return it;
  };
  return c.w.map((win) => {
    const e = { datetime: win[0] };
    for (let n = 1; n < win.length; n++) {
      const sec = win[n];
      if (!Array.isArray(sec)) {
        Object.assign(e, JSON.parse(s[sec.x]));
        continue;
      }
      const name = s[sec[0]];
      const items = sec.slice(1).map(decItem);
      if (name === TRENDING) e.trending = items;
      else if (name === THREATS) e.threats = items;
      else (e.regions ??= {})[name] = items;
    }
    return e;
  });
}
