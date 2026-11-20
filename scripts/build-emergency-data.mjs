#!/usr/bin/env node
/**
 * Emergency Monitor runtime data (generated at every `vite build`; git-ignored output).
 * See docs/emergency-archive-format.md.
 *
 * Inputs (committed, canonical): src/content/emergency-log.json + data/emergency-archive/*.json.
 * Outputs:
 *   - the `virtual:emergency-head` module (bundled into the page): a manifest of every window
 *     (datetime, item count, which file holds it) plus the newest window only, compact-encoded (what the first screen shows).
 *   - public/emergency-data/recent.<hash>.json : windows within 24h of the newest (compact)
 *   - public/emergency-data/day-YYYY-MM-DD.<hash>.json : each older America/New_York day (compact)
 * Content hashes in the names make every file immutable, so the CDN can cache them for a year.
 * The runtime grouping does not depend on how many hours the main file keeps.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { encodeCompact, entryItemCount, etDate } from "./emergency-format.mjs";
import { DEFAULT_ARCHIVE, DEFAULT_MAIN, readAllEntries } from "./split-emergency-archive.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const OUT_DIR = path.join(ROOT, "public/emergency-data");
export const PUBLIC_PREFIX = "/emergency-data/";
const RECENT_HOURS = 24;
/** Runtime files above this are split into parts so no single fetch is huge. */
const MAX_RUNTIME_FILE_BYTES = 8 * 1024 * 1024;

function hash(body) {
  return crypto.createHash("sha256").update(body).digest("hex").slice(0, 12);
}

export function buildEmergencyData({ main = DEFAULT_MAIN, archive = DEFAULT_ARCHIVE, outDir = OUT_DIR, write = true, log = console.log } = {}) {
  const t0 = Date.now();
  const all = readAllEntries({ main, archive });
  const newest = all.length ? Date.parse(all[0].datetime) : 0;
  const within = (e, h) => newest - Date.parse(e.datetime) <= h * 3600 * 1000;
  const groups = new Map(); // key -> entries
  for (const e of all) {
    const key = within(e, RECENT_HOURS) ? "recent" : `day-${etDate(e.datetime)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }
  const files = [];
  const windows = [];
  if (write) {
    fs.rmSync(outDir, { recursive: true, force: true });
    fs.mkdirSync(outDir, { recursive: true });
  }
  let total = 0;
  const emit = (key, entries) => {
    const body = JSON.stringify(encodeCompact(entries));
    if (Buffer.byteLength(body) > MAX_RUNTIME_FILE_BYTES && entries.length > 1) {
      // Split a large group into parts (key-1, key-2, ...) by halving until each fits.
      const mid = Math.ceil(entries.length / 2);
      return [...emit(`${key}-a`, entries.slice(0, mid)), ...emit(`${key}-b`, entries.slice(mid))];
    }
    return [{ key, entries, body }];
  };
  for (const [key, group] of groups) {
    const parts = emit(key, group);
    parts.forEach((part, n) => {
      const partKey = parts.length > 1 ? `${key}-${n + 1}` : key;
      const name = `${partKey}.${hash(part.body)}.json`;
      if (write) fs.writeFileSync(path.join(outDir, name), part.body);
      total += part.body.length;
      const f = files.length;
      files.push({ key: partKey, url: PUBLIC_PREFIX + name, bytes: Buffer.byteLength(part.body) });
      for (const e of part.entries) windows.push([e.datetime, entryItemCount(e), f]);
    });
  }
  const head = {
    v: 1,
    newest: all[0]?.datetime ?? null,
    files,
    windows, // [datetime, itemCount, fileIndex], newest first
    head: encodeCompact(all.slice(0, 1)),
  };
  log(`[emergency-data] ${all.length} windows -> ${files.length} files, ${(total / 1e6).toFixed(1)} MB compact; head ${(JSON.stringify(head).length / 1e3).toFixed(0)} KB (${Date.now() - t0} ms)`);
  return head;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const head = buildEmergencyData();
  if (process.argv.includes("--head")) fs.writeFileSync(path.join(OUT_DIR, "head.json"), JSON.stringify(head));
}
