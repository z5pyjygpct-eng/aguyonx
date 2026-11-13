import type { DonorKind, FinanceDonor, FinanceGift, FinanceHistoryVendor, FinanceSpendItem } from "./finance-summaries.ts";

/** Parse a published history CSV (official Virginia Department of Elections rows, 2021–present). */

export type HistoryYearSlice = {
  year: number;
  donors: FinanceDonor[];
  vendors: FinanceHistoryVendor[];
  giftCount: number;
  paymentCount: number;
};

export type HistoryMonthSlice = {
  year: number;
  month: number;
  donors: FinanceDonor[];
  vendors: FinanceHistoryVendor[];
};

export type HistoryLedger = {
  donors: FinanceDonor[];
  vendors: FinanceHistoryVendor[];
  years: Map<number, HistoryYearSlice>;
  months: Map<string, HistoryMonthSlice>;
};

const cache = new Map<string, Promise<HistoryLedger>>();

export function donorFold(name: string): string {
  const lowered = (name || "")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return lowered;
}

export function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseUsdToCents(raw: string): number {
  const trimmed = (raw || "").trim();
  if (!trimmed) return 0;
  const neg = trimmed.startsWith("-") || /^\(.*\)$/.test(trimmed);
  const n = Number(trimmed.replace(/[$,()\s]/g, ""));
  if (!Number.isFinite(n)) return 0;
  const cents = Math.round(n * 100);
  return neg ? -Math.abs(cents) : cents;
}

/** Minimal RFC-style CSV parser: quoted fields, doubled quotes, and CRLF. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;
  const s = text.replace(/^\uFEFF/, "");
  while (i < s.length) {
    const c = s[i]!;
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && s[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.length)) rows.push(row);
      row = [];
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell.length)) rows.push(row);
  }
  return rows;
}

function asKind(raw: string): DonorKind {
  if (raw === "pac" || raw === "party" || raw === "candidate" || raw === "business" || raw === "individual") return raw;
  return "individual";
}

type GiftAcc = FinanceDonor & { gifts: FinanceGift[] };
type VendorAcc = FinanceHistoryVendor & { items: FinanceSpendItem[] };

function takeDonor(map: Map<string, GiftAcc>, row: { name: string; kind: DonorKind; city: string; state: string }): GiftAcc {
  const key = donorFold(row.name) || row.name;
  const rec = map.get(key) ?? {
    name: row.name,
    cents: 0,
    count: 0,
    kind: row.kind,
    city: row.city || undefined,
    state: row.state || undefined,
    inKindCents: 0,
    gifts: [],
  };
  if (row.name.length > rec.name.length) rec.name = row.name;
  if (row.kind && rec.kind === "individual" && row.kind !== "individual") rec.kind = row.kind;
  if (row.city && !rec.city) rec.city = row.city;
  if (row.state && !rec.state) rec.state = row.state;
  map.set(key, rec);
  return rec;
}

function takeVendor(map: Map<string, VendorAcc>, name: string): VendorAcc {
  const key = donorFold(name) || name;
  const rec = map.get(key) ?? { name, cents: 0, count: 0, items: [] };
  if (name.length > rec.name.length) rec.name = name;
  map.set(key, rec);
  return rec;
}

function finalizeDonors(map: Map<string, GiftAcc>): FinanceDonor[] {
  const list = [...map.values()];
  for (const donor of list) {
    donor.gifts.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.cents - a.cents);
    if (!donor.inKindCents) delete donor.inKindCents;
    if (!donor.city) delete donor.city;
    if (!donor.state) delete donor.state;
  }
  return list.sort((a, b) => b.cents - a.cents || a.name.localeCompare(b.name));
}

function finalizeVendors(map: Map<string, VendorAcc>): FinanceHistoryVendor[] {
  const list = [...map.values()];
  for (const vendor of list) {
    vendor.items.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.cents - a.cents);
  }
  return list.sort((a, b) => b.cents - a.cents || a.name.localeCompare(b.name));
}

export function parseHistoryCsv(text: string): HistoryLedger {
  const rows = parseCsv(text);
  const headerIndex = rows.findIndex((r) => (r[0] ?? "").trim().toLowerCase() === "section");
  if (headerIndex < 0) {
    return { donors: [], vendors: [], years: new Map(), months: new Map() };
  }
  const header = rows[headerIndex]!.map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);

  const iSection = col("section");
  const iDate = col("date");
  const iName = col("name");
  const iAmount = col("amount_usd");
  const iCity = col("city");
  const iState = col("state");
  const iType = col("type");
  const iEmployer = col("employer");
  const iOccupation = col("occupation");
  const iDescription = col("description");
  const iReport = col("report_id");

  const lifetimeDonors = new Map<string, GiftAcc>();
  const lifetimeVendors = new Map<string, VendorAcc>();
  const yearDonors = new Map<number, Map<string, GiftAcc>>();
  const yearVendors = new Map<number, Map<string, VendorAcc>>();
  const monthDonors = new Map<string, Map<string, GiftAcc>>();
  const monthVendors = new Map<string, Map<string, VendorAcc>>();
  const yearGiftCount = new Map<number, number>();
  const yearPaymentCount = new Map<number, number>();

  const ensureYear = (year: number) => {
    if (!yearDonors.has(year)) yearDonors.set(year, new Map());
    if (!yearVendors.has(year)) yearVendors.set(year, new Map());
  };
  const ensureMonth = (key: string) => {
    if (!monthDonors.has(key)) monthDonors.set(key, new Map());
    if (!monthVendors.has(key)) monthVendors.set(key, new Map());
  };

  for (const raw of rows.slice(headerIndex + 1)) {
    const section = (raw[iSection] ?? "").trim();
    const date = (raw[iDate] ?? "").trim();
    const name = (raw[iName] ?? "").trim() || "Not stated";
    const cents = parseUsdToCents(raw[iAmount] ?? "");
    const year = Number.parseInt(date.slice(0, 4), 10);
    const month = Number.parseInt(date.slice(5, 7), 10);
    if (!Number.isInteger(year) || year < 2021) continue;
    const mKey = Number.isInteger(month) && month >= 1 && month <= 12 ? monthKey(year, month) : "";
    if (section === "contribution" || section === "in_kind") {
      const kind = asKind((raw[iType] ?? "").trim());
      const gift: FinanceGift = {
        date: date || undefined,
        cents,
        type: section === "in_kind" ? "inkind" : "direct",
      };
      const item = (raw[iDescription] ?? "").trim();
      if (item) gift.item = item;
      const reportId = (raw[iReport] ?? "").trim();
      if (reportId) gift.reportId = reportId;
      const employer = (raw[iEmployer] ?? "").trim();
      const occupation = (raw[iOccupation] ?? "").trim();
      if (kind === "individual") {
        if (employer && employer.toUpperCase() !== "N/A") gift.employer = employer;
        if (occupation) gift.occupation = occupation;
      }
      const city = (raw[iCity] ?? "").trim();
      const state = (raw[iState] ?? "").trim();
      const apply = (acc: GiftAcc) => {
        acc.cents += cents;
        acc.count += 1;
        if (gift.type === "inkind") acc.inKindCents = (acc.inKindCents ?? 0) + cents;
        acc.gifts.push(gift);
      };
      apply(takeDonor(lifetimeDonors, { name, kind, city, state }));
      ensureYear(year);
      apply(takeDonor(yearDonors.get(year)!, { name, kind, city, state }));
      yearGiftCount.set(year, (yearGiftCount.get(year) ?? 0) + 1);
      if (mKey) {
        ensureMonth(mKey);
        apply(takeDonor(monthDonors.get(mKey)!, { name, kind, city, state }));
      }
    } else if (section === "expenditure") {
      const item: FinanceSpendItem = { name, cents, date: date || undefined };
      const purpose = (raw[iDescription] ?? "").trim();
      if (purpose) item.item = purpose;
      const apply = (acc: VendorAcc) => {
        acc.cents += cents;
        acc.count += 1;
        acc.items.push(item);
      };
      apply(takeVendor(lifetimeVendors, name));
      ensureYear(year);
      apply(takeVendor(yearVendors.get(year)!, name));
      yearPaymentCount.set(year, (yearPaymentCount.get(year) ?? 0) + 1);
      if (mKey) {
        ensureMonth(mKey);
        apply(takeVendor(monthVendors.get(mKey)!, name));
      }
    }
  }

  const years = new Map<number, HistoryYearSlice>();
  for (const year of yearDonors.keys()) {
    years.set(year, {
      year,
      donors: finalizeDonors(yearDonors.get(year)!),
      vendors: finalizeVendors(yearVendors.get(year)!),
      giftCount: yearGiftCount.get(year) ?? 0,
      paymentCount: yearPaymentCount.get(year) ?? 0,
    });
  }
  const months = new Map<string, HistoryMonthSlice>();
  for (const key of monthDonors.keys()) {
    const [ys, ms] = key.split("-");
    months.set(key, {
      year: Number(ys),
      month: Number(ms),
      donors: finalizeDonors(monthDonors.get(key)!),
      vendors: finalizeVendors(monthVendors.get(key)!),
    });
  }

  return {
    donors: finalizeDonors(lifetimeDonors),
    vendors: finalizeVendors(lifetimeVendors),
    years,
    months,
  };
}

export function historySlice(
  ledger: HistoryLedger,
  sel?: { year?: number; month?: number },
): { donors: FinanceDonor[]; vendors: FinanceHistoryVendor[] } {
  if (sel?.year != null && sel.month != null) {
    const row = ledger.months.get(monthKey(sel.year, sel.month));
    return { donors: row?.donors ?? [], vendors: row?.vendors ?? [] };
  }
  if (sel?.year != null) {
    const row = ledger.years.get(sel.year);
    return { donors: row?.donors ?? [], vendors: row?.vendors ?? [] };
  }
  return { donors: ledger.donors, vendors: ledger.vendors };
}

export function loadMemberHistory(csvPath: string): Promise<HistoryLedger> {
  const existing = cache.get(csvPath);
  if (existing) return existing;
  const pending = fetch(csvPath).then(async (res) => {
    if (!res.ok) throw new Error(`Could not load campaign money history (${res.status})`);
    return parseHistoryCsv(await res.text());
  });
  cache.set(csvPath, pending);
  pending.catch(() => {
    cache.delete(csvPath);
  });
  return pending;
}
