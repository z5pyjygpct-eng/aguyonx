import { fuzzyScore } from "./name-search.ts";
import { COMMITTEE_PAGE_BASE } from "./campaign-money-search.ts";

export type DonorRecipient = {
  committeeId?: string;
  committeeName: string;
  committeeCode?: string;
  candidateName?: string;
  amountCents: number;
  giftCount: number;
};

export type DonorRecord = {
  id: string;
  name: string;
  org: boolean;
  totalCents: number;
  giftCount: number;
  recipients: DonorRecipient[];
};

type CompactCommittee = { n: string; i?: string; c?: string; a?: string };
type CompactDonor = { id: string; n: string; o: number; t: number; c: number; r: number[][] };

export type DonorFile = {
  generated: string;
  source: string;
  months: string[];
  counts: Record<string, number>;
  committees: CompactCommittee[];
  donors: CompactDonor[];
};

export function expandDonorFile(raw: DonorFile): DonorRecord[] {
  const committees = raw.committees ?? [];
  return (raw.donors ?? []).map((d) => ({
    id: d.id,
    name: d.n,
    org: d.o === 1,
    totalCents: d.t,
    giftCount: d.c,
    recipients: (d.r ?? []).map(([idx, amount, n]) => {
      const c = committees[idx] ?? { n: "Unknown committee" };
      return {
        committeeId: c.i,
        committeeName: c.n,
        committeeCode: c.c,
        candidateName: c.a,
        amountCents: amount,
        giftCount: n,
      };
    }),
  }));
}

export function formatUsd(cents: number): string {
  const dollars = cents / 100;
  const hasCents = Math.abs(cents) % 100 !== 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(dollars);
}

export function officialCommitteeHref(committeeId?: string): string | null {
  if (!committeeId) return null;
  return `${COMMITTEE_PAGE_BASE}${committeeId}`;
}

export function searchDonors(donors: DonorRecord[], query: string, cap = 8): Array<DonorRecord & { score: number }> {
  const q = query.trim();
  if (!q) return [];
  const hits: Array<DonorRecord & { score: number }> = [];
  for (const d of donors) {
    const scored = fuzzyScore(q, [{ text: d.name, weight: 10 }]);
    if (!scored) continue;
    hits.push({ ...d, score: scored.score + (scored.phrase ? 4 : 0) + Math.log10(Math.max(d.totalCents, 1)) });
  }
  hits.sort((a, b) => b.score - a.score || b.totalCents - a.totalCents || a.name.localeCompare(b.name));
  return hits.slice(0, cap);
}

export function findDonor(donors: DonorRecord[], idOrName: string): DonorRecord | null {
  const raw = idOrName.trim();
  if (!raw) return null;
  const exact = donors.find((d) => d.id === raw || d.name.toLowerCase() === raw.toLowerCase());
  if (exact) return exact;
  return searchDonors(donors, raw, 1)[0] ?? null;
}
