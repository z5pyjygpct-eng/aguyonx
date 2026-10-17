import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/site/budget-page";
import { FAIRFAX_CITY_COUNCIL_BUDGET_PAGE } from "@/lib/budget-pages/fairfax-city-council";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/fairfax-city/council/budget")({
  head: () => ({ meta: [{ title: "City of Fairfax Council Budget & Finance · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <BudgetPage data={FAIRFAX_CITY_COUNCIL_BUDGET_PAGE} />,
});
