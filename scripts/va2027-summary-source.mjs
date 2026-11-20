import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export const TEXT_SOURCE_DIR = "src/lib/va2027-bill-text-sources";

export function fingerprintFromBill(bill) {
  return {
    summary_plain: bill?.summary_plain || "",
    lis_text_url: bill?.lis_text_url || "",
    full_text_doc1: bill?.full_text_doc1 || "",
    full_text_date1: bill?.full_text_date1 || "",
  };
}

export function fingerprintChanged(stored, current) {
  if (!stored) return true;
  const keys = ["summary_plain", "lis_text_url", "full_text_doc1", "full_text_date1"];
  return keys.some((k) => (stored[k] || "") !== (current[k] || ""));
}

export function textSourcePath(root, billNumber) {
  return path.join(root, TEXT_SOURCE_DIR, `${billNumber}.txt`);
}

export function sha256Text(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

export function loadBillTextSource(root, billNumber) {
  const filePath = textSourcePath(root, billNumber);
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, "utf8");
}

export function officialLedgerText(bill) {
  return [bill.title, bill.summary_plain, bill.summary?.summary_text_plain, bill.summary_type]
    .filter(Boolean)
    .join("\n");
}

/**
 * Official text a digit/$ in an ok summary must appear in.
 * lis-summary (and title) entries use the ledger title + official summary.
 * bill-text entries also include the stored official bill-text copy, which must
 * match the recorded SHA-256 hash when one is present.
 */
export function officialTextForCheck(root, bill, row) {
  const base = officialLedgerText(bill);
  if (row?.sourceUsed !== "bill-text") return { text: base, issues: [] };
  const issues = [];
  const stored = loadBillTextSource(root, bill.bill_number);
  if (stored == null) {
    issues.push(`missing bill-text source file for ${bill.bill_number}`);
    return { text: base, issues };
  }
  const expected = row.sourceFingerprint?.textHash;
  if (expected) {
    const actual = sha256Text(stored);
    if (actual !== expected) {
      issues.push(
        `bill-text hash mismatch for ${bill.bill_number}: expected ${expected}, got ${actual}`,
      );
    }
  }
  return { text: `${base}\n${stored}`, issues };
}
