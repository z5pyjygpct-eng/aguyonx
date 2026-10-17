import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/site/budget-page";
import { ALBEMARLE_BOS_BUDGET_PAGE } from "@/lib/budget-pages/albemarle-bos";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/albemarle/bos/budget")({
  head: () => ({ meta: [{ title: "Albemarle BOS Budget & Finance · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <BudgetPage data={ALBEMARLE_BOS_BUDGET_PAGE} />,
});
