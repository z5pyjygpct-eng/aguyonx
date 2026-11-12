import { fuzzyScore } from "./name-search.ts";

export const COMMITTEE_PAGE_BASE = "https://cfreports.elections.virginia.gov/Committee/Index/";

export function committeePageUrl(committeeId: string): string {
  return COMMITTEE_PAGE_BASE + committeeId;
}

export function profileHref(chamber: string, slug: string): string {
  return `/dashboards/${chamber}/members/${slug}`;
}

export type OfficeKind = "legislator" | "supervisor" | "school-board";

export type CampaignMoneyRecord = {
  kind: OfficeKind;
  name: string;
  committeeName: string;
  committeeCode: string;
  committeeId: string;
  candidateName?: string;
  officeLabel: string;
  lisId?: string;
  slug?: string;
  chamber?: "house" | "senate";
  district?: number | string;
  localityId?: string | null;
  locality?: string | null;
  seat?: string;
};

export type CampaignMoneyHit = CampaignMoneyRecord & {
  href: string;
  profileHref: string | null;
  score: number;
};

export type CampaignMoneyFilter = {
  kind?: OfficeKind | "all";
  localityId?: string;
};

function officeText(row: CampaignMoneyRecord): string {
  const parts = [row.officeLabel];
  if (row.chamber === "house") parts.push(`House of Delegates District ${row.district} HD${row.district}`);
  if (row.chamber === "senate") parts.push(`Senate of Virginia District ${row.district} SD${row.district}`);
  if (row.kind === "school-board") parts.push("School Board");
  if (row.kind === "supervisor") parts.push("Board of Supervisors supervisor");
  if (row.locality) parts.push(row.locality);
  if (row.seat) parts.push(String(row.seat));
  if (row.district != null && row.district !== "") parts.push(String(row.district));
  return parts.filter(Boolean).join(" ");
}

function recordId(row: CampaignMoneyRecord): string {
  return row.lisId || row.committeeId;
}

function recordProfileHref(row: CampaignMoneyRecord): string | null {
  if (row.chamber && row.slug) return profileHref(row.chamber, row.slug);
  return null;
}

export function rankCampaignMoney(
  records: CampaignMoneyRecord[],
  query: string,
  cap = 25,
  filter: CampaignMoneyFilter = {},
): CampaignMoneyHit[] {
  const q = query.trim();
  if (!q) return [];
  const hits: CampaignMoneyHit[] = [];
  for (const row of records) {
    if (!row.committeeId) continue;
    if (filter.kind && filter.kind !== "all" && row.kind !== filter.kind) continue;
    if (filter.localityId && row.localityId !== filter.localityId) continue;
    const scored = fuzzyScore(q, [
      { text: row.name, weight: 12 },
      { text: row.committeeName, weight: 10 },
      { text: row.candidateName ?? "", weight: 9 },
      { text: row.committeeCode, weight: 8 },
      { text: officeText(row), weight: 7 },
    ]);
    if (!scored) continue;
    hits.push({
      ...row,
      href: committeePageUrl(row.committeeId),
      profileHref: recordProfileHref(row),
      score: scored.score,
    });
  }
  hits.sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name) || recordId(a).localeCompare(recordId(b)),
  );
  return hits.slice(0, cap);
}

export function asLegislatorRecord(row: {
  lisId: string;
  slug: string;
  name: string;
  chamber: "house" | "senate";
  district: number;
  committeeName: string;
  committeeCode: string;
  committeeId: string;
  candidateName?: string;
}): CampaignMoneyRecord {
  const body = row.chamber === "house" ? "House of Delegates" : "Senate of Virginia";
  const short = row.chamber === "house" ? "HD" : "SD";
  return {
    kind: "legislator",
    name: row.name,
    committeeName: row.committeeName,
    committeeCode: row.committeeCode,
    committeeId: row.committeeId,
    candidateName: row.candidateName,
    officeLabel: `${body} · District ${row.district}`,
    lisId: row.lisId,
    slug: row.slug,
    chamber: row.chamber,
    district: row.district,
    // so "HD45" still matches
    seat: `${short}${row.district}`,
  };
}

export function asLocalRecord(row: {
  kind: "supervisor" | "school-board";
  name: string;
  candidateName?: string;
  committeeName: string;
  committeeCode: string;
  committeeId: string;
  officeLabel?: string;
  localityId?: string | null;
  locality?: string | null;
  seat?: string;
  district?: string;
}): CampaignMoneyRecord {
  return {
    kind: row.kind,
    name: row.candidateName || row.name,
    committeeName: row.committeeName,
    committeeCode: row.committeeCode,
    committeeId: row.committeeId,
    candidateName: row.candidateName || row.name,
    officeLabel: row.officeLabel || "",
    localityId: row.localityId ?? null,
    locality: row.locality ?? null,
    seat: row.seat,
    district: row.district,
  };
}
