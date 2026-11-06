import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  categoryCounts,
  categoryIdsOf,
  filterBills,
  isNewFiling,
  ledgerProblems,
  matchesFilters,
  newFilings,
  patronOptions,
  sortBills,
  type BillFilters,
  type Ledger,
} from "./virginia-2027-bills.ts";

const ledger = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "../content/virginia-2027-bills.json"), "utf8"),
) as Ledger;

const bills = newFilings(ledger);

test("published ledger is 19 new filings and nothing else", () => {
  assert.equal(ledger.bills.length, 19);
  assert.equal(bills.length, 19);
  assert.deepEqual(ledgerProblems(ledger), []);
  assert.equal(JSON.stringify(ledger).includes("source_fields"), false);
  assert.equal(ledger.meta.subset, "new_2027_filing_only");
  assert.equal(ledger.meta.session_code, "20271");
  const numbers = bills.map((b) => b.bill_number);
  assert.equal(new Set(numbers).size, 19);
  for (const bill of ledger.bills) assert.equal(isNewFiling(bill), true);
});

test("default filters and sort keep every new filing", () => {
  assert.equal(filterBills(bills, {}).length, 19);
  const sorted = sortBills(bills);
  assert.equal(sorted.length, 19);
  assert.deepEqual(new Set(sorted.map((b) => b.bill_number)), new Set(bills.map((b) => b.bill_number)));
  const newest = sorted[0]!;
  assert.equal(newest.bill_number, "SB850");
  assert.equal(newest.introduction_date, "11/2/2026");
});

test("every bill is findable by its own number, title fragment, patron, category, chamber, party, and status", () => {
  for (const bill of bills) {
    const own: BillFilters = {
      q: bill.bill_number,
      category: bill.primary_category_id ?? categoryIdsOf(bill)[0],
      patron: bill.chief_patron_id ?? undefined,
      chamber: bill.chamber,
      party: bill.chief_patron_party_code ?? undefined,
      status: bill.status_label,
    };
    assert.equal(matchesFilters(bill, {}), true, bill.bill_number);
    assert.equal(matchesFilters(bill, { q: bill.bill_number }), true, bill.bill_number);
    const spaced = `${bill.bill_number.slice(0, 2)} ${bill.bill_number.slice(2)}`;
    assert.equal(matchesFilters(bill, { q: spaced }), true, spaced);
    const last = bill.chief_patron_name?.split(" ").pop();
    assert.ok(last, `${bill.bill_number} chief patron`);
    assert.equal(matchesFilters(bill, { q: last }), true, last);
    assert.equal(matchesFilters(bill, own), true, JSON.stringify(own));
    for (const id of categoryIdsOf(bill)) {
      assert.equal(matchesFilters(bill, { category: id }), true, `${bill.bill_number} ${id}`);
    }
  }
});

test("category counts include secondary tags and do not drop multi-category bills", () => {
  const counts = new Map(categoryCounts(ledger, bills).map((c) => [c.value, c.count]));
  const sb841 = bills.find((b) => b.bill_number === "SB841")!;
  for (const id of categoryIdsOf(sb841)) {
    const hits = filterBills(bills, { category: id });
    assert.ok(hits.some((b) => b.bill_number === "SB841"), id);
    assert.equal(hits.length, counts.get(id));
  }
  assert.ok(categoryIdsOf(sb841).length >= 2);
  const sum = [...counts.values()].reduce((n, c) => n + c, 0);
  const assigned = bills.reduce((n, b) => n + categoryIdsOf(b).length, 0);
  assert.equal(sum, assigned);
  assert.ok(sum > bills.length);
  for (const bill of bills) assert.ok(categoryIdsOf(bill).length > 0, bill.bill_number);
});

test("chamber, party, and status partitions cover every filing exactly once", () => {
  for (const key of ["chamber", "party", "status"] as const) {
    const groups = new Map<string, number>();
    for (const bill of bills) {
      const value = key === "chamber" ? bill.chamber : key === "party" ? bill.chief_patron_party_code : bill.status_label;
      assert.ok(value, `${bill.bill_number} ${key}`);
      groups.set(value!, (groups.get(value!) ?? 0) + 1);
    }
    let seen = 0;
    for (const [value, count] of groups) {
      const f: BillFilters = key === "chamber" ? { chamber: value } : key === "party" ? { party: value } : { status: value };
      const hits = filterBills(bills, f);
      assert.equal(hits.length, count, `${key}=${value}`);
      seen += hits.length;
    }
    assert.equal(seen, 19, key);
  }
});

test("patron filter keeps co-patron bills and does not invent a party for them", () => {
  const roem = patronOptions(bills).find((p) => p.label.includes("Roem"));
  assert.ok(roem, "Roem is a sponsor in the ledger");
  assert.equal(roem!.role, "Senator");
  assert.equal(roem!.party, null);
  const hits = filterBills(bills, { patron: roem!.value }).map((b) => b.bill_number).sort();
  assert.deepEqual(hits, ["SB839", "SB841", "SB843"]);
  const cherry = patronOptions(bills).find((p) => p.label.includes("Cherry"))!;
  assert.equal(cherry.role, "Delegate");
  assert.equal(cherry.party, "Republican");
  assert.deepEqual(
    filterBills(bills, { patron: cherry.value }).map((b) => b.bill_number).sort(),
    ["HB1532", "HB1533"],
  );
});

test("a filter excludes only non-matches", () => {
  const house = filterBills(bills, { chamber: "House" });
  assert.ok(house.length > 0 && house.length < 19);
  assert.ok(house.every((b) => b.chamber === "House"));
  const senateNumbers = new Set(bills.filter((b) => b.chamber === "Senate").map((b) => b.bill_number));
  for (const bill of house) assert.equal(senateNumbers.has(bill.bill_number), false);
  assert.equal(filterBills(bills, { q: "not-a-real-patron-xyz" }).length, 0);
  assert.equal(filterBills(bills, { category: "not-a-category" }).length, 0);
  const withSummary = bills.filter((b) => b.summary_plain);
  const without = bills.filter((b) => !b.summary_plain);
  assert.equal(withSummary.length, 4);
  assert.equal(without.length, 15);
  assert.ok(without.every((b) => b.summary_plain == null));
});

test("search does not use summary text", () => {
  const hb = bills.find((b) => b.bill_number === "HB1532")!;
  assert.match(hb.summary_plain ?? "", /July 1, 2028/);
  assert.equal(hb.title.includes("July 1, 2028"), false);
  assert.equal(matchesFilters(hb, { q: "July 1, 2028" }), false);
  assert.equal(matchesFilters(hb, { q: "emergency dispatchers" }), true);
});
