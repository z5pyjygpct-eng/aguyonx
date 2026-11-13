import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { expandDonorFile, type DonorFile } from "./finance-donors.ts";
import type { FinanceIndex, FinanceSummary } from "./finance-summaries.ts";
import { moneyMatches, parseMoneyQuery, searchByAmount, searchLocalMoney } from "./money-query.ts";

test("parses common dollar-amount searches, including k, plus, and greater-than", () => {
  const cases: Array<[string, number, "min" | "exact", string]> = [
    ["$50,000", 5_000_000, "exact", ""],
    ["50000", 5_000_000, "exact", ""],
    ["50k", 5_000_000, "exact", ""],
    ["$50k", 5_000_000, "exact", ""],
    [">50000", 5_000_000, "min", ""],
    [">=50000", 5_000_000, "min", ""],
    ["$15,000+", 1_500_000, "min", ""],
    ["$10k+", 1_000_000, "min", ""],
    ["10k+", 1_000_000, "min", ""],
    ["at least $25,000", 2_500_000, "min", ""],
    ["Kilgore $10k+", 1_000_000, "min", "Kilgore"],
  ];
  for (const [raw, cents, mode, rest] of cases) {
    const parsed = parseMoneyQuery(raw);
    assert.ok(parsed, `expected to parse ${raw}`);
    assert.equal(parsed.cents, cents, raw);
    assert.equal(parsed.mode, mode, raw);
    assert.equal(parsed.rest, rest, raw);
  }
});

test("does not treat district numbers as dollar amounts", () => {
  assert.equal(parseMoneyQuery("50"), null);
  assert.equal(parseMoneyQuery("HD 45"), null);
  assert.equal(parseMoneyQuery("District 45"), null);
  assert.equal(parseMoneyQuery("45"), null);
});

test("exact amounts also match nearby and at-or-above totals", () => {
  assert.equal(moneyMatches(5_000_000, { cents: 5_000_000, mode: "exact", rest: "" }), "exact");
  assert.equal(moneyMatches(5_100_000, { cents: 5_000_000, mode: "exact", rest: "" }), "near");
  assert.equal(moneyMatches(11_569_600, { cents: 5_000_000, mode: "exact", rest: "" }), "min");
  assert.equal(moneyMatches(4_000_000, { cents: 5_000_000, mode: "min", rest: "" }), null);
  assert.equal(moneyMatches(5_000_000, { cents: 5_000_000, mode: "min", rest: "" }), "exact");
  assert.equal(moneyMatches(11_569_600, { cents: 5_000_000, mode: "min", rest: "" }), "min");
});

test("amount search finds Kilgore for $50k+ and donors at or above a threshold", () => {
  const index = JSON.parse(
    fs.readFileSync(path.join(import.meta.dirname, "../content/finance-summaries/_index.json"), "utf8"),
  ) as FinanceIndex;
  const donors = expandDonorFile(
    JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../content/finance-donors.json"), "utf8")) as DonorFile,
  );
  const hits = searchByAmount({ cents: 5_000_000, mode: "min", rest: "" }, index.members, donors, 200);
  assert.ok(hits.some((h) => h.kind === "legislator"));
  assert.ok(hits.some((h) => h.kind === "donor"));
  const kilgore = hits.find((h) => /terry-g-kilgore/.test(h.href));
  assert.ok(kilgore, "Kilgore raised and spent more than $50,000 this cycle");
  assert.ok(kilgore.cents >= 5_000_000);
  const named = searchByAmount({ cents: 1_000_000, mode: "min", rest: "Kilgore" }, index.members, donors, 10);
  assert.ok(named.every((h) => /Kilgore/i.test(h.title) || /Kilgore/i.test(h.snippet)));
  assert.ok(named.some((h) => /terry-g-kilgore/.test(h.href)));
});

test("searchLocalMoney finds Kilgore donors and vendors by name or amount", () => {
  const kilgore = JSON.parse(
    fs.readFileSync(path.join(import.meta.dirname, "../content/finance-summaries/terry-g-kilgore.json"), "utf8"),
  ) as FinanceSummary;
  const donors = kilgore.donors ?? [];
  const vendors = kilgore.spending?.vendors ?? [];

  const hayley = searchLocalMoney("Hayley", donors, vendors);
  assert.ok(hayley.some((h) => h.kind === "vendor" && h.name === "Hayley Allison"));
  assert.equal(hayley.find((h) => h.name === "Hayley Allison")?.cents, 3_734_935);

  const ballard = searchLocalMoney("Ballard", donors, vendors);
  assert.ok(ballard.some((h) => h.kind === "donor" && h.name === "Ballard for Delegate"));
  assert.ok(ballard.some((h) => h.href?.includes("donor=ballard-for-delegate")));

  const cygnal = searchLocalMoney("Cygnal", donors, vendors);
  assert.ok(cygnal.some((h) => h.kind === "vendor" && /Cygnal/.test(h.name)));

  const amounts = searchLocalMoney("$10k+", donors, vendors);
  assert.ok(amounts.some((h) => h.kind === "donor" && h.name === "Ballard for Delegate"));
  assert.ok(amounts.some((h) => h.kind === "vendor" && h.name === "Hayley Allison"));
  assert.ok(amounts.every((h) => h.cents >= 1_000_000));

  const both = searchLocalMoney("Republican Party", donors, vendors);
  assert.ok(both.some((h) => h.kind === "donor"));
  assert.ok(both.some((h) => h.kind === "vendor"));
});
