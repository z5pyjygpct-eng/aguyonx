#!/usr/bin/env node
/**
 * Install the public Virginia 2027 ledger.
 *
 * Usage:
 *   node scripts/install-virginia-2027-bills.mjs path/to/bills.json
 *
 * Accepts the full session ledger (`bills[]` with both filing classes) or a
 * file that already has `new_filings` and `continued`. Writes both arrays to
 * src/content/virginia-2027-bills.json. Strips `source_fields` and summary HTML.
 * Does not edit React components and does not download or copy raw LIS CSVs.
 *
 * A new-only file is refused, so a daily refresh cannot drop the continued set.
 */
import fs from "node:fs";
import path from "node:path";

const dest = path.join(process.cwd(), "src/content/virginia-2027-bills.json");
const src = process.argv[2];
const NEW = "new_2027_filing";
const CONTINUED = "continued_from_2026";
const ALLOWED_CONTINUED_CATEGORY = "continued-uncategorized";

if (!src) {
  console.error("Usage: node scripts/install-virginia-2027-bills.mjs <bills.json>");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(src, "utf8"));
let rows = [];
if (Array.isArray(raw?.bills)) rows = raw.bills;
else if (Array.isArray(raw?.new_filings) || Array.isArray(raw?.continued)) {
  rows = [...(raw.new_filings ?? []), ...(raw.continued ?? [])];
} else {
  console.error("Refusing: input has no bills, new_filings, or continued array.");
  process.exit(1);
}

const problems = [];
const seen = new Set();
const fresh = [];
const carried = [];

for (const [i, bill] of rows.entries()) {
  const id = bill?.bill_number || `row ${i}`;
  const carriedOver = bill?.carried_over === true;
  const isNew = bill?.filing_class === NEW && bill?.carried_over === false;
  const isContinued = bill?.filing_class === CONTINUED && carriedOver;
  if (!isNew && !isContinued) {
    problems.push(`${id} filing_class (${bill?.filing_class}) does not match Carried_over (${bill?.carried_over}).`);
  }
  if (!bill?.bill_number || !bill?.title || !bill?.chamber || !bill?.status_label || !bill?.introduction_date) {
    problems.push(`${id} is missing bill number, title, chamber, status, or introduction date.`);
  }
  if (!String(bill?.lis_detail_url || "").startsWith("https://lis.virginia.gov/")) {
    problems.push(`${id} is missing an official lis.virginia.gov detail url.`);
  }
  if (seen.has(bill?.bill_number)) problems.push(`${id} is a duplicate bill number.`);
  if (bill?.bill_number) seen.add(bill.bill_number);
  if (isContinued) {
    const ids = new Set([...(bill.category_ids ?? []), ...(bill.categories ?? []).map((c) => c?.category_id)].filter(Boolean));
    for (const categoryId of ids) {
      if (categoryId !== ALLOWED_CONTINUED_CATEGORY) {
        problems.push(`${id} has editorial category ${categoryId}. Continued bills may only carry ${ALLOWED_CONTINUED_CATEGORY}.`);
      }
    }
    carried.push(bill);
  } else if (isNew) fresh.push(bill);
}

if (!fresh.length || !carried.length) {
  problems.push(`Need both filing classes. Got ${fresh.length} new and ${carried.length} continued. Pass the full bills.json.`);
}

if (problems.length) {
  console.error(`Refusing to write ${dest}.`);
  for (const p of problems.slice(0, 20)) console.error(`- ${p}`);
  if (problems.length > 20) console.error(`- … ${problems.length - 20} more`);
  process.exit(1);
}

function publish(bill) {
  const next = { ...bill };
  delete next.source_fields;
  if (next.summary && typeof next.summary === "object") {
    const summary = { ...next.summary };
    delete summary.summary_text_html;
    next.summary = summary;
  }
  return next;
}

const out = {
  meta: { ...(raw.meta ?? {}), subset: "new_filings_and_continued" },
  taxonomy: raw.taxonomy ?? [],
  new_filings: fresh.map(publish),
  continued: carried.map(publish),
};
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, `${JSON.stringify(out)}\n`);

const summariesPath = path.join(process.cwd(), "src/lib/va2027-bill-summaries.json");
let missingSummaries = [];
if (fs.existsSync(summariesPath)) {
  const catalog = JSON.parse(fs.readFileSync(summariesPath, "utf8"));
  const entries = catalog.bills ?? catalog;
  missingSummaries = [...out.new_filings, ...out.continued]
    .map((b) => b.bill_number)
    .filter((id) => !entries[id]);
}

console.log(
  JSON.stringify({
    wrote: dest,
    new_filings: out.new_filings.length,
    continued: out.continued.length,
    stripped: ["source_fields", "summary.summary_text_html"],
    session: raw.meta?.session_code ?? null,
    captured_at: raw.meta?.captured_at ?? null,
    summaries_missing: missingSummaries.length,
    summaries_missing_ids: missingSummaries,
    summaries_note: "Bills without a summaries-file entry render as pending. They are not guessed. Run node scripts/check-bill-summaries.mjs and add official-source drafts.",
  }),
);
