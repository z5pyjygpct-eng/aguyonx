import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { decodeCompact, encodeCompact, etDate } from "./emergency-format.mjs";
import { split, readAllEntries } from "./split-emergency-archive.mjs";

const it = (title, status, extra = {}) => ({ severity: "HIGH", title, location: "Virginia, USA", type: "Cyber", summary: "s", status, links: [{ url: "https://x.com/a/status/1", label: "@a" }, { url: "https://x.com/b" }], ...extra });
const entries = [
  { datetime: "2026-11-17T01:15:00-05:00", regions: { America: [it("A", "note 3"), it("A", "note 3")], Europe: [] }, trending: [it("T", "x")] },
  { datetime: "2026-11-16T23:15:00-05:00", regions: { America: [it("A", "note 2", { odd: 1 })] }, threats: [{ text: "plain" }], misc: true },
  { datetime: "2026-11-13T10:15:00-05:00", regions: { America: [it("A", "note 1")] } },
];

test("compact round-trips exactly, including per-window status notes", () => {
  assert.deepEqual(decodeCompact(JSON.parse(JSON.stringify(encodeCompact(entries)))), entries);
});

test("ET dates", () => {
  assert.equal(etDate("2026-11-17T01:15:00-05:00"), "2026-11-17");
  assert.equal(etDate("2026-11-17T03:15:00Z"), "2026-11-16");
});

test("split is lossless and idempotent", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "em-split-"));
  const main = path.join(dir, "log.json");
  const archive = path.join(dir, "archive");
  fs.writeFileSync(main, JSON.stringify({ entries }, null, 2));
  const log = () => {};
  split({ main, archive, hours: 48, log });
  assert.equal(JSON.parse(fs.readFileSync(main, "utf8")).entries.length, 2);
  assert.deepEqual(fs.readdirSync(archive).sort(), ["2026-11-13.json", "index.json"]);
  assert.deepEqual(readAllEntries({ main, archive }), entries);
  assert.equal(split({ main, archive, hours: 48, log }).changed, 0);
  fs.rmSync(dir, { recursive: true });
});
