import { CityMissing } from "@/components/site/city-venue-page";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { CityMeetingSearch } from "@/components/site/city-meeting-search";
import { CITY_BY_ID, type CityId } from "@/content/cities";

export const Route = createFileRoute("/cities/$city/find-the-moment")({ component: Page });

function Page() {
  const { city } = Route.useParams();
  const c = CITY_BY_ID[city as CityId];
  if (!c) return <CityMissing />;
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/cities" className="hover:text-foreground hover:underline">
            VA Cities
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link
            to="/cities/$city"
            params={{ city }}
            className="hover:text-foreground hover:underline"
          >
            {c.shortName}
          </Link>
          <span className="mx-2 text-border">/</span>
          Find the Moment
        </p>
        <Kicker className="mt-4">Virginia · Northern Virginia</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Search {c.shortName} Council + Schools together
        </h1>
        <div className="mt-10">
          <CityMeetingSearch venues={c.venues} />
        </div>
      </main>
    </SiteShell>
  );
}
