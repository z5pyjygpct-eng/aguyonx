import { asLegislatorRecord, asLocalRecord, type CampaignMoneyRecord } from "@/lib/campaign-money-search";
import { expandDonorFile, type DonorFile, type DonorRecord } from "@/lib/finance-donors";
import type { FinanceIndex } from "@/lib/finance-summaries";
import { searchGlobal, type CompactBill, type GlobalHit, type GlobalSearchData } from "@/lib/global-search";

type LegislatorFile = {
  members: Record<string, Parameters<typeof asLegislatorRecord>[0]>;
};

type LocalFile = {
  committees: Parameters<typeof asLocalRecord>[0][];
};

type BillFile = { bills: CompactBill[] };

let cache: Promise<GlobalSearchData> | null = null;

function unwrap<T>(mod: { default?: T } | T): T {
  if (mod && typeof mod === "object" && "default" in mod && (mod as { default?: T }).default) {
    return (mod as { default: T }).default;
  }
  return mod as T;
}

function loadData(): Promise<GlobalSearchData> {
  return (cache ??= Promise.all([
    import("@/content/finance-committees.json"),
    import("@/content/finance-local-committees.json"),
    import("@/content/finance-donors.json"),
    import("@/content/bills-2027-search.json"),
    import("@/content/finance-summaries/_index.json"),
  ])
    .then(([legs, locals, donors, bills, indexMod]) => {
      const legislatorFile = unwrap(legs as unknown as { default?: LegislatorFile } | LegislatorFile);
      const localFile = unwrap(locals as unknown as { default?: LocalFile } | LocalFile);
      const donorFile = unwrap(donors as unknown as { default?: DonorFile } | DonorFile);
      const billFile = unwrap(bills as unknown as { default?: BillFile } | BillFile);
      const indexFile = unwrap(indexMod as unknown as { default?: FinanceIndex } | FinanceIndex);
      const legislators: CampaignMoneyRecord[] = Object.values(legislatorFile.members).map(asLegislatorRecord);
      const localRecords: CampaignMoneyRecord[] = (localFile.committees ?? []).map(asLocalRecord);
      const donorRecords: DonorRecord[] = expandDonorFile(donorFile);
      return {
        legislators,
        locals: localRecords,
        donors: donorRecords,
        bills: billFile.bills ?? [],
        members: indexFile.members ?? [],
      };
    })
    .catch((err) => {
      cache = null;
      throw err;
    }));
}

export async function searchGlobalLive(query: string): Promise<GlobalHit[]> {
  const data = await loadData();
  return searchGlobal(query, data);
}

export async function loadDonors(): Promise<DonorRecord[]> {
  const data = await loadData();
  return data.donors;
}
