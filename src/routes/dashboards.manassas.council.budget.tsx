import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/site/budget-page";
import { MANASSAS_COUNCIL_BUDGET_PAGE } from "@/lib/budget-pages/manassas-council";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/manassas/council/budget")({
  head: () => ({ meta: [{ title: "Manassas City Council Budget & Finance · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <BudgetPage data={MANASSAS_COUNCIL_BUDGET_PAGE} />,
});
