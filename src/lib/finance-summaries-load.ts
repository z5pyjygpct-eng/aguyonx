import type { FinanceIndex, FinanceSummary } from "./finance-summaries.ts";

const MEMBER_LOADERS = import.meta.glob<{ default: FinanceSummary }>("../content/finance-summaries/*.json");

export async function loadFinanceSummary(slug: string): Promise<FinanceSummary | null> {
  const key = `../content/finance-summaries/${slug}.json`;
  const loader = MEMBER_LOADERS[key];
  if (!loader) return null;
  const mod = await loader();
  return (mod as { default: FinanceSummary }).default;
}

export async function loadFinanceIndex(): Promise<FinanceIndex> {
  const mod = await import("../content/finance-summaries/_index.json");
  return (mod as { default: FinanceIndex }).default;
}

export function findIndexRow(index: FinanceIndex, slugOrLis: string) {
  const q = slugOrLis.trim().toLowerCase();
  return index.members.find((m) => m.slug === q || m.lisId.toLowerCase() === q);
}
