import FINANCE_COMMITTEES from "../content/finance-committees.json";
import {
  asLegislatorRecord,
  committeePageUrl,
  rankCampaignMoney as rankRecords,
  type CampaignMoneyFilter,
  type CampaignMoneyHit,
  type CampaignMoneyRecord,
} from "./campaign-money-search.ts";

export {
  committeePageUrl,
  profileHref,
  rankCampaignMoney,
  asLegislatorRecord,
  asLocalRecord,
  type CampaignMoneyFilter,
  type CampaignMoneyHit,
  type CampaignMoneyRecord,
  type OfficeKind,
} from "./campaign-money-search.ts";

export type CampaignMoneyLink = {
  href: string;
  committeeName: string;
  committeeCode: string;
};

type LegislatorRow = {
  lisId: string;
  slug: string;
  name: string;
  chamber: "house" | "senate";
  district: number;
  committeeName: string;
  committeeCode: string;
  committeeId: string;
  candidateName?: string;
};

const MEMBERS = FINANCE_COMMITTEES.members as Record<string, LegislatorRow>;

export const LEGISLATOR_RECORDS: CampaignMoneyRecord[] = Object.values(MEMBERS).map(asLegislatorRecord);

/**
 * Official Virginia Department of Elections committee page for a sitting
 * legislator, keyed by LIS id. Returns null when no committee page has been
 * confirmed, so the profile header can hide the button rather than guess.
 */
export function campaignMoneyLink(lisId: string): CampaignMoneyLink | null {
  const row = MEMBERS[lisId];
  if (!row?.committeeId) return null;
  return {
    href: committeePageUrl(row.committeeId),
    committeeName: row.committeeName,
    committeeCode: row.committeeCode,
  };
}

/** Fuzzy lookup across sitting legislators' official committee records. */
export function searchLegislatorCampaignMoney(
  query: string,
  cap = 25,
  filter: CampaignMoneyFilter = {},
): CampaignMoneyHit[] {
  return rankRecords(LEGISLATOR_RECORDS, query, cap, filter);
}
