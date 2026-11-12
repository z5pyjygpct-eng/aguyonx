import SITTING from "../content/finance-sitting-local.json";
import { committeePageUrl } from "./campaign-money-search.ts";

export type LocalCampaignMoneyLink = {
  href: string;
  committeeName: string;
  committeeCode: string;
};

type SittingRow = { committeeId: string; committeeName: string; committeeCode: string };

const MEMBERS = SITTING.members as Record<string, SittingRow>;

/** Official committee page for a sitting local member on a roster we already publish. */
export function sittingLocalCampaignMoney(
  venue: "loudoun-bos" | "loudoun-lcps",
  name: string,
): LocalCampaignMoneyLink | null {
  const row = MEMBERS[`${venue}|${name}`];
  if (!row?.committeeId) return null;
  return {
    href: committeePageUrl(row.committeeId),
    committeeName: row.committeeName,
    committeeCode: row.committeeCode,
  };
}
