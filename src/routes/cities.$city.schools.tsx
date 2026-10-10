import { CityMissing, CityVenuePage } from "@/components/site/city-venue-page";
import { createFileRoute } from "@tanstack/react-router";
import { CITY_BY_ID, type CityId } from "@/content/cities";

export const Route = createFileRoute("/cities/$city/schools")({
  component: Page,
});

function Page() {
  const { city } = Route.useParams();
  const c = CITY_BY_ID[city as CityId];
  if (!c) return <CityMissing />;
  return <CityVenuePage city={c.id} venue={c.venues[1]} />;
}
