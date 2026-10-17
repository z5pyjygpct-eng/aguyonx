import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/site/budget-page";
import { LCPS_BUDGET_PAGE } from "@/lib/budget-pages/lcps";

export const Route = createFileRoute("/dashboards/loudoun/schools/budget")({
  head: () => ({ meta: [{ title: "LCPS Budget & Finance · A Guy on X" }] }),
  component: () => <BudgetPage data={LCPS_BUDGET_PAGE} />,
});
