import { COMMITTEE_PAGE_BASE } from "./campaign-money-search.ts";
import { formatUsd } from "./finance-donors.ts";

export { formatUsd };

export const REPORT_PAGE_BASE = "https://cfreports.elections.virginia.gov/Report/Index/";
export const REPORT_XML_BASE = "https://cfreports.elections.virginia.gov/Report/ReportXML/";
export const FEATURED_MONEY_SLUG = "terry-g-kilgore";

export type DonorKind = "individual" | "pac" | "party" | "candidate" | "business";

export type FinanceGiftType = "direct" | "inkind";

export type FinanceGift = {
  date?: string;
  cents: number;
  type: FinanceGiftType;
  item?: string;
  employer?: string;
  occupation?: string;
  reportId?: string;
};

export type FinanceDonor = {
  name: string;
  cents: number;
  count: number;
  kind: DonorKind;
  city?: string;
  state?: string;
  inKindCents?: number;
  donorId?: string;
  gifts?: FinanceGift[];
};

export type FinanceFiling = {
  reportId: string;
  start: string;
  end: string;
  filed: string;
  due: string;
  onTime: boolean | null;
  amendment: number;
  cycle?: string;
};

export type FinanceLatestReport = {
  id: string;
  filed: string;
  start: string;
  end: string;
  due: string;
  amendment: number;
};

export type FinanceSpendItem = {
  name?: string;
  item?: string;
  date?: string;
  cents: number;
  category?: string;
};

export type FinanceHistoryVendor = { name: string; cents: number; count: number; items?: FinanceSpendItem[] };

export type FinanceHistoryMonthGiver = { name: string; cents: number; count: number; kind?: DonorKind | string };

/** Itemized gifts and payments dated in one calendar month (from the 2021-present history). */
export type FinanceHistoryMonth = {
  month: number;
  giftCount: number;
  giftCents: number;
  paymentCount: number;
  paymentCents: number;
  donorCount?: number;
  vendorCount?: number;
  donors?: FinanceHistoryMonthGiver[];
  vendors?: FinanceHistoryMonthGiver[];
};

export type FinanceHistoryYear = {
  year: number;
  raisedCents: number;
  spentCents: number;
  endingBalanceCents?: number;
  reports: number;
  giftCount: number;
  giftCents: number;
  paymentCount: number;
  paymentCents: number;
  donorCount: number;
  vendorCount: number;
  committees: string[];
  donors: FinanceDonor[];
  vendors: FinanceHistoryVendor[];
  months?: FinanceHistoryMonth[];
};

/** All sitting legislators combined for one year (hub chart). */
export type FinanceHistoryTotal = {
  year: number;
  members: number;
  raisedCents: number;
  spentCents: number;
  giftCents: number;
  giftCount: number;
  paymentCents: number;
  paymentCount: number;
  months: FinanceHistoryMonth[];
};

export type FinanceHistoryReport = {
  reportId: string;
  committeeCode: string;
  committeeName: string;
  start: string;
  end: string;
  filed: string;
  amendment: number;
  receiptsCents: number;
  disbursementsCents: number;
  endingBalanceCents: number | null;
  hasSchedules: boolean;
};

export type FinanceHistory = {
  from: string;
  through: string | null;
  committees: { committeeCode: string; committeeName: string; current: boolean }[];
  years: FinanceHistoryYear[];
  reports: FinanceHistoryReport[];
  csvPath: string | null;
  note: string;
};

export type FinanceSummary = {
  lisId: string;
  slug: string;
  name: string;
  chamber: "house" | "senate";
  district: number;
  honorific: string;
  committeeName: string;
  committeeCode: string;
  committeeId: string;
  status: "ready" | "unavailable";
  note?: string;
  itemizedCoverage?: "full" | "partial";
  itemizedNote?: string;
  asOf?: string;
  cycle?: string;
  cycleLabel?: string;
  cycleStart?: string;
  cycleEnd?: string;
  cashOnHandCents?: number;
  raisedCycleCents?: number;
  spentCycleCents?: number;
  unitemizedCents?: number;
  itemizedContribCents?: number;
  inkindCents?: number;
  otherReceiptsCents?: number;
  loanBalanceCents?: number;
  debtsCents?: number;
  latestReport?: FinanceLatestReport;
  donors?: FinanceDonor[];
  origin?: {
    inStateCents: number;
    outOfStateCents: number;
    unknownCents: number;
    inStateCount: number;
    outOfStateCount: number;
    unknownCount: number;
  };
  types?: {
    individualCents: number;
    pacCents: number;
    transferCents: number;
    individualCount: number;
    pacCount: number;
    transferCount: number;
  };
  size?: { smallCents: number; largeCents: number; rule: string };
  spending?: {
    categories: { name: string; cents: number; items?: FinanceSpendItem[] }[];
    vendors: { name: string; cents: number; count: number; items?: FinanceSpendItem[] }[];
    groupingNote: string;
  };
  inkind?: { name: string; cents: number; date: string; item: string; city?: string; state?: string }[];
  loans?: { name: string; cents: number; date: string; balanceCents: number; item: string }[];
  debts?: { name: string; cents: number; date: string; item: string }[];
  filings?: FinanceFiling[];
  history?: FinanceHistory;
  csvPath?: string;
  verification?: {
    matchedOfficialXml: boolean;
    reportId: string;
    xmlUrl: string;
    checkedOn: string;
  };
};

export type FinanceIndexRow = {
  lisId: string;
  slug: string;
  name: string;
  honorific: string;
  chamber: "house" | "senate";
  district: number;
  committeeName: string;
  committeeCode: string;
  committeeId: string;
  status: "ready" | "unavailable";
  asOf?: string;
  cycle?: string;
  cycleLabel?: string;
  cashOnHandCents?: number;
  raisedCycleCents?: number;
  spentCycleCents?: number;
  itemizedCoverage?: "full" | "partial";
};

export type FinanceIndex = {
  generated: string;
  source: string;
  scheduleMonths: string[];
  memberCount: number;
  readyCount: number;
  members: FinanceIndexRow[];
  historyTotals?: FinanceHistoryTotal[];
};

export function committeeUrl(committeeId: string): string {
  return COMMITTEE_PAGE_BASE + committeeId;
}

export function reportUrl(reportId: string): string {
  return REPORT_PAGE_BASE + reportId;
}

export function reportXmlUrl(reportId: string): string {
  return REPORT_XML_BASE + reportId;
}

export function profileMoneyHref(chamber: "house" | "senate", slug: string): string {
  return `/dashboards/${chamber}/members/${slug}#campaign-money`;
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function formatShortDate(iso?: string): string {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  if (!m) return iso;
  const date = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function formatPeriod(start?: string, end?: string): string {
  if (!start && !end) return "";
  if (!start) return formatDate(end);
  if (!end) return formatDate(start);
  const a = /^(\d{4})-(\d{2})-(\d{2})/.exec(start);
  const b = /^(\d{4})-(\d{2})-(\d{2})/.exec(end);
  if (a && b && a[1] === b[1]) {
    const startD = new Date(Date.UTC(Number(a[1]), Number(a[2]) - 1, Number(a[3])));
    const endD = new Date(Date.UTC(Number(b[1]), Number(b[2]) - 1, Number(b[3])));
    const startLabel = startD.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    const endLabel = endD.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    return `${startLabel}–${endLabel}`;
  }
  return `${formatShortDate(start)}–${formatShortDate(end)}`;
}

export function kindLabel(kind: DonorKind): string {
  if (kind === "individual") return "Individual";
  if (kind === "pac") return "PAC or political committee";
  if (kind === "party") return "Party committee";
  if (kind === "business") return "Business or organization";
  return "Candidate committee";
}

export function percent(part: number, total: number): number {
  if (!total) return 0;
  return Math.round((1000 * part) / total) / 10;
}

export function lateFilingCount(filings: FinanceFiling[] | undefined): { late: number; total: number } {
  const list = filings ?? [];
  return { late: list.filter((f) => f.onTime === false).length, total: list.length };
}

export function sourceLine(report?: FinanceLatestReport | FinanceFiling): string {
  if (!report) return "";
  const id = "id" in report ? report.id : report.reportId;
  const filed = report.filed;
  const amendment = report.amendment;
  const amended = amendment ? `Amendment ${amendment}, ` : "";
  return `From the state report ${amended}filed ${formatDate(filed)} (Report ${id})`;
}
