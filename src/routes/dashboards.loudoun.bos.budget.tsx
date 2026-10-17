import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/site/budget-page";
import { LOUDOUN_BOS_BUDGET_PAGE } from "@/lib/budget-pages/loudoun-bos";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/loudoun/bos/budget")({
  head: () => ({ meta: [{ title: "Loudoun County BOS Budget & Finance · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <BudgetPage data={LOUDOUN_BOS_BUDGET_PAGE} />,
});
