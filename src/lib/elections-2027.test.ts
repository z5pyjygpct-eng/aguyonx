import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  EMPTY, facetCount, filterEntries, flatten, groupEntries, isOpen, localityOptions, matches, OFFICE_ORDER, parseDirSearch, statusOf, toFilters, toggle,
  type Entry, type Office, type OfficeFile, type Race,
} from "./elections-2027.ts";

const load = (o: Office) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${o}.json`), "utf8")) as OfficeFile;
const files = Object.fromEntries(OFFICE_ORDER.map((o) => [o, load(o)])) as Record<Office, OfficeFile>;
const all = flatten(files);

test("every race from all five official files is in the directory once", () => {
  const total = OFFICE_ORDER.reduce((n, o) => n + files[o].races.length, 0);
  assert.equal(all.length, total);
  assert.equal(new Set(all.map((e) => e.office + ":" + e.race.id)).size, total);
});

test("no VPAP source survives anywhere in the data", () => {
  for (const o of OFFICE_ORDER) assert.doesNotMatch(JSON.stringify(files[o]), /vpap/i, o);
});

test("every race keeps an official seat source and filing source", () => {
  for (const e of all) {
    assert.match(e.race.source_url, /^https:\/\//, e.race.id);
    assert.match(e.race.filing_source_url, /elections\.virginia\.gov/, e.race.id);
  }
});

test("status comes only from filings: no filing is never contested or open", () => {
  const blank: Race = { id: "x", seat: "X", seats: 1, source_url: "https://a", filing_source_url: "https://b", candidates: [] };
  assert.equal(statusOf(blank, "bos"), "none");
  assert.equal(isOpen(blank), false);
  const two: Race = { ...blank, candidates: [{ name: "A", incumbent: false, party: "D", party_source_url: "u", filing_source_url: "u" }, { name: "B", incumbent: true, party: "R", party_source_url: "u", filing_source_url: "u" }] };
  assert.equal(statusOf(two, "bos"), "contested");
  assert.equal(isOpen(two), false);
  assert.equal(statusOf({ ...two, seats: 2 }, "sb"), "unopposed");
});

test("status partitions cover every race exactly once", () => {
  const c = filterEntries(all, { ...EMPTY, statuses: ["contested"] }).length;
  const one = filterEntries(all, { ...EMPTY, statuses: ["one"] }).length;
  const none = filterEntries(all, { ...EMPTY, statuses: ["none"] }).length;
  assert.equal(c + one + none, all.length);
});

test("pills in one row widen (OR) and rows narrow (AND)", () => {
  const lou = filterEntries(all, { ...EMPTY, localities: ["loudoun"] });
  const ffx = filterEntries(all, { ...EMPTY, localities: ["fairfax-county"] });
  const both = filterEntries(all, { ...EMPTY, localities: ["loudoun", "fairfax-county"] });
  assert.equal(both.length, lou.length + ffx.length);
  const louBos = filterEntries(all, { ...EMPTY, localities: ["loudoun"], offices: ["bos"] });
  assert.ok(louBos.length > 0 && louBos.every((e) => e.office === "bos" && e.race.locality_id === "loudoun"));
  assert.equal(facetCount(all, EMPTY, "localities", "loudoun"), lou.length);
});

test("shared offices show under the city too, without a duplicate race", () => {
  const city = filterEntries(all, { ...EMPTY, localities: ["fairfax-city"] });
  assert.deepEqual(city.map((e) => e.race.id).sort(), ["fairfax-county-commonwealth-s-attorney", "fairfax-county-sheriff"]);
  const man = filterEntries(all, { ...EMPTY, localities: ["manassas"] });
  assert.deepEqual(man.map((e) => e.race.id).sort(), ["prince-william-commonwealth-s-attorney", "prince-william-sheriff"]);
  assert.ok(!all.some((e) => e.race.id.startsWith("fairfax-city-") || e.race.id.startsWith("manassas-")));
});

test("search matches district number, office, locality and seat", () => {
  const q = (s: string) => filterEntries(all, { ...EMPTY, q: s });
  assert.deepEqual(q("House District 45").map((e) => e.race.id), ["hd45"]);
  assert.ok(q("45").some((e) => e.race.id === "hd45") && q("45").some((e) => e.race.id === "sd45") === false);
  assert.ok(q("henrico").length === 12);
  assert.ok(q("sheriff").every((e) => e.office === "co"));
  assert.ok(q("Hunter Mill").length === 2);
  const withMember = all.find((e) => e.race.current_member)!;
  assert.ok(matches(withMember, { ...EMPTY, q: withMember.race.current_member!.name }));
});

test("localities are built from the data and include the new counties", () => {
  const ids = localityOptions(files).map((l) => l.id);
  for (const id of ["loudoun", "fairfax-county", "prince-william", "henrico", "chesterfield", "albemarle", "fairfax-city", "manassas"]) assert.ok(ids.includes(id), id);
});

test("groups are office then locality, with counts that add up", () => {
  const g = groupEntries(all);
  assert.deepEqual(g.map((x) => x.office), OFFICE_ORDER);
  for (const x of g) assert.equal(x.count, x.localities.reduce((n, l) => n + l.entries.length, 0));
  assert.equal(g.find((x) => x.office === "house")!.localities.length, 1);
});

test("URL query round-trips and drops unknown values", () => {
  const s = parseDirSearch({ r_office: "bos,house,bogus", r_loc: "loudoun", r_status: "contested,nope", r_party: "D,X", r_q: " Briskman " });
  assert.deepEqual(s, { r_office: "bos,house", r_loc: "loudoun", r_status: "contested", r_party: "D", r_q: " Briskman " });
  const f = toFilters(s);
  assert.deepEqual(f.offices, ["bos", "house"]);
  assert.equal(toggle(f.statuses, "contested"), undefined);
  assert.equal(toggle(f.statuses, "none"), "contested,none");
});

test("Loudoun + Contested is a valid, shareable view", () => {
  const f = toFilters(parseDirSearch({ r_loc: "loudoun", r_status: "contested" }));
  const out: Entry[] = filterEntries(all, f);
  assert.ok(out.every((e) => e.race.locality_id === "loudoun" && e.status === "contested"));
});
