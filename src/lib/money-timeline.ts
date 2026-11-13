import type { FinanceHistoryMonth } from "./finance-summaries.ts";

/** First year we show; the state archive pull never goes back before 2021. */
export const TIMELINE_FIRST_YEAR = 2021;

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** Anything with a year and official raised / spent totals plus itemized month rows. */
export type TimelineYear = {
  year: number;
  raisedCents: number;
  spentCents: number;
  giftCents: number;
  giftCount: number;
  paymentCents: number;
  paymentCount: number;
  months?: FinanceHistoryMonth[];
};

export type TimelineBar = {
  key: string;
  label: string;
  shortLabel: string;
  year: number;
  month?: number;
  inCents: number;
  outCents: number;
};

export function monthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

/** Years from 2021 on, oldest first, so charts read left to right. */
export function timelineYears<T extends { year: number }>(years: T[] | undefined): T[] {
  return [...(years ?? [])].filter((y) => y.year >= TIMELINE_FIRST_YEAR).sort((a, b) => a.year - b.year);
}

/**
 * Bars for the raised-vs-spent chart.
 * - No year: one bar pair per year, using the official report totals (Schedule H).
 * - A year: one bar pair per month of that year, using itemized gifts and payments dated that month.
 *   Months with no itemized activity still appear (as zero) up to the last month with data.
 */
export function timelineBars(years: TimelineYear[], year?: number): TimelineBar[] {
  const list = timelineYears(years);
  if (year == null) {
    return list.map((y) => ({
      key: String(y.year),
      label: String(y.year),
      shortLabel: String(y.year),
      year: y.year,
      inCents: y.raisedCents,
      outCents: y.spentCents,
    }));
  }
  const y = list.find((v) => v.year === year);
  if (!y) return [];
  const months = y.months ?? [];
  const last = months.reduce((m, v) => Math.max(m, v.month), 0);
  const byMonth = new Map(months.map((m) => [m.month, m]));
  const out: TimelineBar[] = [];
  for (let m = 1; m <= Math.max(last, 1); m++) {
    const row = byMonth.get(m);
    out.push({
      key: `${year}-${m}`,
      label: `${monthName(m)} ${year}`,
      shortLabel: MONTH_SHORT[m - 1],
      year,
      month: m,
      inCents: row?.giftCents ?? 0,
      outCents: row?.paymentCents ?? 0,
    });
  }
  return out;
}

/** Months (1–12) that have any itemized activity in the given year. */
export function availableMonths(years: TimelineYear[], year: number | undefined): number[] {
  if (year == null) return [];
  const y = years.find((v) => v.year === year);
  return (y?.months ?? []).filter((m) => m.giftCount > 0 || m.paymentCount > 0).map((m) => m.month).sort((a, b) => a - b);
}

/** Bar height as a percent of the tallest bar, with a visible sliver for any non-zero amount. */
export function barPercent(cents: number, maxCents: number): number {
  if (cents <= 0 || maxCents <= 0) return 0;
  return Math.max(1.5, Math.round((cents / maxCents) * 1000) / 10);
}

/** Compact dollar label for chart bars: $950, $12K, $1.2M. */
export function compactUsd(cents: number): string {
  const d = Math.round(cents / 100);
  const abs = Math.abs(d);
  const sign = d < 0 ? "-" : "";
  if (abs >= 999_500) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `${sign}$${Math.round(abs / 1_000).toLocaleString("en-US")}K`;
  return `${sign}$${abs.toLocaleString("en-US")}`;
}

/** Parse a ?year= / ?month= style value into a supported year or month. */
export function parseTimelineYear(v: unknown, years: number[]): number | undefined {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number.parseInt(v, 10) : Number.NaN;
  return Number.isInteger(n) && years.includes(n) ? n : undefined;
}

export function parseTimelineMonth(v: unknown): number | undefined {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number.parseInt(v, 10) : Number.NaN;
  return Number.isInteger(n) && n >= 1 && n <= 12 ? n : undefined;
}
