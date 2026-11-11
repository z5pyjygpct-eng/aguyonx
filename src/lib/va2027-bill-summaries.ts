/** Lookup for plain-language 2027 bill summaries. Missing keys render as pending — never guessed. */
import raw from "@/lib/va2027-bill-summaries.json";

export type SummaryStatus = "ok" | "pending";
export type SourceUsed = "lis-summary" | "bill-text" | "title";

export type BillSummaryRecord = {
  summary: string;
  status: SummaryStatus;
  sourceUsed: SourceUsed | "";
  generatedAt: string;
};

export type BillSummaryFile = {
  generatedAt: string;
  note: string;
  bills: Record<string, BillSummaryRecord>;
};

const FILE = raw as BillSummaryFile;

export const PENDING_MESSAGE =
  "LIS hasn't posted a summary for this bill yet, so we haven't written one. Check the official links below.";

export const EDITORIAL_LABEL =
  "Plain-language summary by aguyonx — editorial, not official. Read the official summary and text below.";

const PENDING: BillSummaryRecord = { summary: "", status: "pending", sourceUsed: "", generatedAt: "" };

export function summaryFor(billNumber: string): BillSummaryRecord {
  const row = FILE.bills[billNumber];
  if (!row || row.status !== "ok" || !row.summary.trim()) return { ...PENDING, generatedAt: row?.generatedAt ?? FILE.generatedAt };
  return row;
}

export const billSummaryFile = FILE;
