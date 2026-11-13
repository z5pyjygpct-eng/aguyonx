import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { donorFold, historySlice, monthKey, parseCsv, parseHistoryCsv, parseUsdToCents } from "./campaign-money-history.ts";

const FIXTURE = `Copy of official Virginia Department of Elections campaign finance data, 2021 to the latest filing. Not from VPAP.
section,date,name,amount_usd,city,state,type,employer,occupation,description,schedule,report_id,report_period,committee_code,committee_name
contribution,2021-03-18,William J. Ackerman,$50,Clifton,VA,individual,N/A,Not Employed,,A,238067,2021-01-01 to 2021-03-31,CC-18-00353,Helmer for Virginia
contribution,2023-04-01,William J. Ackerman,"$1,000",Clifton,VA,individual,N/A,Not Employed,,A,300001,2023-04-01 to 2023-06-30,CC-18-00353,Helmer for Virginia
in_kind,2023-05-02,Clean Virginia PAC,$250,Richmond,VA,pac,,,Voter file,B,300001,2023-04-01 to 2023-06-30,CC-18-00353,Helmer for Virginia
expenditure,2023-06-15,"ASAP Printing, Inc.",$995.10,Alexandria,VA,,,,Printing of Campaign Materials,D,300001,2023-04-01 to 2023-06-30,CC-18-00353,Helmer for Virginia
expenditure,2023-07-01,ASAP Printing Inc,$200,Alexandria,VA,,,,Mailers,D,300002,2023-07-01 to 2023-09-30,CC-18-00353,Helmer for Virginia
contribution,2020-12-31,Too Early,$500,Clifton,VA,individual,,,,A,100000,2020-10-01 to 2020-12-31,CC-18-00353,Helmer for Virginia
`;

test("parses dollar amounts into cents, including commas and negatives", () => {
  assert.equal(parseUsdToCents("$50"), 5_000);
  assert.equal(parseUsdToCents("$1,000"), 100_000);
  assert.equal(parseUsdToCents("$995.10"), 99_510);
  assert.equal(parseUsdToCents("-$20.50"), -2_050);
  assert.equal(parseUsdToCents(""), 0);
});

test("parses quoted CSV fields that contain commas", () => {
  const rows = parseCsv('a,b\n"ASAP Printing, Inc.",995\n');
  assert.deepEqual(rows[1], ["ASAP Printing, Inc.", "995"]);
});

test("folds donor names the same way the official history build does", () => {
  assert.equal(donorFold("ASAP Printing, Inc."), donorFold("ASAP Printing Inc"));
  assert.equal(donorFold("Smith & Jones"), "smith and jones");
});

test("aggregates all itemized donors and payments across years, skipping pre-2021 rows", () => {
  const ledger = parseHistoryCsv(FIXTURE);
  assert.equal(ledger.donors.length, 2);
  const ackerman = ledger.donors.find((d) => d.name === "William J. Ackerman");
  assert.ok(ackerman);
  assert.equal(ackerman.cents, 105_000);
  assert.equal(ackerman.count, 2);
  assert.equal(ackerman.gifts?.length, 2);
  assert.equal(ackerman.kind, "individual");

  const pac = ledger.donors.find((d) => d.name === "Clean Virginia PAC");
  assert.ok(pac);
  assert.equal(pac.kind, "pac");
  assert.equal(pac.inKindCents, 25_000);
  assert.equal(pac.gifts?.[0]?.type, "inkind");

  const year2023 = ledger.years.get(2023);
  assert.ok(year2023);
  assert.equal(year2023.donors.length, 2);
  assert.equal(year2023.giftCount, 2);
  assert.equal(year2023.paymentCount, 2);
  assert.equal(year2023.vendors.length, 1);
  assert.equal(year2023.vendors[0]?.name, "ASAP Printing, Inc.");
  assert.equal(year2023.vendors[0]?.count, 2);
  assert.equal(year2023.vendors[0]?.cents, 119_510);
  assert.equal(year2023.vendors[0]?.items?.length, 2);

  assert.equal(ledger.years.has(2020), false);
  assert.equal(historySlice(ledger).donors.length, 2);
  assert.equal(historySlice(ledger, { year: 2023 }).donors.length, 2);
  assert.equal(historySlice(ledger, { year: 2021 }).donors.length, 1);
  assert.equal(historySlice(ledger, { year: 2023, month: 5 }).donors[0]?.name, "Clean Virginia PAC");
  assert.equal(monthKey(2023, 5), "2023-05");
});

test("loads every named donor and vendor from Helmer's published 2021-present history CSV", () => {
  const file = path.resolve(import.meta.dirname, "../../public/files/campaign-money/history/dan-i-helmer.csv");
  if (!fs.existsSync(file)) {
    assert.ok(true, "history CSV not present in this checkout");
    return;
  }
  const ledger = parseHistoryCsv(fs.readFileSync(file, "utf8"));
  assert.equal(ledger.donors.length, 1457);
  assert.equal(ledger.vendors.length, 317);
  const y2025 = ledger.years.get(2025);
  assert.ok(y2025);
  assert.equal(y2025.donors.length, 374);
  assert.equal(y2025.giftCount, 582);
  assert.equal(y2025.vendors.length, 157);
  assert.equal(y2025.paymentCount, 516);
  const y2023 = ledger.years.get(2023);
  assert.ok(y2023);
  assert.equal(y2023.donors.length, 394);
});
