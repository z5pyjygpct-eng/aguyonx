import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/site/budget-page";
import { ALBEMARLE_SCHOOLS_BUDGET_PAGE } from "@/lib/budget-pages/albemarle-schools";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/albemarle/schools/budget")({
  head: () => ({ meta: [{ title: "ACPS Budget & Finance · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <BudgetPage data={ALBEMARLE_SCHOOLS_BUDGET_PAGE} />,
});
