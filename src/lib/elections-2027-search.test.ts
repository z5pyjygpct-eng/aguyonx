import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { EMPTY, filterEntries, flatten, OFFICE_ORDER, type Office, type OfficeFile } from "./elections-2027.ts";
import { editDistance, highlight, norm, parseQuery, raceMatchesQuery, searchEntries, summary, typoBudget, wordMatches } from "./elections-2027-search.ts";

const load = (o: Office) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${o}.json`), "utf8")) as OfficeFile;
const all = flatten(Object.fromEntries(OFFICE_ORDER.map((o) => [o, load(o)])) as Record<Office, OfficeFile>);
const ids = (q: string) => searchEntries(all, q).entries.map((e) => e.race.id);

test("query parsing: district forms", () => {
  const d = (q: string) => parseQuery(q).filter((t) => t.kind === "district").map((t) => (t.kind === "district" ? `${t.chamber ?? "any"}-${t.n}` : ""));
  assert.deepEqual(d("HD 30"), ["house-30"]);
  assert.deepEqual(d("hd30"), ["house-30"]);
  assert.deepEqual(d("HD-30"), ["house-30"]);
  assert.deepEqual(d("House 30"), ["house-30"]);
  assert.deepEqual(d("House District 30"), ["house-30"]);
  assert.deepEqual(d("SD 31"), ["senate-31"]);
  assert.deepEqual(d("Senate District 31"), ["senate-31"]);
  assert.deepEqual(d("District 30"), ["any-30"]);
  assert.deepEqual(d("30"), ["any-30"]);
});

test("query parsing: status, party and office words", () => {
  const k = (q: string) => parseQuery(q).map((t) => `${t.kind}:${"value" in t ? t.value : "w" in t ? t.w : ""}`);
  assert.deepEqual(k("open"), ["status:open"]);
  assert.deepEqual(k("Contested"), ["status:contested"]);
  assert.deepEqual(k("no filing"), ["status:none"]);
  assert.deepEqual(k("Republican"), ["party:R"]);
  assert.deepEqual(k("school board loudoun"), ["office:sb", "word:loudoun"]);
  assert.deepEqual(k("  McAuliff!! "), ["word:mcauliff"]);
});

test("fuzzy matching: edit distance and typo budget by word length", () => {
  assert.equal(editDistance("helmer", "helmer"), 0);
  assert.equal(editDistance("helmr", "helmer"), 1);
  assert.equal(editDistance("hlemer", "helmer"), 1, "a swapped pair is one edit");
  assert.equal(editDistance("kershnr", "kershner"), 1);
  assert.equal(editDistance("abc", "xyz", 2), 3);
  assert.deepEqual([3, 4, 5, 7, 8, 12].map(typoBudget), [0, 0, 1, 1, 2, 2]);
  assert.ok(wordMatches("helmr", "helmer"));
  assert.ok(wordMatches("helm", "helmer"), "prefix");
  assert.ok(!wordMatches("hel", "hal"), "short words must be exact");
  assert.ok(wordMatches("letourneu", "letourneau"));
  assert.equal(norm("St. John-Cunning, Marcia"), "st john cunning marcia");
  assert.equal(norm("Vásquez"), "vasquez");
});

test("Helmer returns his race card: one race, House District 10, with the current member", () => {
  assert.deepEqual(ids("Helmer"), ["hd10"]);
  assert.deepEqual(ids("helmr"), ["hd10"], "typo");
  assert.deepEqual(ids("HELMER."), ["hd10"], "case and punctuation");
  assert.equal(summary(1, "Helmer"), "1 race matches “Helmer”");
  assert.equal(summary(3, " x "), "3 races match “x”");
});

test("district searches return the right races", () => {
  assert.deepEqual(ids("HD 30"), ["hd30"]);
  assert.deepEqual(ids("SD 31"), ["sd31"]);
  assert.deepEqual(ids("House 30"), ["hd30"]);
  assert.deepEqual(ids("District 30").sort(), ["hd30", "sd30"]);
  assert.deepEqual(ids("30").sort(), ["hd30", "sd30"]);
});

test("names, localities, seats, offices and status words", () => {
  assert.ok(ids("Loudoun").includes("hd30") && ids("Loudoun").includes("loudoun-sheriff"), "locality covers House districts too");
  assert.deepEqual(ids("loudoun sheriff"), ["loudoun-sheriff"]);
  assert.deepEqual(searchEntries(all, "Hunter Mill").entries.map((e) => e.office).sort(), ["bos", "sb"]);
  assert.ok(ids("Kershner").includes("loudoun-catoctin"));
  assert.ok(searchEntries(all, "contested").entries.every((e) => e.status === "contested"));
  assert.ok(searchEntries(all, "no filing").entries.every((e) => e.status === "none"));
  assert.ok(searchEntries(all, "open").entries.every((e) => e.race.members_known && e.race.candidates.length));
  assert.equal(searchEntries(all, "zzqqxx").entries.length, 0);
  assert.equal(searchEntries(all, "").entries.length, all.length);
});

test("search combines with the filter pills (AND)", () => {
  const f = { ...EMPTY, offices: ["bos" as Office], match: (e: (typeof all)[number]) => raceMatchesQuery(e, "loudoun") };
  const out = filterEntries(all, f);
  assert.ok(out.length === 9 && out.every((e) => e.office === "bos" && e.race.locality_id === "loudoun"));
});

test("highlight marks the matched words only", () => {
  const terms = parseQuery("helmr");
  const parts = highlight("Dan Helmer", terms);
  assert.deepEqual(parts.filter((p) => p.hit).map((p) => p.t), ["Helmer"]);
  assert.deepEqual(highlight("House District 30", parseQuery("HD 30")).filter((p) => p.hit).map((p) => p.t), ["30"]);
});
