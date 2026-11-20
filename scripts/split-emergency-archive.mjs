#!/usr/bin/env node
/**
 * Emergency Monitor storage split (idempotent). See docs/emergency-archive-format.md.
 *
 *   node scripts/split-emergency-archive.mjs [--hours 48] [--main path] [--archive dir] [--check]
 *
 * Reads src/content/emergency-log.json plus every day file in data/emergency-archive/,
 * merges them by window datetime (the main file wins when a window is in both), then writes:
 *   - src/content/emergency-log.json : windows within --hours (default 48) of the newest window,
 *                                       same schema as before ({"entries":[...]}), newest first, minified
 *   - data/emergency-archive/YYYY-MM-DD.json : {"date","entries"} for every older window, grouped by
 *                                       America/New_York calendar date, newest first, minified.
 *                                       A day over 40 MB is written as YYYY-MM-DD-1.json, -2.json, ...
 *   - data/emergency-archive/index.json : {"days":[{"date","files","count","first","last"}]}, newest first
 *
 * Running it twice in a row changes nothing (files are only rewritten when their bytes change).
 * --check exits 1 if anything would change, without writing.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MAIN_HOURS, MAX_ARCHIVE_FILE_BYTES, byNewest, entryItemCount, etDate } from "./emergency-format.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_MAIN = path.join(ROOT, "src/content/emergency-log.json");
export const DEFAULT_ARCHIVE = path.join(ROOT, "data/emergency-archive");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

/** All windows from the main file and the archive, deduplicated by datetime, newest first. */
export function readAllEntries({ main = DEFAULT_MAIN, archive = DEFAULT_ARCHIVE } = {}) {
  const byDt = new Map();
  const add = (e, wins) => {
    if (!e || typeof e.datetime !== "string") throw new Error("Entry without datetime");
    if (wins || !byDt.has(e.datetime)) byDt.set(e.datetime, e);
  };
  if (fs.existsSync(archive)) {
    for (const f of fs.readdirSync(archive).sort()) {
      if (!/^\d{4}-\d{2}-\d{2}(-\d+)?\.json$/.test(f)) continue;
      const j = JSON.parse(fs.readFileSync(path.join(archive, f), "utf8"));
      for (const e of j.entries ?? []) add(e, false);
    }
  }
  const mainJson = fs.existsSync(main) ? JSON.parse(fs.readFileSync(main, "utf8")) : { entries: [] };
  for (const e of mainJson.entries ?? []) add(e, true);
  return [...byDt.values()].sort(byNewest);
}

/** Split entries into main (newest `hours`) and per-ET-day archive groups. */
export function planSplit(entries, hours = MAIN_HOURS) {
  const newest = entries.length ? Date.parse(entries[0].datetime) : 0;
  const limit = hours * 60 * 60 * 1000;
  const main = [];
  const days = new Map();
  for (const e of entries) {
    const t = Date.parse(e.datetime);
    if (Number.isNaN(t)) throw new Error(`Bad datetime: ${e.datetime}`);
    if (newest - t <= limit) main.push(e);
    else {
      const d = etDate(e.datetime);
      if (!days.has(d)) days.set(d, []);
      days.get(d).push(e);
    }
  }
  return { main, days };
}

/** Day -> [{file, body}] chunks under the size cap. */
function dayFiles(date, entries) {
  const whole = JSON.stringify({ date, entries });
  if (Buffer.byteLength(whole) <= MAX_ARCHIVE_FILE_BYTES) return [{ file: `${date}.json`, body: whole, entries }];
  const parts = [];
  let cur = [];
  let size = 0;
  for (const e of entries) {
    const n = Buffer.byteLength(JSON.stringify(e)) + 1;
    if (cur.length && size + n > MAX_ARCHIVE_FILE_BYTES - 1024) {
      parts.push(cur);
      cur = [];
      size = 0;
    }
    cur.push(e);
    size += n;
  }
  if (cur.length) parts.push(cur);
  return parts.map((p, k) => ({ file: `${date}-${k + 1}.json`, body: JSON.stringify({ date, entries: p }), entries: p }));
}

export function split({ main = DEFAULT_MAIN, archive = DEFAULT_ARCHIVE, hours = MAIN_HOURS, check = false, log = console.log } = {}) {
  const all = readAllEntries({ main, archive });
  const plan = planSplit(all, hours);
  const writes = new Map(); // abs path -> body
  writes.set(main, JSON.stringify({ entries: plan.main }));
  const index = { days: [] };
  for (const [date, entries] of [...plan.days.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1))) {
    const files = dayFiles(date, entries);
    for (const f of files) writes.set(path.join(archive, f.file), f.body);
    index.days.push({
      date,
      files: files.map((f) => f.file),
      count: entries.length,
      items: entries.reduce((n, e) => n + entryItemCount(e), 0),
      first: entries[entries.length - 1].datetime,
      last: entries[0].datetime,
    });
  }
  writes.set(path.join(archive, "index.json"), JSON.stringify(index, null, 1) + "\n");
  const keep = new Set(writes.keys());
  const removes = fs.existsSync(archive)
    ? fs.readdirSync(archive).filter((f) => /^\d{4}-\d{2}-\d{2}(-\d+)?\.json$/.test(f)).map((f) => path.join(archive, f)).filter((p) => !keep.has(p))
    : [];
  const changed = [];
  for (const [p, body] of writes) {
    const cur = fs.existsSync(p) ? fs.readFileSync(p, "utf8") : null;
    if (cur !== body) changed.push(p);
  }
  for (const [p, body] of writes) {
    if (Buffer.byteLength(body) > 45 * 1024 * 1024) throw new Error(`${path.relative(ROOT, p)} would be ${Buffer.byteLength(body)} bytes (cap 45 MB)`);
  }
  if (!check) {
    fs.mkdirSync(archive, { recursive: true });
    for (const p of changed) fs.writeFileSync(p, writes.get(p));
    for (const p of removes) fs.rmSync(p);
  }
  log(
    `${check ? "[check] " : ""}main: ${plan.main.length} windows (${Buffer.byteLength(writes.get(main))} bytes); archive: ${index.days.length} days, ${index.days.reduce((n, d) => n + d.count, 0)} windows; ${changed.length} file(s) ${check ? "would change" : "written"}, ${removes.length} removed`,
  );
  for (const p of [...changed, ...removes]) log(`  ${removes.includes(p) ? "removed" : "wrote"} ${path.relative(ROOT, p)}`);
  return { changed: changed.length + removes.length, plan, index };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  const r = split({
    main: path.resolve(arg("main", DEFAULT_MAIN)),
    archive: path.resolve(arg("archive", DEFAULT_ARCHIVE)),
    hours: Number(arg("hours", MAIN_HOURS)),
    check,
  });
  if (check && r.changed) process.exit(1);
}
