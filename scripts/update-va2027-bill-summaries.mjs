#!/usr/bin/env node
/**
 * After a Virginia 2027 ledger install, compare each bill's official source
 * fields to the fingerprint stored on its plain-language summary entry.
 *
 * Never overwrites an entry marked reviewed: true. New bills get a pending
 * stub (reviewed: false). Changed sources are flagged so a person can write
 * or review a new summary. This script does not invent summaries.
 *
 * Usage (the 8 AM watch command, after install-virginia-2027-bills.mjs):
 *   node scripts/update-va2027-bill-summaries.mjs
 *
 * Exit 1 if a new pending stub was added, a reviewed or unreviewed source
 * changed, or the validator fails. Exit 0 when every ledger bill already has
 * an entry and no official source field has changed.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fingerprintFromBill, fingerprintChanged } from "./va2027-summary-source.mjs";

const root = process.cwd();
const ledgerPath = path.join(root, "src/content/virginia-2027-bills.json");
const sumPath = path.join(root, "src/lib/va2027-bill-summaries.json");

if (!fs.existsSync(ledgerPath)) {
  console.error("Missing src/content/virginia-2027-bills.json");
  process.exit(1);
}
if (!fs.existsSync(sumPath)) {
  console.error("Missing src/lib/va2027-bill-summaries.json");
  process.exit(1);
}

const ledger = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
const catalog = JSON.parse(fs.readFileSync(sumPath, "utf8"));
const entries = catalog.bills ?? {};
const bills = [...(ledger.new_filings ?? []), ...(ledger.continued ?? [])];
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());

const added = [];
const reviewedChanged = [];
const unreviewedChanged = [];
const unchanged = [];

for (const bill of bills) {
  const id = bill.bill_number;
  const current = fingerprintFromBill(bill);
  const row = entries[id];
  if (!row) {
    entries[id] = {
      summary: "",
      status: "pending",
      sourceUsed: "",
      generatedAt: today,
      reviewed: false,
      sourceFingerprint: current,
    };
    added.push(id);
    continue;
  }
  const storedFp = row.sourceFingerprint ?? null;
  if (!fingerprintChanged(storedFp, current)) {
    unchanged.push(id);
    continue;
  }
  const change = { id, reviewed: row.reviewed === true, previous: storedFp, current };
  if (row.reviewed === true) {
    reviewedChanged.push(change);
    // Do not overwrite the reviewed summary, fingerprint, or status.
  } else {
    unreviewedChanged.push(change);
    // Do not auto-overwrite an existing draft. Flag only.
  }
}

catalog.bills = entries;
if (added.length) {
  fs.writeFileSync(sumPath, `${JSON.stringify(catalog, null, 2)}\n`);
}

const check = spawnSync(process.execPath, [path.join(root, "scripts/check-bill-summaries.mjs")], {
  cwd: root,
  encoding: "utf8",
});
const checkStdout = check.stdout || "";
const checkStderr = check.stderr || "";
let checkReport = null;
try {
  checkReport = JSON.parse(checkStdout);
} catch {
  checkReport = { raw: checkStdout.trim(), parse_error: true };
}

const report = {
  ran_at: today,
  ledger_bills: bills.length,
  added_pending: added,
  reviewed_source_changed: reviewedChanged.map((c) => c.id),
  unreviewed_source_changed: unreviewedChanged.map((c) => c.id),
  unchanged: unchanged.length,
  wrote_summaries_file: added.length > 0,
  note: "Reviewed entries were not overwritten. New bills were stored as pending. Source changes are flagged for a person to update. Run the validator after writing any new summary.",
  validator_exit: check.status,
  validator: checkReport,
};

console.log(JSON.stringify(report, null, 2));
if (checkStderr.trim()) console.error(checkStderr.trim());

const flagged = added.length || reviewedChanged.length || unreviewedChanged.length;
if (flagged || check.status !== 0) process.exit(1);
