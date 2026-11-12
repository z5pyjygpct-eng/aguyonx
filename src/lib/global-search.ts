import { rankCampaignMoney, committeePageUrl, type CampaignMoneyRecord } from "./campaign-money-search.ts";
import { parseBillQuery } from "./virginia-2027-bills.ts";
import { findDonor, formatUsd, searchDonors, type DonorRecord } from "./finance-donors.ts";

export type GlobalCategory =
  | "Legislator"
  | "Local Candidate"
  | "Donor"
  | "Committee"
  | "2027 Bill"
  | "Meeting / Page";

export type GlobalHit = {
  id: string;
  category: GlobalCategory;
  title: string;
  snippet: string;
  href: string;
  score: number;
  external?: boolean;
};

export type CompactBill = {
  n: string;
  t: string;
  p: string;
  k: "new" | "continued";
  s?: string;
};

export type GlobalSearchData = {
  legislators: CampaignMoneyRecord[];
  locals: CampaignMoneyRecord[];
  donors: DonorRecord[];
  bills: CompactBill[];
};

function looksLikeBillNumber(raw: string): boolean {
  return /\b[hs]\s*\.?\s*[bjr]\s*\.?\s*-?\s*\d+/i.test(raw.trim());
}

function canonBill(raw: string): { prefix: string; digits: string; label: string } | null {
  const m = /^(HB|SB|HJ|SJ|HR|SR)\s*-?\s*0*(\d+)$/i.exec(raw.trim());
  if (!m) return null;
  const prefix = m[1].toUpperCase();
  const digits = String(Number(m[2]));
  return { prefix, digits, label: `${prefix} ${digits}` };
}

function billHref(query: string): string {
  return `/virginia-2027-bills?q=${encodeURIComponent(query)}`;
}

function campaignMoneyHref(query: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ q: query, ...extra });
  return `/campaign-money?${params.toString()}`;
}

function donorHref(id: string): string {
  return `/campaign-money?donor=${encodeURIComponent(id)}`;
}

function searchBills(bills: CompactBill[], raw: string, cap = 8): GlobalHit[] {
  const q = raw.trim();
  if (!q) return [];
  const parsed = parseBillQuery(q);
  const hasBill = Boolean(parsed.billPrefix);
  const hasTokens = parsed.tokens.length > 0;
  if (!hasBill && !hasTokens) return [];

  const hits: GlobalHit[] = [];
  for (const b of bills) {
    const canon = canonBill(b.n);
    if (parsed.billPrefix) {
      if (!canon || canon.prefix !== parsed.billPrefix) continue;
      if (parsed.billDigits && canon.digits !== parsed.billDigits) continue;
    }
    if (hasTokens && !parsed.billPrefix) {
      const hay = `${b.n} ${b.t} ${b.p}`.toLowerCase();
      if (!parsed.tokens.every((tok) => hay.includes(tok))) continue;
    }
    const kindLabel = b.k === "new" ? "New 2027 filing" : "Continued from 2026";
    const label = canon?.label ?? b.n;
    hits.push({
      id: `bill-${b.k}-${b.n}`,
      category: "2027 Bill",
      title: `${label} — ${b.t}`,
      snippet: [kindLabel, b.p ? `Patron: ${b.p}` : null, b.s].filter(Boolean).join(" · "),
      href: billHref(label),
      score: (parsed.billDigits && canon?.digits === parsed.billDigits ? 40 : 12) + (b.k === "new" ? 2 : 0),
    });
  }
  hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  const top = hits.slice(0, cap);
  if (looksLikeBillNumber(q) && top.length === 0) {
    const parsed2 = parseBillQuery(q);
    const label =
      parsed2.billPrefix && parsed2.billDigits ? `${parsed2.billPrefix} ${parsed2.billDigits}` : q;
    top.push({
      id: `bill-tracker-${label}`,
      category: "2027 Bill",
      title: `Search the 2027 bills tracker for ${label}`,
      snippet: "Look in both new 2027 filings and bills continued from 2026. This number is not in the current ledger.",
      href: billHref(label),
      score: 8,
    });
  }
  return top;
}

function peopleHits(records: CampaignMoneyRecord[], query: string, category: "Legislator" | "Local Candidate", cap: number): GlobalHit[] {
  return rankCampaignMoney(records, query, cap).map((h) => {
    const isLocal = category === "Local Candidate";
    const href = !isLocal && h.profileHref ? h.profileHref : campaignMoneyHref(h.name, isLocal ? { office: h.kind } : {});
    const bits = [h.officeLabel, h.locality, h.committeeName ? `Committee: ${h.committeeName}` : null].filter(Boolean);
    return {
      id: `${isLocal ? "local" : "leg"}-${h.committeeId}`,
      category,
      title: h.name,
      snippet: bits.join(" · "),
      href,
      score: h.score + (category === "Legislator" ? 3 : 0),
    };
  });
}

function committeeHits(records: CampaignMoneyRecord[], query: string, cap: number): GlobalHit[] {
  const hits: GlobalHit[] = [];
  for (const h of rankCampaignMoney(records, query, cap * 2)) {
    // Only keep rows where the committee title itself participates in the match,
    // so a bare last name can still surface the official committee page.
    hits.push({
      id: `committee-${h.committeeId}`,
      category: "Committee",
      title: h.committeeName,
      snippet: [h.name, h.officeLabel, h.locality].filter(Boolean).join(" · ") + " · Official Virginia Department of Elections committee page",
      href: committeePageUrl(h.committeeId),
      score: h.score,
      external: true,
    });
    if (hits.length >= cap) break;
  }
  return hits;
}

function donorHits(donors: DonorRecord[], query: string, cap: number): GlobalHit[] {
  return searchDonors(donors, query, cap).map((d) => {
    const top = d.recipients[0];
    const more = d.recipients.length > 1 ? ` and ${d.recipients.length - 1} more` : "";
    const dest = top ? `${top.committeeName}${more}` : `${d.giftCount} reported gifts`;
    return {
      id: `donor-${d.id}`,
      category: "Donor" as const,
      title: d.name,
      snippet: `${formatUsd(d.totalCents)} in official Schedule A/B reports to ${dest}`,
      href: donorHref(d.id),
      score: d.score,
    };
  });
}

const CATEGORY_ORDER: GlobalCategory[] = [
  "Legislator",
  "Local Candidate",
  "Committee",
  "Donor",
  "2027 Bill",
  "Meeting / Page",
];

/** People, committees, donors, and 2027 bills. Site pages and meetings stay in the existing search UI. */
export function searchGlobal(query: string, data: GlobalSearchData): GlobalHit[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const peoplePool = [...data.legislators, ...data.locals];
  const hits = [
    ...peopleHits(data.legislators, q, "Legislator", 6),
    ...peopleHits(data.locals, q, "Local Candidate", 6),
    ...committeeHits(peoplePool, q, 6),
    ...donorHits(data.donors, q, 6),
    ...searchBills(data.bills, q, 8),
  ];
  hits.sort((a, b) => {
    const cat = CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category);
    if (cat) return cat;
    return b.score - a.score || a.title.localeCompare(b.title);
  });
  return hits;
}

export function donorByParam(donors: DonorRecord[], raw: string): DonorRecord | null {
  return findDonor(donors, raw);
}

export { CATEGORY_ORDER };
