#!/usr/bin/env node
/**
 * Validate src/lib/va2027-bill-summaries.json against the installed tracker ledger.
 * Reports bills with no entry, pending vs ok counts, sentence-count issues, and
 * digits or $ in an ok summary that are not in the official LIS title/summary.
 *
 * Usage: node scripts/check-bill-summaries.mjs
 * Exit 1 when a problem is found (missing ok-or-pending entry, bad sentence count,
 * or an unsourced digit/$). Pending entries are allowed.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const ledger = JSON.parse(fs.readFileSync(path.join(root, "src/content/virginia-2027-bills.json"), "utf8"));
const sumPath = path.join(root, "src/lib/va2027-bill-summaries.json");
if (!fs.existsSync(sumPath)) {
  console.error("Missing src/lib/va2027-bill-summaries.json");
  process.exit(1);
}
const catalog = JSON.parse(fs.readFileSync(sumPath, "utf8"));
const entries = catalog.bills ?? {};
const bills = [...(ledger.new_filings ?? []), ...(ledger.continued ?? [])];

const missing = [];
const pending = [];
const ok = [];
const sentenceIssues = [];
const digitIssues = [];

function officialText(bill) {
  return [bill.title, bill.summary_plain, bill.summary?.summary_text_plain, bill.summary_type]
    .filter(Boolean)
    .join("\n");
}

function sentences(text) {
  const clean = String(text || "")
    .replace(/\b(a|p)\.m\./gi, "$1⨯m⨯")
    .replace(/\bU\.S\./g, "U⨯S⨯")
    .replace(/\bVa\./g, "Va⨯")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return [];
  return clean.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
}

function tokens(s) {
  return new Set((String(s).match(/\$[\d,]+(?:\.\d+)?|\d+(?:,\d{3})*(?:\.\d+)?/g) || []).map((x) => x.replace(/,/g, "")));
}

for (const bill of bills) {
  const id = bill.bill_number;
  const row = entries[id];
  if (!row) {
    missing.push(id);
    continue;
  }
  if (row.status !== "ok" || !String(row.summary || "").trim()) {
    pending.push(id);
    continue;
  }
  ok.push(id);
  const n = sentences(row.summary).length;
  if (n < 3 || n > 5) sentenceIssues.push({ id, sentences: n, summary: row.summary });
  const src = tokens(officialText(bill));
  for (const tok of tokens(row.summary)) {
    if (![...src].some((s) => s === tok || s.includes(tok) || tok.includes(s))) {
      digitIssues.push({ id, token: tok, summary: row.summary });
    }
  }
}

const extra = Object.keys(entries).filter((id) => !bills.some((b) => b.bill_number === id));

const report = {
  ledger_bills: bills.length,
  ok: ok.length,
  pending: pending.length,
  missing: missing.length,
  missing_ids: missing,
  pending_ids: pending,
  sentence_issues: sentenceIssues,
  unsourced_digits: digitIssues,
  extra_ids: extra,
};

console.log(JSON.stringify(report, null, 2));
if (missing.length || sentenceIssues.length || digitIssues.length) process.exit(1);
