/** Pending-copy and editorial labels for 2027 bill summary pop-ups. No data imports. */

/** Used only when LIS has posted neither an official summary nor a bill-text link. */
export const PENDING_MESSAGE =
  "LIS hasn't posted a summary for this bill yet, so we haven't written one. Check the official links below.";

export const PENDING_HAS_BOTH_MESSAGE =
  "We haven't written a plain-language summary for this bill yet. The official LIS summary and bill text are below.";

export const PENDING_HAS_SUMMARY_MESSAGE =
  "We haven't written a plain-language summary for this bill yet. The official LIS summary is below.";

export const PENDING_HAS_TEXT_MESSAGE =
  "We haven't written a plain-language summary for this bill yet. The official bill text is linked below.";

export const EDITORIAL_LABEL =
  "Plain-language summary by aguyonx — editorial, not official. Read the official summary and text below.";

export const BILL_TEXT_EDITORIAL_LABEL =
  "Plain-language summary written from the bill text by aguyonx, not an official LIS summary.";

export type PendingMessageBill = {
  summary_plain?: string | null;
  lis_text_url?: string | null;
};

export function hasOfficialLisSummary(bill: PendingMessageBill): boolean {
  return Boolean(bill.summary_plain?.trim());
}

export function hasOfficialBillTextLink(bill: PendingMessageBill): boolean {
  return Boolean(bill.lis_text_url?.trim());
}

export function pendingMessageFor(bill: PendingMessageBill): string {
  const hasSummary = hasOfficialLisSummary(bill);
  const hasText = hasOfficialBillTextLink(bill);
  if (hasSummary && hasText) return PENDING_HAS_BOTH_MESSAGE;
  if (hasSummary) return PENDING_HAS_SUMMARY_MESSAGE;
  if (hasText) return PENDING_HAS_TEXT_MESSAGE;
  return PENDING_MESSAGE;
}

export function editorialLabelFor(sourceUsed: string): string {
  return sourceUsed === "bill-text" ? BILL_TEXT_EDITORIAL_LABEL : EDITORIAL_LABEL;
}

export function billTextVersionLabel(date?: string | null): string {
  const trimmed = date?.trim();
  return trimmed ? `Bill text (version ${trimmed})` : "Bill text";
}
