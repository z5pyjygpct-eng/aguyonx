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

test("chart statuses line up with the filter statuses", async () => {
  const { chartStatus, statusMatches, tally } = await import("./elections-2027.ts");
  for (const e of all) {
    const k = chartStatus(e);
    assert.equal(k === "contested", statusMatches(e, "contested"), e.race.id);
    assert.equal(k === "none", statusMatches(e, "none"), e.race.id);
    assert.equal(k === "one" || k === "unopposed", statusMatches(e, "one"), e.race.id);
  }
  const t = tally(all);
  assert.equal(t.contested + t.one + t.unopposed + t.none, all.length);
});

test("party counts use only the filing's party and treat school board blanks as nonpartisan", async () => {
  const { partyCount } = await import("./elections-2027.ts");
  const base = { id: "x", seat: "X", seats: 1, source_url: "https://a", filing_source_url: "https://b" };
  const c = (party: string | null) => ({ name: "n", incumbent: false, party, party_source_url: null, filing_source_url: "u" });
  const e: Entry = { office: "bos", status: "contested", localityIds: [], localityName: null, race: { ...base, candidates: [c("R"), c("D"), c("D"), c("Other")] } };
  assert.deepEqual(partyCount(e), { R: 1, D: 2, Other: 1, nonpartisan: 0, total: 4 });
  const sb: Entry = { office: "sb", status: "contested", localityIds: [], localityName: null, race: { ...base, candidates: [c(null), c(null)] } };
  assert.deepEqual(partyCount(sb), { R: 0, D: 0, Other: 0, nonpartisan: 2, total: 2 });
});

test("official filed-date windows count days in Eastern Time and never guess a date", async () => {
  const { candidateInWindow, isNewCandidate, hasOfficialDate, todayET, filedWindowCandidateCount, candidatesWithoutDate, parseDirSearch, toFilters } = await import("./elections-2027.ts");
  const src = "https://www.elections.virginia.gov/casting-a-ballot/candidate-list/";
  const c = (d: string | null, u: string | null = src) => ({ name: "n", incumbent: false, party: "D", party_source_url: u, filing_source_url: src, filed_date: d, filed_date_source_url: u });
  // 11:30 PM ET on Nov 19 is already Nov 20 in UTC; ET day must still be Nov 19.
  const late = todayET(new Date("2026-11-20T04:30:00Z"));
  assert.deepEqual(late, { y: 2026, m: 11, d: 19 });
  // 12:30 AM ET Nov 20 (05:30 UTC) is Nov 20.
  assert.deepEqual(todayET(new Date("2026-11-20T05:30:00Z")), { y: 2026, m: 11, d: 20 });
  assert.equal(candidateInWindow(c("11/19/2026"), "today", late), true);
  assert.equal(candidateInWindow(c("11/18/2026"), "today", late), false);
  assert.equal(candidateInWindow(c("11/12/2026"), "7d", late), true);
  assert.equal(candidateInWindow(c("11/11/2026"), "7d", late), false);
  assert.equal(candidateInWindow(c("10/20/2026"), "30d", late), true);
  assert.equal(candidateInWindow(c("10/05/2026"), "45d", late), true);
  assert.equal(candidateInWindow(c("10/04/2026"), "45d", late), false);
  assert.equal(candidateInWindow(c("9/20/2026"), "60d", late), true);
  assert.equal(candidateInWindow(c("9/19/2026"), "60d", late), false);
  assert.equal(candidateInWindow(c("11/20/2026"), "60d", late), false, "future date is never in a window");
  assert.equal(isNewCandidate(c("11/13/2026"), late), true);
  // No date, a bad date, or a date without its source never counts.
  for (const bad of [c(null), c("2026-11-19"), c("2/30/2026"), c("11/19/2026", null)]) {
    assert.equal(hasOfficialDate(bad), false);
    assert.equal(candidateInWindow(bad, "60d", late), false);
  }
  const race = { id: "r", seat: "S", seats: 1, source_url: src, filing_source_url: src, candidates: [c("11/19/2026"), c("10/30/2026"), c(null)] };
  const es: Entry[] = [{ office: "bos", race, status: "D", localityIds: ["loudoun"], localityName: "Loudoun" }];
  const f = { ...EMPTY, today: late };
  assert.deepEqual(["today", "7d", "30d", "45d", "60d"].map((w) => filedWindowCandidateCount(es, f, w as never)), [1, 1, 2, 2, 2]);
  assert.equal(candidatesWithoutDate(es), 1);
  assert.equal(filterEntries(es, { ...f, filed: "today" }).length, 1);
  assert.equal(filterEntries(es, { ...f, filed: "today", localities: ["albemarle"] }).length, 0, "combines with other pills");
  assert.equal(toFilters(parseDirSearch({ r_filed: "45d" })).filed, "45d");
  assert.equal(parseDirSearch({ r_filed: "90d" }).r_filed, undefined);
});
