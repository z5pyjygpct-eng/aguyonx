import { formatUsd, type DonorRecord } from "./finance-donors.ts";
import type { FinanceDonor, FinanceIndexRow, FinanceSpendItem } from "./finance-summaries.ts";

export type MoneyQueryMode = "min" | "exact";

export type MoneyQuery = {
  cents: number;
  mode: MoneyQueryMode;
  rest: string;
};

const PREFIX = String.raw`(?:(?:>=|>|at\s+least|over|more\s+than)\s*)`;
const NUMBER = String.raw`\$?\s*(\d{1,3}(?:,\d{3})+|\d+)(?:\.\d{1,2})?\s*(k|m)?`;
const SUFFIX = String.raw`(?:\+|or\s+more)`;
const MONEY_TOKEN = new RegExp(String.raw`${PREFIX}?${NUMBER}\s*${SUFFIX}?`, "ig");
const FULL_MONEY = new RegExp(String.raw`^\s*(${PREFIX})?${NUMBER}\s*(${SUFFIX})?\s*$`, "i");

function toCents(rawNumber: string, suffix?: string): number {
  const n = parseFloat(rawNumber.replace(/,/g, ""));
  if (!Number.isFinite(n) || n < 0) return 0;
  let dollars = n;
  const s = (suffix || "").toLowerCase();
  if (s === "k") dollars *= 1_000;
  if (s === "m") dollars *= 1_000_000;
  return Math.round(dollars * 100);
}

function hasMinOperator(prefix?: string, plus?: string): boolean {
  const p = (prefix || "").trim().toLowerCase();
  const x = (plus || "").trim().toLowerCase();
  return Boolean(p) || Boolean(x);
}

/**
 * Parse a dollar-amount search such as "$50,000", "50000", "50k", ">50000",
 * "$15,000+", or "$10k+". Bare small numbers (like "50" or "45") are left
 * alone so district searches still work. A money token mixed with words
 * (for example "Kilgore $10k+") returns the amount plus the leftover name.
 */
export function parseMoneyQuery(raw: string): MoneyQuery | null {
  const q = raw.trim();
  if (!q) return null;
  const full = FULL_MONEY.exec(q);
  if (full) {
    const cents = toCents(full[2], full[3]);
    const minOp = hasMinOperator(full[1], full[4]);
    // Bare numbers under $1,000 are too easy to confuse with a district.
    if (!minOp && !/\$/.test(q) && !full[3] && cents < 100_000) return null;
    if (cents <= 0) return null;
    return { cents, mode: minOp ? "min" : "exact", rest: "" };
  }

  MONEY_TOKEN.lastIndex = 0;
  let found: { start: number; end: number; cents: number; mode: MoneyQueryMode } | null = null;
  let match: RegExpExecArray | null;
  while ((match = MONEY_TOKEN.exec(q))) {
    const token = match[0];
    const inner = FULL_MONEY.exec(token);
    if (!inner) continue;
    const cents = toCents(inner[2], inner[3]);
    const minOp = hasMinOperator(inner[1], inner[4]);
    const looksMoney = minOp || /\$/.test(token) || Boolean(inner[3]) || cents >= 100_000;
    if (!looksMoney || cents <= 0) continue;
    found = { start: match.index, end: match.index + token.length, cents, mode: minOp ? "min" : "exact" };
    // Prefer the last obvious money token so "Hope $15,000+" works.
  }
  if (!found) return null;
  const rest = (q.slice(0, found.start) + " " + q.slice(found.end)).replace(/\s+/g, " ").trim();
  return { cents: found.cents, mode: found.mode, rest };
}

export function moneyNear(valueCents: number, targetCents: number): boolean {
  if (targetCents <= 0) return false;
  const slack = Math.max(25_000, Math.round(targetCents * 0.05)); // $250 or 5%
  return Math.abs(valueCents - targetCents) <= slack;
}

export function moneyMatches(valueCents: number, query: MoneyQuery): "exact" | "near" | "min" | null {
  if (valueCents === query.cents) return "exact";
  if (query.mode === "exact" && moneyNear(valueCents, query.cents)) return "near";
  if (valueCents >= query.cents && (query.mode === "min" || query.mode === "exact")) {
    // Bare amounts still surface "at or above" results, ranked below exact/near.
    if (query.mode === "min") return "min";
    if (valueCents > query.cents) return "min";
  }
  return null;
}

function amountScore(kind: "exact" | "near" | "min", valueCents: number, targetCents: number): number {
  if (kind === "exact") return 80;
  if (kind === "near") return 50;
  // For "at or above" searches, larger official totals rank higher.
  return 20 + Math.log10(Math.max(valueCents, targetCents) / 100 + 1);
}

export type AmountHitKind = "legislator" | "donor";

export type AmountHit = {
  kind: AmountHitKind;
  id: string;
  title: string;
  snippet: string;
  href: string;
  cents: number;
  match: "exact" | "near" | "min";
  score: number;
};

function legislatorHref(row: FinanceIndexRow): string {
  return `/campaign-money?member=${encodeURIComponent(row.slug)}`;
}

function bestLegislatorAmount(
  row: FinanceIndexRow,
  query: MoneyQuery,
): { cents: number; label: string; match: "exact" | "near" | "min" } | null {
  const options: { cents: number; label: string }[] = [
    { cents: row.raisedCycleCents ?? 0, label: "raised this cycle" },
    { cents: row.cashOnHandCents ?? 0, label: "cash on hand" },
    { cents: row.spentCycleCents ?? 0, label: "spent this cycle" },
  ];
  const ranked = options
    .map((o) => ({ ...o, match: moneyMatches(o.cents, query) }))
    .filter((o): o is { cents: number; label: string; match: "exact" | "near" | "min" } => o.match != null);
  if (!ranked.length) return null;
  const rank = { exact: 0, near: 1, min: 2 };
  ranked.sort((a, b) => {
    const r = rank[a.match] - rank[b.match];
    if (r) return r;
    if (a.match === "min") return b.cents - a.cents;
    return Math.abs(a.cents - query.cents) - Math.abs(b.cents - query.cents);
  });
  return ranked[0];
}

export function searchByAmount(
  query: MoneyQuery,
  members: FinanceIndexRow[],
  donors: DonorRecord[],
  cap = 25,
): AmountHit[] {
  const hits: AmountHit[] = [];
  const name = query.rest.trim().toLowerCase();

  for (const row of members) {
    if (row.status !== "ready") continue;
    if (name) {
      const hay = `${row.name} ${row.committeeName} ${row.slug} ${row.honorific}`.toLowerCase();
      if (!name.split(/\s+/).every((tok) => hay.includes(tok))) continue;
    }
    const best = bestLegislatorAmount(row, query);
    if (!best) continue;
    const match = best.match;
    const who = `${row.honorific} ${row.name}`;
    const how =
      match === "min"
        ? `${formatUsd(best.cents)} ${best.label} (at least ${formatUsd(query.cents)})`
        : match === "near"
          ? `${formatUsd(best.cents)} ${best.label} (near ${formatUsd(query.cents)})`
          : `${formatUsd(best.cents)} ${best.label}`;
    hits.push({
      kind: "legislator",
      id: `amt-leg-${row.lisId}`,
      title: who,
      snippet: `${how} · official state filings`,
      href: legislatorHref(row),
      cents: best.cents,
      match,
      score: amountScore(match, best.cents, query.cents) + (name ? 10 : 0) + (row.chamber === "house" ? 1 : 0),
    });
  }

  for (const donor of donors) {
    if (name) {
      if (!name.split(/\s+/).every((tok) => donor.name.toLowerCase().includes(tok))) continue;
    }
    const match = moneyMatches(donor.totalCents, query);
    if (!match) continue;
    const top = donor.recipients[0];
    const dest = top ? top.committeeName : `${donor.giftCount} reported gifts`;
    const how =
      match === "min"
        ? `${formatUsd(donor.totalCents)} in official gifts (at least ${formatUsd(query.cents)})`
        : match === "near"
          ? `${formatUsd(donor.totalCents)} in official gifts (near ${formatUsd(query.cents)})`
          : `${formatUsd(donor.totalCents)} in official gifts`;
    hits.push({
      kind: "donor",
      id: `amt-donor-${donor.id}`,
      title: donor.name,
      snippet: `${how} to ${dest}`,
      href: `/campaign-money?donor=${encodeURIComponent(donor.id)}`,
      cents: donor.totalCents,
      match,
      score: amountScore(match, donor.totalCents, query.cents) + (name ? 8 : 0),
    });
  }

  const rank = { exact: 0, near: 1, min: 2 };
  const byRank = (a: AmountHit, b: AmountHit) => {
    const r = rank[a.match] - rank[b.match];
    if (r) return r;
    return b.score - a.score || b.cents - a.cents || a.title.localeCompare(b.title);
  };
  const legs = hits.filter((h) => h.kind === "legislator").sort(byRank);
  const gifts = hits.filter((h) => h.kind === "donor").sort(byRank);
  // Keep both campaign totals and donors visible instead of letting one list crowd out the other.
  const legCap = Math.min(legs.length, Math.max(Math.ceil(cap / 2), cap - gifts.length));
  const donorCap = Math.min(gifts.length, cap - legCap);
  return [...legs.slice(0, legCap), ...gifts.slice(0, donorCap)];
}

export type LocalMoneyHit = {
  kind: "donor" | "vendor";
  name: string;
  cents: number;
  snippet: string;
  href?: string;
  donorId?: string;
  score: number;
};

type LocalVendor = { name: string; cents: number; count?: number; items?: FinanceSpendItem[] };

/**
 * Search one campaign's itemized donors and vendors by name or dollar amount,
 * so a profile search can surface gifts and payments on this page as well as
 * jumps to other candidates.
 */
export function searchLocalMoney(
  raw: string,
  donors: FinanceDonor[] | undefined,
  vendors: LocalVendor[] | undefined,
  cap = 8,
): LocalMoneyHit[] {
  const money = parseMoneyQuery(raw);
  const name = (money ? money.rest : raw).trim().toLowerCase();
  const tokens = name ? name.split(/\s+/).filter(Boolean) : [];
  if (!money && tokens.length === 0) return [];

  const hits: LocalMoneyHit[] = [];

  function nameOk(value: string): boolean {
    if (!tokens.length) return true;
    const hay = value.toLowerCase();
    return tokens.every((tok) => hay.includes(tok));
  }

  for (const donor of donors ?? []) {
    if (!nameOk(donor.name)) continue;
    if (money) {
      const match = moneyMatches(donor.cents, money);
      if (!match) continue;
    }
    const gifts = donor.count && donor.count > 1 ? ` · ${donor.count} gifts` : "";
    hits.push({
      kind: "donor",
      name: donor.name,
      cents: donor.cents,
      snippet: `${formatUsd(donor.cents)} in official gifts${gifts} on this campaign`,
      href: donor.donorId ? `/campaign-money?donor=${encodeURIComponent(donor.donorId)}` : undefined,
      donorId: donor.donorId,
      score: (donor.name.toLowerCase().startsWith(tokens[0] ?? "") ? 12 : 6) + Math.log10(donor.cents / 100 + 1),
    });
  }

  for (const vendor of vendors ?? []) {
    if (!nameOk(vendor.name)) continue;
    if (money) {
      const match = moneyMatches(vendor.cents, money);
      if (!match) continue;
    }
    const payments = vendor.count ? ` · ${vendor.count} ${vendor.count === 1 ? "payment" : "payments"}` : "";
    hits.push({
      kind: "vendor",
      name: vendor.name,
      cents: vendor.cents,
      snippet: `${formatUsd(vendor.cents)} paid to this vendor${payments} on this campaign`,
      score: (vendor.name.toLowerCase().startsWith(tokens[0] ?? "") ? 10 : 5) + Math.log10(vendor.cents / 100 + 1),
    });
  }

  hits.sort((a, b) => b.score - a.score || b.cents - a.cents || a.name.localeCompare(b.name));
  return hits.slice(0, cap);
}
