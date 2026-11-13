import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  categoryCounts,
  categoryIdsOf,
  continuedFilings,
  filterBills,
  isContinued,
  isNewFiling,
  ledgerProblems,
  matchesFilters,
  matchesQuery,
  newFilings,
  parseBillQuery,
  patronNamesOf,
  patronOptions,
  sortBills,
  type BillFilters,
  type Ledger,
} from "./virginia-2027-bills.ts";

const ledger = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "../content/virginia-2027-bills.json"), "utf8"),
) as Ledger;

const bills = newFilings(ledger);
const continued = continuedFilings(ledger);
const mixed = [...bills, ...continued];

test("published ledger keeps 26 new filings and 443 continued records", () => {
  assert.equal(bills.length, 26);
  assert.equal(continued.length, 443);
  assert.equal(ledger.new_filings.length, 26);
  assert.equal(ledger.continued.length, 443);
  assert.deepEqual(ledgerProblems(ledger), []);
  assert.equal(JSON.stringify(ledger).includes("source_fields"), false);
  assert.equal(ledger.meta.session_code, "20271");
  assert.equal(new Set(bills.map((b) => b.bill_number)).size, 26);
  const sb852 = bills.find((b) => b.bill_number === "SB852");
  assert.ok(sb852);
  assert.equal(sb852.title, "Virginia Clean Energy & Community Flood Preparedness Act; repeal, electric utility customer credit.");
  assert.equal(sb852.chief_patron_name, "Bill DeSteph");
  assert.equal(sb852.chief_patron_party_code, "R");
  assert.equal(sb852.introduction_date, "11/9/2026");
  assert.deepEqual(categoryIdsOf(sb852), ["energy-data-centers"]);
  assert.equal(bills.find((b) => b.bill_number === "SB851")?.title, "Persons with disabilities; nondiscrimination, integration.");
  assert.equal(bills.find((b) => b.bill_number === "SR173")?.title, "Lucas, L. Louise; seeking expulsion from Senate.");
  for (const bill of ledger.new_filings) assert.equal(isNewFiling(bill), true);
  for (const bill of ledger.continued) assert.equal(isContinued(bill), true);
  for (const bill of continued) {
    assert.deepEqual(categoryIdsOf(bill), ["continued-uncategorized"]);
    assert.ok(bill.categories.every((c) => c.confidence === "unsupported"));
  }
});

test("default filters and sort keep every new filing", () => {
  assert.equal(filterBills(bills, {}).length, 26);
  assert.equal(filterBills(mixed, {}).length, 26);
  assert.equal(filterBills(mixed, { party: "R" }).length, 8);
  assert.equal(filterBills(continued, {}).length, 0);
  const sorted = sortBills(bills);
  assert.equal(sorted.length, 26);
  assert.deepEqual(new Set(sorted.map((b) => b.bill_number)), new Set(bills.map((b) => b.bill_number)));
  const newest = sorted[0]!;
  assert.equal(newest.bill_number, "SB857");
  assert.equal(newest.introduction_date, "11/12/2026");
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
    assert.equal(seen, 26, key);
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
  assert.ok(house.length > 0 && house.length < 26);
  assert.ok(house.every((b) => b.chamber === "House"));
  const senateNumbers = new Set(bills.filter((b) => b.chamber === "Senate").map((b) => b.bill_number));
  for (const bill of house) assert.equal(senateNumbers.has(bill.bill_number), false);
  assert.equal(filterBills(bills, { q: "not-a-real-patron-xyz" }).length, 0);
  assert.equal(filterBills(bills, { category: "not-a-category" }).length, 0);
  const withSummary = bills.filter((b) => b.summary_plain);
  const without = bills.filter((b) => !b.summary_plain);
  assert.equal(withSummary.length, 26);
  assert.equal(without.length, 0);
  assert.ok(without.every((b) => b.summary_plain == null));
});

test("Republican and Democrat shortcuts follow the chief patron only", () => {
  const republican = filterBills(bills, { party: "R" });
  const democrat = filterBills(bills, { party: "D" });
  assert.deepEqual(republican.map((b) => b.bill_number).sort(), ["HB1532", "HB1533", "HB1534", "SB852", "SB854", "SB855", "SB856", "SR173"]);
  assert.equal(democrat.length, 18);
  assert.equal(republican.length + democrat.length, 26);
  assert.ok(republican.every((b) => b.chief_patron_party_code === "R" && b.chief_patron_party === "Republican"));
  assert.ok(democrat.every((b) => b.chief_patron_party_code === "D" && b.chief_patron_party === "Democrat"));
  for (const number of ["SB839", "SB841", "SB843"]) {
    assert.equal(democrat.some((b) => b.bill_number === number), true, number);
    assert.equal(republican.some((b) => b.bill_number === number), false, number);
  }
  assert.deepEqual(
    filterBills(bills, { party: "R", chamber: "House" }).map((b) => b.bill_number).sort(),
    ["HB1532", "HB1533", "HB1534"],
  );
  assert.deepEqual(filterBills(bills, { party: "D", q: "Favola" }).map((b) => b.bill_number).sort(), ["SB837", "SB844", "SB851", "SB857"]);
  assert.equal(filterBills(bills, { party: "R", q: "Favola" }).length, 0);
  assert.deepEqual(filterBills(bills, { party: "R", q: "Cherry" }).map((b) => b.bill_number).sort(), ["HB1532", "HB1533"]);
  assert.equal(filterBills(bills, {}).length, 26);
  const energy = filterBills(bills, { category: "energy-data-centers" }).map((b) => b.bill_number);
  assert.ok(energy.includes("SB852") && energy.includes("SB856"));
});

test("continued subset stays separate from the 26 new filings", () => {
  assert.equal(filterBills(mixed, { filing: "continued" }).length, 443);
  assert.equal(filterBills(mixed, { filing: "continued", party: "R" }).length, 140);
  assert.equal(filterBills(mixed, { filing: "continued", party: "D" }).length, 294);
  assert.equal(filterBills(mixed, { filing: "continued", party: "missing" }).length, 9);
  const missing = filterBills(mixed, { filing: "continued", party: "missing" }).map((b) => b.bill_number).sort();
  assert.deepEqual(missing, ["HB1314", "HB377", "HB382", "HB635", "HB638", "HB96", "SB318", "SB638", "SB760"]);
  for (const bill of filterBills(mixed, { filing: "continued", party: "missing" })) {
    assert.equal(bill.chief_patron_party_code, null);
    assert.equal(bill.chief_patron_party, null);
    assert.equal(bill.status_label, "Continued from prior session");
  }
  assert.equal(filterBills(mixed, { q: "HB1003" }).length, 0);
  assert.deepEqual(filterBills(mixed, { filing: "continued", q: "HB1003" }).map((b) => b.bill_number), ["HB1003"]);
  const backToNew = filterBills(mixed, { party: "R" });
  assert.equal(backToNew.length, 8);
  assert.ok(backToNew.every((b) => isNewFiling(b)));
  assert.equal(filterBills(mixed, { filing: "new", chamber: "Senate" }).length, bills.filter((b) => b.chamber === "Senate").length);
  assert.ok(filterBills(mixed, { filing: "continued", category: "energy-data-centers" }).length === 0);
  assert.equal(filterBills(mixed, { filing: "continued", category: "continued-uncategorized" }).length, 443);
});

test("search does not use summary text", () => {
  const hb = bills.find((b) => b.bill_number === "HB1532")!;
  assert.match(hb.summary_plain ?? "", /July 1, 2028/);
  assert.equal(hb.title.includes("July 1, 2028"), false);
  assert.equal(matchesFilters(hb, { q: "July 1, 2028" }), false);
  assert.equal(matchesFilters(hb, { q: "emergency dispatchers" }), true);
});


const JONES_ALL = ["HB278", "SB222", "SB355", "SB624", "SB728", "SB739", "SB740", "SB839", "SB840", "SB841", "SB842", "SB850"];
const JONES_NEW = ["SB839", "SB840", "SB841", "SB842", "SB850"];
const MCCLURE = ["HB1003", "HB1409", "HB278", "HB339", "HB35", "HB839", "HB865", "HB92", "HB96"];
const SD13 = ["HB1280", "SB274", "SB284", "SB287", "SB355", "SB475", "SB624", "SB678"];
const HD45 = ["HB1162", "HB13", "HB703"];

function hits(q: string): string[] {
  return mixed.filter((b) => matchesQuery(b, q)).map((b) => b.bill_number).sort();
}

function assertSameSet(actual: string[], expected: string[], label: string) {
  assert.deepEqual(actual, [...expected].sort(), label);
}

test("patronNamesOf includes the full member name and the short LIS name", () => {
  const sb839 = mixed.find((b) => b.bill_number === "SB839")!;
  const names = patronNamesOf(sb839);
  assert.ok(names.includes("Michael J. Jones"), names.join(" | "));
  assert.ok(names.includes("Jones"), names.join(" | "));
});

test("name queries tokenize and ignore middle initials and leftover honorifics", () => {
  assertSameSet(hits("Jones"), JONES_ALL, "Jones");
  assertSameSet(hits("Michael Jones"), JONES_ALL, "Michael Jones");
  assertSameSet(hits("Senator Michael J. Jones"), JONES_ALL, "Senator Michael J. Jones");
  assertSameSet(hits("Sen. Jones"), JONES_ALL, "Sen. Jones");
  assertSameSet(hits("Sen Jones"), JONES_ALL, "Sen Jones");
  // Default tracker view is new filings only.
  assertSameSet(
    filterBills(mixed, { q: "Senator Michael J. Jones" }).map((b) => b.bill_number).sort(),
    JONES_NEW,
    "new-filing view",
  );
});

test("Delegate Adele Y. McClure and Del. McClure find her House-patron bills", () => {
  assertSameSet(hits("Delegate Adele Y. McClure"), MCCLURE, "Delegate Adele Y. McClure");
  assertSameSet(hits("Del. McClure"), MCCLURE, "Del. McClure");
  // A Senate-title + House surname should not return her bills.
  assert.equal(hits("Sen. McClure").length, 0);
});

test("Sen / Delegate alone narrow to bills with a patron from that chamber", () => {
  const sen = hits("Senator");
  const del = hits("Delegate");
  assert.ok(sen.length > 0 && del.length > 0);
  for (const id of sen) {
    const bill = mixed.find((b) => b.bill_number === id)!;
    assert.ok(
      [bill.chief_patron_id, ...(bill.sponsors ?? []).map((s) => s.member_id)].some((m) => m?.startsWith("S")),
      id,
    );
  }
  for (const id of del) {
    const bill = mixed.find((b) => b.bill_number === id)!;
    assert.ok(
      [bill.chief_patron_id, ...(bill.sponsors ?? []).map((s) => s.member_id)].some((m) => m?.startsWith("H")),
      id,
    );
  }
  assert.equal(sen.length, mixed.filter((b) => [b.chief_patron_id, ...(b.sponsors ?? []).map((s) => s.member_id)].some((m) => m?.startsWith("S"))).length);
  assert.equal(del.length, mixed.filter((b) => [b.chief_patron_id, ...(b.sponsors ?? []).map((s) => s.member_id)].some((m) => m?.startsWith("H"))).length);
});

test("combinations AND together", () => {
  assertSameSet(hits("Sen Jones data"), ["SB841", "SB850"], "Sen Jones data");
  assert.deepEqual(hits("Sen Jones energy"), [], "Sen Jones energy has no official title hit");
});

test("forgiving Senate District 13 formats all match the same bills", () => {
  const variants = ["SD13", "SD-13", "SD 13", "S.D. 13", "Senate District 13", "SD013", "sd13"];
  for (const q of variants) assertSameSet(hits(q), SD13, q);
});

test("forgiving House District 45 formats all match the same bills", () => {
  const variants = ["HD45", "HD-45", "HD 45", "hd45", "H.D. 45", "House District 45", "District 45", "HD045", "45th"];
  for (const q of variants) assertSameSet(hits(q), HD45, q);
});

test("forgiving bill-number formats for real ledger bills, including leading zeros", () => {
  const cases: Record<string, string[]> = {
    SB852: ["SB852", "SB-852", "SB 852", "S.B. 852", "sb852", "SB0852", "sb 852"],
    HB1532: ["HB1532", "HB-1532", "HB 1532", "H.B. 1532", "hb1532", "HB01532"],
    HB13: ["HB13", "HB-13", "HB 13", "H.B. 13", "hb13", "HB013", "HB0013"],
    HJ14: ["HJ14", "HJ-14", "HJ 14", "H.J. 14", "hj14", "HJ014"],
    SJ31: ["SJ31", "SJ-31", "SJ 31", "S.J. 31", "sj31", "SJ031"],
    SR173: ["SR173", "SR-173", "SR 173", "S.R. 173", "sr173", "SR0173"],
    SR6: ["SR6", "SR-6", "SR 6", "S.R. 6", "sr6", "SR06"],
  };
  for (const [bill, variants] of Object.entries(cases)) {
    for (const q of variants) {
      assertSameSet(hits(q), [bill], `${q} -> ${bill}`);
    }
  }
});

test("bare bill prefixes select every bill of that kind; HR is absent from this ledger", () => {
  assert.equal(hits("SB").length, 195);
  assert.ok(hits("SB").every((id) => id.startsWith("SB")));
  assert.equal(hits("HB").length, 259);
  assert.ok(hits("HB").every((id) => id.startsWith("HB")));
  assert.equal(hits("HJ").length, 12);
  assert.ok(hits("HJ").every((id) => id.startsWith("HJ")));
  assert.equal(hits("SJ").length, 1);
  assert.deepEqual(hits("SJ"), ["SJ31"]);
  assert.equal(hits("SR").length, 2);
  assert.deepEqual(hits("SR"), ["SR173", "SR6"].sort());
  assert.deepEqual(hits("HR"), []);
  assert.deepEqual(hits("H.B."), hits("HB"));
  assert.deepEqual(hits("S.B."), hits("SB"));
});

test("H.B. and S.D. period forms do not break ordinary name tokens", () => {
  const name = parseBillQuery("Senator Michael J. Jones");
  assert.equal(name.patronChamber, "Senate");
  assert.deepEqual(name.tokens, ["michael", "jones"]);
  assert.equal(name.billPrefix, null);
  assert.equal(name.districtNumber, null);

  const bill = parseBillQuery("H.B. 1532");
  assert.equal(bill.billPrefix, "HB");
  assert.equal(bill.billDigits, "1532");
  assert.deepEqual(bill.tokens, []);

  const district = parseBillQuery("S.D. 13");
  assert.equal(district.districtChamber, "Senate");
  assert.equal(district.districtNumber, 13);
  assert.deepEqual(district.tokens, []);
  assert.equal(district.billPrefix, null);
});
