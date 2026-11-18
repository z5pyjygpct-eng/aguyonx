/** Lookup for plain-language 2027 bill summaries. Missing keys render as pending — never guessed. */
import raw from "@/lib/va2027-bill-summaries.json";
import { editorialLabelFor as labelForSource } from "@/lib/va2027-bill-summary-copy";

export type SummaryStatus = "ok" | "pending";
export type SourceUsed = "lis-summary" | "bill-text" | "title";

export type SourceFingerprint = {
  summary_plain: string;
  lis_text_url: string;
  full_text_doc1: string;
  full_text_date1: string;
  textHash?: string;
};

export type BillSummaryRecord = {
  summary: string;
  status: SummaryStatus;
  sourceUsed: SourceUsed | "";
  generatedAt: string;
  reviewed?: boolean;
  sourceFingerprint?: SourceFingerprint;
};

export type BillSummaryFile = {
  generatedAt: string;
  note: string;
  bills: Record<string, BillSummaryRecord>;
};

const FILE = raw as BillSummaryFile;

export {
  BILL_TEXT_EDITORIAL_LABEL,
  EDITORIAL_LABEL,
  PENDING_HAS_BOTH_MESSAGE,
  PENDING_HAS_SUMMARY_MESSAGE,
  PENDING_HAS_TEXT_MESSAGE,
  PENDING_MESSAGE,
  billTextVersionLabel,
  hasOfficialBillTextLink,
  hasOfficialLisSummary,
  pendingMessageFor,
} from "@/lib/va2027-bill-summary-copy";
export type { PendingMessageBill } from "@/lib/va2027-bill-summary-copy";

const PENDING: BillSummaryRecord = { summary: "", status: "pending", sourceUsed: "", generatedAt: "" };

export function editorialLabelFor(rec: Pick<BillSummaryRecord, "sourceUsed">): string {
  return labelForSource(rec.sourceUsed);
}

export function summaryFor(billNumber: string): BillSummaryRecord {
  const row = FILE.bills[billNumber];
  if (!row || row.status !== "ok" || !row.summary.trim()) return { ...PENDING, generatedAt: row?.generatedAt ?? FILE.generatedAt };
  return row;
}

export const billSummaryFile = FILE;
