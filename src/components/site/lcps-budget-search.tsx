import { BudgetDocSearch, type BudgetSearchConfig } from "@/components/site/budget-page/budget-search";
import { LCPS_BUDGET_SEARCH_DOCS, lcpsBudgetExtractHref } from "@/content/lcps-budget";

const LCPS_SEARCH: BudgetSearchConfig = {
  docs: LCPS_BUDGET_SEARCH_DOCS,
  extractHref: (doc) => lcpsBudgetExtractHref(doc.extractId),
  chips: [
    { label: "Local tax", query: "local tax" },
    { label: "Operating fund", query: "operating fund" },
    { label: "CAPP", query: "CAPP" },
    { label: "CIP", query: "capital projects" },
    { label: "2,066", query: "2,066" },
    { label: "SEON", query: "SEON" },
    { label: "May 12", query: "May 12" },
  ],
  inputId: "lcps-budget-q",
  srLabel: "Search the Loudoun schools budget records",
  intro: <>
        Looks inside the hosted PDFs — operating totals, LTF, CIP/CAPP, fund names, amendment
        language — not just filenames. Proposed ≠ adopted stays labeled on each hit.
  </>,
  placeholder: "local tax, 2,066, CAPP, May 12…",
  emptyHint: <>
              Nothing matched in the hosted budget records. Try a shorter token (CAPP, LTF, SEON)
              or a dollar fragment (2,066). This shelf only searches the files listed below — not
              the whole site.
  </>,
};

export function LcpsBudgetSearch() {
  return <BudgetDocSearch cfg={LCPS_SEARCH} />;
}
