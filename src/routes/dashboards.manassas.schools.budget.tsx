import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/site/budget-page";
import { MANASSAS_SCHOOLS_BUDGET_PAGE } from "@/lib/budget-pages/manassas-schools";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/manassas/schools/budget")({
  head: () => ({ meta: [{ title: "MCPS Budget & Finance · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <BudgetPage data={MANASSAS_SCHOOLS_BUDGET_PAGE} />,
});
