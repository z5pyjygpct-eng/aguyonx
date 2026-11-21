import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { flatten, districtsForLocality, type OfficeFile, type Race } from "./elections-2027.ts";
import {
  chamberLocalityOptions,
  districtCoverageText,
  displayLocalityName,
  localityCoverageSummary,
  matchLocalityQuery,
  parseCountySearch,
  racesForChamberLocality,
  resolveCountyParam,
  unknownCountyMessage,
} from "./elections-2027-county.ts";

const load = (o: "house" | "senate"): OfficeFile => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${o}.json`), "utf8")) as OfficeFile;
const HOUSE = load("house");
const SENATE = load("senate");
const house = HOUSE.races;
const senate = SENATE.races;
const files = { house: HOUSE, senate: SENATE, sb: { races: [] }, bos: { races: [] }, co: { races: [] } } as Parameters<typeof flatten>[0];
const all = flatten(files);

test("chamber locality options are the coverage localities, alphabetical by display name", () => {
  const opts = chamberLocalityOptions(house);
  assert.deepEqual(opts.map((o) => o.id), ["albemarle", "chesterfield", "manassas", "fairfax-city", "fairfax-county", "henrico", "loudoun", "prince-william"]);
  assert.deepEqual(opts.map((o) => o.displayName), [
    "Albemarle County", "Chesterfield County", "City of Manassas", "Fairfax City", "Fairfax County", "Henrico County", "Loudoun County", "Prince William County",
  ]);
  assert.deepEqual(chamberLocalityOptions(senate).map((o) => o.id), opts.map((o) => o.id));
});

test("display names add County or City only when the official name omits them", () => {
  assert.equal(displayLocalityName("loudoun", "Loudoun"), "Loudoun County");
  assert.equal(displayLocalityName("fairfax-county", "Fairfax County"), "Fairfax County");
  assert.equal(displayLocalityName("fairfax-city", "Fairfax City"), "Fairfax City");
  assert.equal(displayLocalityName("manassas", "Manassas"), "City of Manassas");
});

test("Loudoun House districts are HD26–30; Senate districts are SD31–32", () => {
  assert.deepEqual(racesForChamberLocality(house, "loudoun").map((x) => x.race.id), ["hd26", "hd27", "hd28", "hd29", "hd30"]);
  assert.deepEqual(racesForChamberLocality(senate, "loudoun").map((x) => x.race.id), ["sd31", "sd32"]);
  assert.deepEqual(
    racesForChamberLocality(house, "loudoun").map((x) => x.race.id),
    districtsForLocality(all, "house", "loudoun").map((x) => x.e.race.id),
  );
  assert.deepEqual(
    racesForChamberLocality(senate, "loudoun").map((x) => x.race.id),
    districtsForLocality(all, "senate", "loudoun").map((x) => x.e.race.id),
  );
});

test("an unknown county yields an empty district list and a message", () => {
  const opts = chamberLocalityOptions(house);
  const miss = resolveCountyParam("springfield", opts);
  assert.deepEqual(miss, { kind: "unknown", raw: "springfield" });
  assert.deepEqual(racesForChamberLocality(house, "springfield"), []);
  assert.equal(unknownCountyMessage("springfield"), "No county or city in this chamber’s data matches “springfield”.");
});

test("?county= param parses: known ids and names resolve; empty is none; unknown is kept", () => {
  const opts = chamberLocalityOptions(house);
  assert.equal(parseCountySearch(undefined), undefined);
  assert.equal(parseCountySearch(""), undefined);
  assert.equal(parseCountySearch("  "), undefined);
  assert.equal(parseCountySearch(1), undefined);
  assert.equal(parseCountySearch("Loudoun"), "loudoun");
  assert.equal(parseCountySearch("  fairfax-county  "), "fairfax-county");
  assert.equal(resolveCountyParam(parseCountySearch("loudoun"), opts).kind, "known");
  assert.equal((resolveCountyParam(parseCountySearch("loudoun"), opts) as { option: { id: string } }).option.id, "loudoun");
  assert.equal((resolveCountyParam(parseCountySearch("Loudoun County"), opts) as { option: { id: string } }).option.id, "loudoun");
  assert.equal((resolveCountyParam(parseCountySearch("loudoun-county"), opts) as { option: { id: string } }).option.id, "loudoun");
  assert.equal(resolveCountyParam(parseCountySearch("springfield"), opts).kind, "unknown");
  assert.equal(resolveCountyParam(undefined, opts).kind, "none");
});

test("typed query matches locality names (Prince, Fairfax)", () => {
  const opts = chamberLocalityOptions(house);
  assert.deepEqual(matchLocalityQuery("prince", opts).map((o) => o.id), ["prince-william"]);
  assert.deepEqual(matchLocalityQuery("fairfax", opts).map((o) => o.id), ["fairfax-city", "fairfax-county"]);
  assert.deepEqual(matchLocalityQuery("", opts).map((o) => o.id), opts.map((o) => o.id));
});

test("Loudoun House precincts sum to 107 of 107; Senate Loudoun is a mismatch so the summary claims no total", () => {
  const h = racesForChamberLocality(house, "loudoun");
  const s = racesForChamberLocality(senate, "loudoun");
  const hs = localityCoverageSummary(h, "house", "Loudoun County");
  const ss = localityCoverageSummary(s, "senate", "Loudoun County");
  assert.equal(hs.consistent, true);
  assert.equal(hs.precincts, 107);
  assert.equal(hs.localityPrecincts, 107);
  assert.equal(hs.line, "5 House districts include Loudoun County (107 of 107 precincts covered)");
  assert.equal(ss.consistent, false);
  assert.equal(ss.precincts, 108);
  assert.equal(ss.localityPrecincts, 107);
  assert.equal(ss.line, "2 Senate districts include part of Loudoun County");
  assert.ok(!ss.line.includes("precincts"));
  assert.equal(districtCoverageText(h[0].cov), "part (18 of 107 precincts)");
});

test("Fairfax City is one whole district; Prince William and Henrico House/Senate sums are inconsistent", () => {
  const city = localityCoverageSummary(racesForChamberLocality(house, "fairfax-city"), "house", "Fairfax City");
  assert.equal(city.consistent, true);
  assert.equal(city.line, "1 House district includes all of Fairfax City (6 of 6 precincts covered)");
  assert.equal(localityCoverageSummary(racesForChamberLocality(house, "prince-william"), "house", "Prince William County").consistent, false);
  assert.equal(localityCoverageSummary(racesForChamberLocality(senate, "prince-william"), "senate", "Prince William County").consistent, false);
  assert.equal(localityCoverageSummary(racesForChamberLocality(house, "henrico"), "house", "Henrico County").consistent, false);
  assert.equal(localityCoverageSummary(racesForChamberLocality(senate, "henrico"), "senate", "Henrico County").consistent, false);
});
