/**
 * Virginia 2027 new-filing ledger. Pure readers for the public tracker.
 * The page renders `src/content/virginia-2027-bills.json` only.
 * Refreshing that file (see docs/virginia-2027-bills.md) does not require
 * editing this module as long as the fields below stay present.
 */

import { GA_MEMBER_DISTRICTS } from "./ga-member-districts.ts";

const DISTRICT_BY_LIS = Object.fromEntries(GA_MEMBER_DISTRICTS.map((row) => [row.lisId, row]));

export type Patron = {
  member_id: string;
  member_name: string;
  patron_type: string;
};

export type CategoryAssignment = {
  category_id: string;
  category_label: string;
  confidence: string;
  evidence: string;
  evidence_source: string;
};

export type BillRecord = {
  bill_number: string;
  measure_kind: string;
  chamber: string;
  filing_class: string;
  carried_over: boolean;
  title: string;
  introduction_date: string;
  chief_patron_id: string | null;
  chief_patron_name: string | null;
  chief_patron_party_code: string | null;
  chief_patron_party: string | null;
  chief_patron_party_source: string | null;
  /** Bill-file patron fields. Party stays null when the roster has no match. */
  chief_patron?: { patron_name_from_bills?: string | null; member_name?: string | null } | null;
  sponsors: Patron[];
  house_committee_id: string | null;
  house_committee_name: string | null;
  senate_committee_id: string | null;
  senate_committee_name: string | null;
  status_label: string;
  lis_detail_url: string;
  lis_text_url: string | null;
  summary_type: string | null;
  summary_plain: string | null;
  categories: CategoryAssignment[];
  category_ids: string[];
  primary_category_id: string | null;
  primary_category_label: string | null;
  primary_category_confidence: string | null;
  history_event_count?: number;
  captured_at?: string;
  session_code?: string;
  session_label?: string;
};

export type TaxonomyEntry = { id: string; label: string; keywords?: string[] };

export type LedgerMeta = {
  session_code: string;
  session_label: string;
  captured_at: string;
  source_primary: string;
  sources_joined: string[];
  counts?: Record<string, number>;
  publish_status?: string;
  subset?: string;
  notes?: string[];
  timezone_note?: string;
};

export type Ledger = {
  meta: LedgerMeta;
  taxonomy: TaxonomyEntry[];
  new_filings: BillRecord[];
  continued: BillRecord[];
};

export type FilingSet = "new" | "continued";

export type BillFilters = {
  q?: string;
  category?: string;
  patron?: string;
  chamber?: string;
  party?: string;
  status?: string;
  /** Omitted or "new" is the default list. "continued" is the carried-over set only. */
  filing?: FilingSet;
};

export type Counted = { value: string; label: string; count: number };

const NEW_FILING = "new_2027_filing";
const CONTINUED = "continued_from_2026";

/** New 2027 filings: Carried_over is false and filing_class is new_2027_filing. */
export function isNewFiling(bill: BillRecord): boolean {
  return bill.filing_class === NEW_FILING && bill.carried_over === false;
}

/** 2026 measures carried into this session. Not inferred from status text. */
export function isContinued(bill: BillRecord): boolean {
  return bill.filing_class === CONTINUED && bill.carried_over === true;
}

export function newFilings(ledger: Ledger): BillRecord[] {
  return (ledger.new_filings ?? []).filter(isNewFiling);
}

export function continuedFilings(ledger: Ledger): BillRecord[] {
  return (ledger.continued ?? []).filter(isContinued);
}

/** H* member ids are Delegates; S* are Senators. Same prefix rule as chamber. */
export function patronRole(memberId: string | null | undefined): "Delegate" | "Senator" | null {
  if (!memberId) return null;
  if (memberId.startsWith("H")) return "Delegate";
  if (memberId.startsWith("S")) return "Senator";
  return null;
}

export function categoryIdsOf(bill: BillRecord): string[] {
  const ids = new Set<string>();
  for (const id of bill.category_ids ?? []) if (id) ids.add(id);
  for (const c of bill.categories ?? []) if (c?.category_id) ids.add(c.category_id);
  return [...ids];
}

export function categoryLabel(ledger: Ledger, id: string, bill?: BillRecord): string {
  const fromTax = ledger.taxonomy.find((t) => t.id === id)?.label;
  if (fromTax) return fromTax;
  const fromBill = bill?.categories.find((c) => c.category_id === id)?.category_label;
  return fromBill || id;
}

export function patronIdsOf(bill: BillRecord): string[] {
  const ids = new Set<string>();
  if (bill.chief_patron_id) ids.add(bill.chief_patron_id);
  for (const s of bill.sponsors ?? []) if (s?.member_id) ids.add(s.member_id);
  return [...ids];
}

export function patronNamesOf(bill: BillRecord): string[] {
  const names = new Set<string>();
  if (bill.chief_patron_name) names.add(bill.chief_patron_name);
  if (bill.chief_patron?.member_name) names.add(bill.chief_patron.member_name);
  if (bill.chief_patron?.patron_name_from_bills) names.add(bill.chief_patron.patron_name_from_bills);
  for (const s of bill.sponsors ?? []) {
    if (s?.member_name) names.add(s.member_name);
  }
  return [...names];
}

const HONORIFICS = new Set(["mr", "mrs", "ms", "dr", "the"]);

export type ParsedBillQuery = {
  patronChamber: "House" | "Senate" | null;
  districtChamber: "House" | "Senate" | null;
  districtNumber: number | null;
  billPrefix: string | null;
  billDigits: string | null;
  tokens: string[];
};

/** Pull a structured tracker query out of a free-text string. Exported for tests. */
export function parseBillQuery(raw: string | undefined): ParsedBillQuery {
  const parsed: ParsedBillQuery = {
    patronChamber: null,
    districtChamber: null,
    districtNumber: null,
    billPrefix: null,
    billDigits: null,
    tokens: [],
  };
  let q = (raw ?? "").toLowerCase();
  if (!q.trim()) return parsed;

  const take = (re: RegExp, use: (m: RegExpExecArray) => void) => {
    q = q.replace(re, (match, ...rest) => {
      const groups = rest.slice(0, -2);
      const offset = rest[rest.length - 2] as number;
      use(Object.assign([match, ...groups], { 0: match, index: offset, input: q }) as RegExpExecArray);
      return " ";
    });
  };

  // Chamber-specific districts first so "Senate District 13" is not read as the title "Sen".
  take(/\b(?:house\s+district|h\s*\.\s*d\s*\.?|hd)\s*-?\s*0*(\d+)\b/g, (m) => {
    parsed.districtChamber = "House";
    parsed.districtNumber = Number(m[1]);
  });
  take(/\b(?:senate\s+district|s\s*\.\s*d\s*\.?|sd)\s*-?\s*0*(\d+)\b/g, (m) => {
    parsed.districtChamber = "Senate";
    parsed.districtNumber = Number(m[1]);
  });
  take(/\bdistrict\s*-?\s*0*(\d+)\b/g, (m) => {
    if (parsed.districtNumber == null) {
      parsed.districtChamber = null;
      parsed.districtNumber = Number(m[1]);
    }
  });
  take(/\b(\d+)\s*(?:st|nd|rd|th)\b/g, (m) => {
    if (parsed.districtNumber == null) {
      parsed.districtChamber = null;
      parsed.districtNumber = Number(m[1]);
    }
  });

  // Specific bill numbers before a bare prefix: H.B. 1234, HB-1234, hb1234, HB01234, SJ31, etc.
  take(/\b([hs])\s*\.?\s*([bjr])\s*\.?\s*-?\s*0*(\d+)\b/g, (m) => {
    parsed.billPrefix = `${m[1]}${m[2]}`.toUpperCase();
    parsed.billDigits = String(Number(m[3]));
  });
  // Bare prefix: HB, H.B., SB, SJ, HR, SR.
  take(/\b([hs])\s*\.?\s*([bjr])\s*\.?\b/g, (m) => {
    if (!parsed.billPrefix) parsed.billPrefix = `${m[1]}${m[2]}`.toUpperCase();
  });

  take(/\b(senator|sen)\.?\b/g, () => {
    parsed.patronChamber = "Senate";
  });
  take(/\b(delegate|del)\.?\b/g, () => {
    parsed.patronChamber = "House";
  });

  parsed.tokens = q
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((tok) => tok && tok.length > 1 && !HONORIFICS.has(tok));
  return parsed;
}

function canonicalBillNumber(billNumber: string): { prefix: string; digits: string; compact: string } | null {
  const m = /^(HB|SB|HJ|SJ|HR|SR)\s*-?\s*0*(\d+)$/i.exec(billNumber.trim());
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const digits = String(Number(m[2]));
  return { prefix, digits, compact: `${prefix}${digits}` };
}

function billHasPatronInChamber(bill: BillRecord, chamber: "House" | "Senate"): boolean {
  const prefix = chamber === "House" ? "H" : "S";
  return patronIdsOf(bill).some((id) => id.startsWith(prefix));
}

function billHasPatronInDistrict(bill: BillRecord, district: number, chamber: "House" | "Senate" | null): boolean {
  return patronIdsOf(bill).some((id) => {
    const row = DISTRICT_BY_LIS[id];
    if (!row || row.district !== district) return false;
    if (!chamber) return true;
    return chamber === "House" ? row.chamber === "house" : row.chamber === "senate";
  });
}

function normalizeHay(parts: Array<string | null | undefined>): string {
  const canonParts = parts.filter(Boolean) as string[];
  const raw = canonParts.join(" ").toLowerCase();
  return raw
    .replace(/([a-z])(\d)/g, "$1 $2")
    .replace(/(\d)([a-z])/g, "$1 $2")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function searchHaystack(bill: BillRecord): string {
  const canon = canonicalBillNumber(bill.bill_number);
  return normalizeHay([
    bill.bill_number,
    bill.title,
    ...patronNamesOf(bill),
    canon?.compact,
    canon ? `${canon.prefix} ${canon.digits}` : null,
  ]);
}

function billTextHay(bill: BillRecord): string {
  const canon = canonicalBillNumber(bill.bill_number);
  return normalizeHay([bill.bill_number, bill.title, canon?.compact, canon ? `${canon.prefix} ${canon.digits}` : null]);
}

function namesForPatron(bill: BillRecord, memberId: string): string[] {
  const names: string[] = [];
  if (bill.chief_patron_id === memberId) {
    if (bill.chief_patron_name) names.push(bill.chief_patron_name);
    if (bill.chief_patron?.member_name) names.push(bill.chief_patron.member_name);
    if (bill.chief_patron?.patron_name_from_bills) names.push(bill.chief_patron.patron_name_from_bills);
  }
  for (const s of bill.sponsors ?? []) {
    if (s?.member_id === memberId && s.member_name) names.push(s.member_name);
  }
  return names;
}

function tokensMatchScopedPatron(bill: BillRecord, tokens: string[], chamber: "House" | "Senate"): boolean {
  const prefix = chamber === "House" ? "H" : "S";
  const ids = patronIdsOf(bill).filter((id) => id.startsWith(prefix));
  const titleHay = billTextHay(bill);
  return ids.some((id) => {
    const hay = normalizeHay([...namesForPatron(bill, id), titleHay]);
    return tokens.every((token) => tokenInHay(token, hay));
  });
}

function tokenInHay(token: string, hay: string): boolean {
  return new RegExp(`(?:^| )${token}(?: |$)`).test(` ${hay} `);
}

/** Search covers bill number, official title, and patron names only — never the official summary. */
export function matchesQuery(bill: BillRecord, q: string | undefined): boolean {
  const query = (q ?? "").trim();
  if (!query) return true;
  const parsed = parseBillQuery(query);
  const hasConstraint =
    parsed.patronChamber ||
    parsed.districtNumber != null ||
    parsed.billPrefix ||
    parsed.tokens.length > 0;
  if (!hasConstraint) return false;

  if (parsed.billPrefix) {
    const canon = canonicalBillNumber(bill.bill_number);
    if (!canon || canon.prefix !== parsed.billPrefix) return false;
    if (parsed.billDigits && canon.digits !== parsed.billDigits) return false;
  }
  if (parsed.patronChamber) {
    if (!billHasPatronInChamber(bill, parsed.patronChamber)) return false;
    if (parsed.tokens.length && !tokensMatchScopedPatron(bill, parsed.tokens, parsed.patronChamber)) return false;
  }
  if (parsed.districtNumber != null && !billHasPatronInDistrict(bill, parsed.districtNumber, parsed.districtChamber)) {
    return false;
  }
  if (parsed.tokens.length && !parsed.patronChamber) {
    const hay = searchHaystack(bill);
    for (const token of parsed.tokens) {
      if (!tokenInHay(token, hay)) return false;
    }
  }
  return true;
}

export function matchesFilters(bill: BillRecord, f: BillFilters): boolean {
  if (f.filing === "continued") {
    if (!isContinued(bill)) return false;
  } else if (!isNewFiling(bill)) return false;
  if (f.category && !categoryIdsOf(bill).includes(f.category)) return false;
  if (f.patron && !patronIdsOf(bill).includes(f.patron)) return false;
  if (f.chamber && bill.chamber !== f.chamber) return false;
  if (f.party) {
    if (f.party === "missing") {
      if (bill.chief_patron_party_code) return false;
    } else if (bill.chief_patron_party_code !== f.party) return false;
  }
  if (f.status && bill.status_label !== f.status) return false;
  if (!matchesQuery(bill, f.q)) return false;
  return true;
}

export function filterBills(bills: BillRecord[], f: BillFilters): BillRecord[] {
  return bills.filter((b) => matchesFilters(b, f));
}

/** Introduction dates in the ledger are M/D/YYYY. Unparseable dates sort last. */
export function introductionTime(value: string | null | undefined): number {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((value ?? "").trim());
  if (!m) return Number.NEGATIVE_INFINITY;
  return Date.UTC(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
}

/** Newest introduction date first, then bill number A→Z. Does not drop rows. */
export function sortBills(bills: BillRecord[]): BillRecord[] {
  return [...bills].sort((a, b) => {
    const dt = introductionTime(b.introduction_date) - introductionTime(a.introduction_date);
    if (dt !== 0) return dt;
    return a.bill_number.localeCompare(b.bill_number);
  });
}

export function categoryCounts(ledger: Ledger, bills: BillRecord[]): Counted[] {
  const counts = new Map<string, number>();
  for (const bill of bills) {
    for (const id of categoryIdsOf(bill)) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, label: categoryLabel(ledger, value), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export type PatronOption = Counted & {
  role: "Delegate" | "Senator" | null;
  party: string | null;
  partyCode: string | null;
};

export function patronOptions(bills: BillRecord[]): PatronOption[] {
  const map = new Map<string, PatronOption>();
  const touch = (id: string, name: string) => {
    const cur = map.get(id) ?? {
      value: id,
      label: name,
      count: 0,
      role: patronRole(id),
      party: null,
      partyCode: null,
    };
    if (name && (!cur.label || cur.label === id)) cur.label = name;
    cur.count += 1;
    map.set(id, cur);
  };
  for (const bill of bills) {
    const seen = new Set<string>();
    if (bill.chief_patron_id) {
      touch(bill.chief_patron_id, bill.chief_patron_name || bill.chief_patron_id);
      seen.add(bill.chief_patron_id);
      const opt = map.get(bill.chief_patron_id)!;
      if (bill.chief_patron_party) opt.party = bill.chief_patron_party;
      if (bill.chief_patron_party_code) opt.partyCode = bill.chief_patron_party_code;
    }
    for (const s of bill.sponsors ?? []) {
      if (!s?.member_id || seen.has(s.member_id)) continue;
      touch(s.member_id, s.member_name || s.member_id);
    }
  }
  return [...map.values()].sort((a, b) => {
    const roleOrder = (r: PatronOption["role"]) => (r === "Delegate" ? 0 : r === "Senator" ? 1 : 2);
    const rd = roleOrder(a.role) - roleOrder(b.role);
    if (rd !== 0) return rd;
    return a.label.localeCompare(b.label);
  });
}

export function patronOptionLabel(opt: PatronOption): string {
  const role = opt.role ? `${opt.role} ` : "";
  const party = opt.party ? ` · ${opt.party}` : "";
  return `${role}${opt.label}${party} · ${opt.count}`;
}

function counted(bills: BillRecord[], valueOf: (b: BillRecord) => string | null, labelOf: (b: BillRecord, value: string) => string): Counted[] {
  const map = new Map<string, Counted>();
  for (const bill of bills) {
    const value = valueOf(bill);
    if (!value) continue;
    const cur = map.get(value) ?? { value, label: labelOf(bill, value), count: 0 };
    cur.count += 1;
    map.set(value, cur);
  }
  return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
}

export function chamberOptions(bills: BillRecord[]): Counted[] {
  return counted(bills, (b) => b.chamber || null, (_b, value) => value);
}

export function partyOptions(bills: BillRecord[]): Counted[] {
  const rows = counted(
    bills,
    (b) => b.chief_patron_party_code || null,
    (b, value) => b.chief_patron_party || value,
  );
  const missing = bills.filter((b) => !b.chief_patron_party_code).length;
  if (missing) rows.push({ value: "missing", label: "Party not in roster", count: missing });
  return rows;
}

export function statusOptions(bills: BillRecord[]): Counted[] {
  return counted(bills, (b) => b.status_label || null, (_b, value) => value);
}

export type CommitteeLine = { label: string };

export function committeeLines(bill: BillRecord): CommitteeLine[] {
  const lines: CommitteeLine[] = [];
  if (bill.house_committee_name) {
    const id = bill.house_committee_id ? ` (${bill.house_committee_id})` : "";
    lines.push({ label: `House · ${bill.house_committee_name}${id}` });
  }
  if (bill.senate_committee_name) {
    const id = bill.senate_committee_id ? ` (${bill.senate_committee_id})` : "";
    lines.push({ label: `Senate · ${bill.senate_committee_name}${id}` });
  }
  return lines;
}

export function measureKindCounts(bills: BillRecord[]): Counted[] {
  return counted(bills, (b) => b.measure_kind || null, (_b, value) => value);
}

/** Problems that mean the published file must not ship. Empty means usable. */
export function ledgerProblems(ledger: Ledger): string[] {
  const problems: string[] = [];
  if (!ledger?.meta?.session_code) problems.push("meta.session_code missing");
  if (!ledger?.meta?.captured_at) problems.push("meta.captured_at missing");
  if (!ledger?.meta?.source_primary) problems.push("meta.source_primary missing");
  if (!Array.isArray(ledger?.new_filings) || !Array.isArray(ledger?.continued)) {
    return [...problems, "new_filings and continued arrays are required"];
  }
  const seen = new Set<string>();
  const check = (bill: BillRecord, i: number, expect: "new" | "continued") => {
    const id = bill?.bill_number || `#${i}`;
    if (expect === "new" && !isNewFiling(bill)) problems.push(`${id} is in new_filings but is not a new 2027 filing`);
    if (expect === "continued" && !isContinued(bill)) problems.push(`${id} is in continued but is not carried over`);
    if (expect === "continued") {
      for (const categoryId of categoryIdsOf(bill)) {
        if (categoryId !== "continued-uncategorized") problems.push(`${id} continued category ${categoryId} is not allowed`);
      }
    }
    if (!bill.bill_number) problems.push(`row ${i} missing bill_number`);
    if (!bill.title) problems.push(`${id} missing title`);
    if (!bill.chamber) problems.push(`${id} missing chamber`);
    if (!bill.status_label) problems.push(`${id} missing status_label`);
    if (!bill.introduction_date) problems.push(`${id} missing introduction_date`);
    if (!bill.lis_detail_url?.startsWith("https://lis.virginia.gov/")) problems.push(`${id} missing official LIS url`);
    if (bill.lis_text_url && !bill.lis_text_url.startsWith("https://")) problems.push(`${id} text url is not https`);
    if (seen.has(bill.bill_number)) problems.push(`${id} duplicate bill_number`);
    seen.add(bill.bill_number);
    if ("source_fields" in (bill as object)) problems.push(`${id} still has source_fields`);
  };
  ledger.new_filings.forEach((bill, i) => check(bill, i, "new"));
  ledger.continued.forEach((bill, i) => check(bill, i, "continued"));
  return problems;
}
