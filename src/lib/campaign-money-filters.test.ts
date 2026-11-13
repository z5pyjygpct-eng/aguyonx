import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import type { FinanceSummary } from "./finance-summaries.ts";
import {
  classifyDonorKind,
  donorsFromSummaries,
  donorTypePill,
  filterDonors,
  inDollarRange,
  toggleList,
} from "./campaign-money-filters.ts";

const kilgore = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "../content/finance-summaries/terry-g-kilgore.json"), "utf8"),
) as FinanceSummary;

test("classifies official Schedule A-style givers into individual, PAC/committee, or business/org", () => {
  assert.equal(classifyDonorKind("Karmin A. Pace", "requested", true), "individual");
  assert.equal(classifyDonorKind("Ballard for Delegate", "Candidate committee", false), "candidate");
  assert.equal(classifyDonorKind("Republican Party of Virginia Inc.", "Political Party committee", false), "party");
  assert.equal(classifyDonorKind("Virginia Automobile & Truck Dealers Association PAC (VADA)", "PAC", false), "pac");
  assert.equal(classifyDonorKind("Altria Client Services Inc.", "Tobacco Company", false), "business");
  assert.equal(classifyDonorKind("Turman Lumber Company Inc.", "Saw Mill", false), "business");
  assert.equal(donorTypePill("individual"), "individual");
  assert.equal(donorTypePill("pac"), "committee");
  assert.equal(donorTypePill("party"), "committee");
  assert.equal(donorTypePill("candidate"), "committee");
  assert.equal(donorTypePill("business"), "business");
});

test("dollar-range filters use the donor's aggregate total, and $15,000 belongs to $15,000+", () => {
  assert.equal(inDollarRange(100_000, "1k-5k"), true);
  assert.equal(inDollarRange(500_000, "1k-5k"), true);
  assert.equal(inDollarRange(500_100, "1k-5k"), false);
  assert.equal(inDollarRange(500_100, "5k-15k"), true);
  assert.equal(inDollarRange(1_499_900, "5k-15k"), true);
  assert.equal(inDollarRange(1_500_000, "5k-15k"), false);
  assert.equal(inDollarRange(1_500_000, "15k+"), true);
});

test("Kilgore donors can be filtered by official type and aggregate range, with itemized gifts", () => {
  const scoped = donorsFromSummaries([kilgore]);
  assert.ok(scoped.some((d) => d.name === "Ballard for Delegate" && d.kind === "candidate"));
  const altria = scoped.find((d) => d.name === "Altria Client Services Inc.");
  assert.equal(altria?.kind, "business");
  const vada = scoped.find((d) => /VADA/.test(d.name));
  assert.equal(vada?.kind, "pac");
  assert.equal(scoped.find((d) => /VADPAC/.test(d.name))?.kind, "pac");
  assert.equal(scoped.find((d) => /AgPAC/.test(d.name))?.kind, "pac");
  assert.equal(classifyDonorKind("Virginia Dental Association VADPAC", "", false), "pac");
  assert.equal(classifyDonorKind("Virginia Farm Bureau AgPAC", "", false), "pac");

  const businesses = filterDonors(scoped, { types: ["business"], ranges: ["5k-15k"] });
  assert.ok(businesses.some((d) => d.name === "Altria Client Services Inc."));
  assert.ok(businesses.every((d) => d.kind === "business" && d.cents >= 500_100 && d.cents < 1_500_000));

  const bigCommittees = filterDonors(scoped, { types: ["committee"], ranges: ["15k+"] });
  assert.ok(bigCommittees.some((d) => d.name === "Ballard for Delegate"));
  assert.ok(bigCommittees.every((d) => d.cents >= 1_500_000));

  const named = filterDonors(scoped, { query: "Ballard" });
  assert.equal(named[0]?.name, "Ballard for Delegate");
  assert.ok(named[0]?.gifts.some((g) => g.date === "2026-01-02" && g.cents === 1_500_000));

  const combined = filterDonors(scoped, { types: ["individual"], ranges: ["1k-5k"], query: "Pace" });
  assert.ok(combined.some((d) => d.name === "Karmin A. Pace"));
});

test("toggleList turns a filter pill on and off", () => {
  assert.deepEqual(toggleList(["individual"], "business"), ["individual", "business"]);
  assert.deepEqual(toggleList(["individual", "business"], "individual"), ["business"]);
});
