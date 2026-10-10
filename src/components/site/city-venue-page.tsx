import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { CityMeetingList, CityMeetingSearch } from "@/components/site/city-meeting-search";
import {
  CITY_BY_ID,
  CITY_VENUES,
  cityMeetingsFor,
  type CityId,
  type CityVenueId,
} from "@/content/cities";
import { CITY_RECAPS } from "@/content/city-recaps";

export function CityVenuePage({ city, venue }: { city: CityId; venue: CityVenueId }) {
  const c = CITY_BY_ID[city];
  const v = CITY_VENUES[venue];
  const other = c.venues.find((x) => x !== venue)!;
  const recaps = CITY_RECAPS.filter((r) => r.venue === venue);
  const count = cityMeetingsFor(venue).length;
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
          {v.body === "schools" ? (
            <>
              <span className="mx-2 text-border">/</span>Schools
            </>
          ) : null}
        </p>
        <Kicker className="mt-4">Virginia · Northern Virginia</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          {v.name}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Find the Moment: search what was said in {count} {v.boardLabel} meetings since January
          2025 and jump straight to the official video ({v.videoHost}).
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Also:{" "}
          <Link
            to={CITY_VENUES[other].route}
            params={{ city }}
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            {CITY_VENUES[other].name}
          </Link>{" "}
          ·{" "}
          <Link
            to="/cities/$city/find-the-moment"
            params={{ city }}
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            Search council + schools together
          </Link>
        </p>

        <section className="mt-10">
          <h2 className="font-serif text-2xl font-medium">Find the Moment</h2>
          <div className="mt-4">
            <CityMeetingSearch venues={[venue]} />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">Meeting recaps</h2>
          {recaps.length ? (
            <ul className="mt-4 space-y-2">
              {recaps.map((r) => (
                <li key={r.slug}>
                  <Link
                    to="/cities/$city/recaps/$slug"
                    params={{ city, slug: r.slug }}
                    className="text-[#1E4B8E] underline-offset-2 hover:underline"
                  >
                    {r.title}, {r.dateLabel}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Recaps post as meetings are transcribed. Decisions and votes come only from the{" "}
              {v.votesSource}.
            </p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">Meetings (2025–2026)</h2>
          <div className="mt-4">
            <CityMeetingList venues={[venue]} />
          </div>
        </section>

        <section className="mt-12">
          <Kicker>Official doors</Kicker>
          <ul className="mt-3 space-y-1.5 text-sm">
            {v.doors.map((d) => (
              <li key={d.href}>
                <a
                  href={d.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#1E4B8E] underline-offset-2 hover:underline"
                >
                  {d.label}
                  <ExternalLink className="size-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SiteShell>
  );
}

export function CityMissing() {
  return (
    <SiteShell>
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-medium">Not found</h1>
        <p className="mt-4">
          <Link to="/cities" className="text-[#1E4B8E] underline-offset-2 hover:underline">
            Back to VA Cities
          </Link>
        </p>
      </main>
    </SiteShell>
  );
}
