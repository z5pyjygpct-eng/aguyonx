#!/usr/bin/env node
/**
 * Install a new-filings ledger into the public tracker.
 *
 * Usage:
 *   node scripts/install-virginia-2027-bills.mjs path/to/bills-new-2027.json
 *
 * Reads the ingestion-runbook output (bills-new-2027.json). Refuses carryovers.
 * Strips `source_fields` (raw LIS column echo). Writes
 * src/content/virginia-2027-bills.json. Does not edit React components.
 * Does not download or copy raw LIS CSV files.
 */
import fs from "node:fs";
import path from "node:path";

const dest = path.join(process.cwd(), "src/content/virginia-2027-bills.json");
const src = process.argv[2];

if (!src) {
  console.error("Usage: node scripts/install-virginia-2027-bills.mjs <bills-new-2027.json>");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(src, "utf8"));
if (!raw || !Array.isArray(raw.bills)) {
  console.error("Refusing: input has no bills array.");
  process.exit(1);
}

const problems = [];
const seen = new Set();
for (const [i, bill] of raw.bills.entries()) {
  const id = bill?.bill_number || `row ${i}`;
  if (bill?.filing_class !== "new_2027_filing" || bill?.carried_over !== false) {
    problems.push(`${id} is not a new 2027 filing (filing_class=${bill?.filing_class}, carried_over=${bill?.carried_over}). Pass bills-new-2027.json. Carryovers are not published.`);
  }
  if (!bill?.bill_number || !bill?.title || !bill?.chamber || !bill?.status_label || !bill?.introduction_date) {
    problems.push(`${id} is missing bill number, title, chamber, status, or introduction date.`);
  }
  if (!String(bill?.lis_detail_url || "").startsWith("https://lis.virginia.gov/")) {
    problems.push(`${id} is missing an official lis.virginia.gov detail url.`);
  }
  if (seen.has(bill?.bill_number)) problems.push(`${id} is a duplicate bill number.`);
  if (bill?.bill_number) seen.add(bill.bill_number);
}

if (problems.length) {
  console.error(`Refusing to write ${dest}.`);
  for (const p of problems.slice(0, 20)) console.error(`- ${p}`);
  if (problems.length > 20) console.error(`- … ${problems.length - 20} more`);
  process.exit(1);
}

const bills = raw.bills.map((bill) => {
  const next = { ...bill };
  delete next.source_fields;
  return next;
});

const out = { ...raw, bills };
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, `${JSON.stringify(out, null, 2)}\n`);
console.log(
  JSON.stringify({
    wrote: dest,
    bills: bills.length,
    stripped: "source_fields",
    session: raw.meta?.session_code ?? null,
    captured_at: raw.meta?.captured_at ?? null,
  }),
);
