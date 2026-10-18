import { CityMissing } from "@/components/site/city-venue-page";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { CityMeetingList, CityMeetingSearch } from "@/components/site/city-meeting-search";
import { CITY_BY_ID, type CityId } from "@/content/cities";

export const Route = createFileRoute("/cities/$city/find-the-moment")({ component: Page });

function Page() {
  const { city } = Route.useParams();
  const c = CITY_BY_ID[city as CityId];
  if (!c) return <CityMissing />;
  return (
    <SiteShell location={`${c.name}, Virginia`}>
      <LegacyV4>
      <HomeSearch />
      <LegacyHero
        crumbs={
        <p>
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
        }
        kicker={<>Virginia · {c.region}</>}
        title={<>Search {c.shortName} Council + Schools together</>}
      />
      <div className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-8">
        <div className="mt-10">
          <CityMeetingSearch venues={c.venues} />
        </div>
        <div className="mt-10">
          <h2 className="font-serif text-2xl font-medium">Meetings &amp; recaps</h2>
          <div className="mt-4"><CityMeetingList venues={c.venues} /></div>
        </div>
      </div>
      </LegacyV4>
    </SiteShell>
  );
}
