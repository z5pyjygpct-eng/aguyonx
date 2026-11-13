import type { CampaignMoneyRecord, OfficeKind } from "./campaign-money-search.ts";
import type { DonorRecord } from "./finance-donors.ts";
import type { DonorKind, FinanceGift, FinanceSummary } from "./finance-summaries.ts";
import { moneyMatches, parseMoneyQuery, type MoneyQuery } from "./money-query.ts";

export type DonorTypePill = "individual" | "committee" | "business";
export type DollarRangePill = "1k-5k" | "5k-15k" | "15k+";

export const DONOR_TYPE_PILLS: { id: DonorTypePill; label: string }[] = [
  { id: "individual", label: "Individuals" },
  { id: "committee", label: "PACs & Committees" },
  { id: "business", label: "Businesses & Orgs" },
];

export const DOLLAR_RANGE_PILLS: { id: DollarRangePill; label: string }[] = [
  { id: "1k-5k", label: "$1,000–$5,000" },
  { id: "5k-15k", label: "$5,001–$15,000" },
  { id: "15k+", label: "$15,000+" },
];

const PARTY_RE =
  /\b(republican party|democratic party|democrat party|libertarian party|green party|\bgop\b|virginia democrats|virginia republican|house republican|house democratic|senate republican|senate democratic|legislative majority|legislative caucus|party committee|political party)\b/i;
const CAND_RE =
  /\b(candidate committee|for delegate|for senate|for senator|for house|for supervisor|for school board|for congress|for clerk|for sheriff|for treasurer|for commissioner|for mayor|for council)\b/i;
const PAC_RE =
  /\b(political action|political committee|leadership pac|cce|referendum committee|committee for responsible government)\b|pac\b/i;

export function classifyDonorKind(name: string, occupation = "", isIndividual?: boolean, existing?: DonorKind): DonorKind {
  const blob = `${name} ${occupation}`;
  if (PARTY_RE.test(blob) || existing === "party") return "party";
  if (CAND_RE.test(blob) || existing === "candidate") return "candidate";
  if (PAC_RE.test(blob) || existing === "pac") return "pac";
  if (existing === "individual" || isIndividual === true) return "individual";
  if (existing === "business" || isIndividual === false) return "business";
  return "individual";
}

export function donorTypePill(kind: DonorKind): DonorTypePill {
  if (kind === "individual") return "individual";
  if (kind === "business") return "business";
  return "committee";
}

export function inDollarRange(cents: number, range: DollarRangePill): boolean {
  if (range === "1k-5k") return cents >= 100_000 && cents <= 500_000;
  if (range === "5k-15k") return cents >= 500_100 && cents < 1_500_000;
  return cents >= 1_500_000;
}

export function inAnyDollarRange(cents: number, ranges: DollarRangePill[]): boolean {
  if (!ranges.length) return true;
  return ranges.some((range) => inDollarRange(cents, range));
}

export type FilterGift = FinanceGift & {
  recipientName: string;
  recipientSlug?: string;
  chamber?: "house" | "senate";
};

export type FilterDonor = {
  id: string;
  name: string;
  kind: DonorKind;
  cents: number;
  count: number;
  donorId?: string;
  gifts: FilterGift[];
};

function donorKey(donorId: string | undefined, name: string): string {
  return (donorId || name).trim().toLowerCase();
}

function mergeDonor(map: Map<string, FilterDonor>, input: Omit<FilterDonor, "gifts"> & { gifts?: FilterGift[] }) {
  const key = donorKey(input.donorId, input.name);
  const rec = map.get(key) ?? {
    id: key,
    name: input.name,
    kind: input.kind,
    cents: 0,
    count: 0,
    donorId: input.donorId,
    gifts: [],
  };
  rec.cents += input.cents;
  rec.count += input.count;
  if (input.name.length > rec.name.length) rec.name = input.name;
  if (input.donorId && !rec.donorId) rec.donorId = input.donorId;
  if (input.kind && rec.kind === "individual" && input.kind !== "individual") rec.kind = input.kind;
  if (input.gifts?.length) rec.gifts.push(...input.gifts);
  map.set(key, rec);
}

export function donorsFromSummaries(
  summaries: FinanceSummary[],
  slugs?: Set<string>,
): FilterDonor[] {
  const map = new Map<string, FilterDonor>();
  for (const summary of summaries) {
    if (summary.status !== "ready") continue;
    if (slugs && !slugs.has(summary.slug)) continue;
    const recipientName = `${summary.honorific} ${summary.name}`;
    for (const donor of summary.donors ?? []) {
      mergeDonor(map, {
        id: donorKey(donor.donorId, donor.name),
        name: donor.name,
        kind: donor.kind,
        cents: donor.cents,
        count: donor.count,
        donorId: donor.donorId,
        gifts: (donor.gifts ?? []).map((gift) => ({
          ...gift,
          recipientName,
          recipientSlug: summary.slug,
          chamber: summary.chamber,
        })),
      });
    }
  }
  return finalize(map);
}

export function donorsFromGlobal(
  donors: DonorRecord[],
  localRecords: CampaignMoneyRecord[],
  office: OfficeKind | "all",
): FilterDonor[] {
  if (office !== "supervisor" && office !== "school-board" && office !== "all") return [];
  const wanted = new Set(
    localRecords.filter((row) => office === "all" || row.kind === office).map((row) => row.committeeId),
  );
  if (!wanted.size) return [];
  const map = new Map<string, FilterDonor>();
  for (const donor of donors) {
    const scoped = donor.recipients.filter((r) => r.committeeId && wanted.has(r.committeeId));
    if (!scoped.length) continue;
    const cents = scoped.reduce((sum, r) => sum + r.amountCents, 0);
    const count = scoped.reduce((sum, r) => sum + r.giftCount, 0);
    mergeDonor(map, {
      id: donor.id,
      name: donor.name,
      kind: classifyDonorKind(donor.name, "", donor.org ? false : true),
      cents,
      count,
      donorId: donor.id,
      gifts: [],
    });
  }
  return finalize(map);
}

function finalize(map: Map<string, FilterDonor>): FilterDonor[] {
  const list = [...map.values()];
  for (const donor of list) {
    donor.gifts.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.cents - a.cents);
  }
  return list.sort((a, b) => b.cents - a.cents || a.name.localeCompare(b.name));
}

export function mergeFilterDonors(groups: FilterDonor[][]): FilterDonor[] {
  const map = new Map<string, FilterDonor>();
  for (const group of groups) {
    for (const donor of group) mergeDonor(map, donor);
  }
  return finalize(map);
}

export function filterDonors(
  donors: FilterDonor[],
  opts: {
    types?: DonorTypePill[];
    ranges?: DollarRangePill[];
    query?: string;
    money?: MoneyQuery | null;
    cap?: number;
  } = {},
): FilterDonor[] {
  const types = opts.types ?? [];
  const ranges = opts.ranges ?? [];
  const money = opts.money ?? (opts.query ? parseMoneyQuery(opts.query) : null);
  const name = (money ? money.rest : opts.query ?? "").trim().toLowerCase();
  const tokens = name ? name.split(/\s+/).filter(Boolean) : [];
  const hits: FilterDonor[] = [];
  for (const donor of donors) {
    if (types.length && !types.includes(donorTypePill(donor.kind))) continue;
    if (!inAnyDollarRange(donor.cents, ranges)) continue;
    if (money && !moneyMatches(donor.cents, money)) continue;
    if (tokens.length && !tokens.every((tok) => donor.name.toLowerCase().includes(tok))) continue;
    hits.push(donor);
  }
  hits.sort((a, b) => b.cents - a.cents || a.name.localeCompare(b.name));
  return hits.slice(0, opts.cap ?? 40);
}

export function toggleList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
