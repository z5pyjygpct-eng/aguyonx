import { createFileRoute } from "@tanstack/react-router";
import { BudgetPage } from "@/components/site/budget-page";
import { FAIRFAX_CITY_SCHOOLS_BUDGET_PAGE } from "@/lib/budget-pages/fairfax-city-schools";
import { GA_PREVIEW_ROBOTS } from "@/lib/ga-dashboard";

export const Route = createFileRoute("/dashboards/fairfax-city/schools/budget")({
  head: () => ({ meta: [{ title: "Fairfax City Schools Budget & Finance · A Guy on X" }, ...GA_PREVIEW_ROBOTS] }),
  component: () => <BudgetPage data={FAIRFAX_CITY_SCHOOLS_BUDGET_PAGE} />,
});
