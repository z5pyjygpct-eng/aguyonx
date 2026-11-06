/**
 * Virginia 2027 new-filing ledger. Pure readers for the preview page.
 * The page renders `src/content/virginia-2027-bills.json` only.
 * Refreshing that file (see docs/virginia-2027-bills.md) does not require
 * editing this module as long as the fields below stay present.
 */

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
  bills: BillRecord[];
};

export type BillFilters = {
  q?: string;
  category?: string;
  patron?: string;
  chamber?: string;
  party?: string;
  status?: string;
};

export type Counted = { value: string; label: string; count: number };

const NEW_FILING = "new_2027_filing";

/** Rows this preview is allowed to show. Carryovers never pass. */
export function isNewFiling(bill: BillRecord): boolean {
  return bill.filing_class === NEW_FILING && bill.carried_over === false;
}

export function newFilings(ledger: Ledger): BillRecord[] {
  return ledger.bills.filter(isNewFiling);
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
  for (const s of bill.sponsors ?? []) if (s?.member_name) names.add(s.member_name);
  return [...names];
}

/** Search covers bill number, official title, and patron names only. */
export function matchesQuery(bill: BillRecord, q: string | undefined): boolean {
  const query = (q ?? "").trim().toLowerCase();
  if (!query) return true;
  const hay = [bill.bill_number, bill.title, ...patronNamesOf(bill)].join("\n").toLowerCase();
  if (hay.includes(query)) return true;
  const compact = (s: string) => s.replace(/[^a-z0-9]/g, "");
  const qCompact = compact(query);
  return qCompact.length > 0 && compact(hay).includes(qCompact);
}

export function matchesFilters(bill: BillRecord, f: BillFilters): boolean {
  if (!isNewFiling(bill)) return false;
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
  if (!Array.isArray(ledger?.bills)) return [...problems, "bills is not an array"];
  const seen = new Set<string>();
  ledger.bills.forEach((bill, i) => {
    const id = bill?.bill_number || `#${i}`;
    if (!isNewFiling(bill)) problems.push(`${id} is not a new 2027 filing`);
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
  });
  return problems;
}
