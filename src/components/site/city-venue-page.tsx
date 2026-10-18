import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CityMeetingList, CityMeetingSearch } from "@/components/site/city-meeting-search";
import {
  CITY_BY_ID,
  CITY_VENUES,
  cityMeetingsFor,
  type CityId,
  type CityVenueId,
} from "@/content/cities";
import { CITY_RECAPS } from "@/content/city-recaps";
import { FTM_TRANSCRIPTS } from "@/content/ftm-transcripts";
import { VenueStats } from "@/components/site/loudoun-stats";

export function CityVenuePage({ city, venue }: { city: CityId; venue: CityVenueId }) {
  const c = CITY_BY_ID[city];
  const v = CITY_VENUES[venue];
  const other = c.venues.find((x) => x !== venue)!;
  const recaps = CITY_RECAPS.filter((r) => r.venue === venue);
  const all = cityMeetingsFor(venue);
  const count = all.length;
  const done = new Set(FTM_TRANSCRIPTS.map((t) => t.meetingId));
  const searchableN = all.filter((m) => done.has(m.id)).length;
  const today = new Date().toISOString().slice(0, 10);
  const next = all.filter((m) => m.date > today).sort((a, b) => a.date.localeCompare(b.date))[0];
  return (
    <SiteShell location={`${c.name}, Virginia`}>
      <LegacyV4>
      <HomeSearch />
      <LegacyHero
        trail={v.body === "schools" ? [{ label: "VA Cities", to: "/cities" }, { label: c.shortName, to: "/cities/$city", params: { city } }, { label: "Schools" }] : [{ label: "VA Cities", to: "/cities" }, { label: c.shortName }]}
        kicker={<>Virginia · {c.region}</>}
        title={v.name}
      >
        <p className="text-lg">
          Find the Moment: search what was said in {v.boardLabel} meetings since{" "}
          {v.since ?? "January 2025"} and jump straight to the official video ({v.videoHost}).
        </p>
        <p className="font-mono text-xs tracking-wide text-gold">
          {count} meetings · {searchableN} searchable now · {count - searchableN} in queue
          {next ? ` · Next meeting: ${next.dateLabel}` : ""}
        </p>
        <p className="text-sm">
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
            {`Search ${(CITY_VENUES[c.venues[0]].tag ?? "council").toLowerCase()} + schools together`}
          </Link>
        </p>
      </LegacyHero>
      <div className="mx-auto w-full max-w-6xl px-4 pt-2 pb-14 sm:px-8">
        <section className="mt-10">
          <h2 className="font-serif text-2xl font-medium">Find the Moment</h2>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
            <div>
              <CityMeetingSearch venues={[venue]} />
            </div>
            <VenueStats
              heading={`By the numbers · ${v.name}`}
              meetings={cityMeetingsFor(venue)}
              recapCount={recaps.length}
            />
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl font-medium">Meeting videos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {recaps.length
              ? `${recaps.length} meetings have a recap (tap the meeting or the Recap badge).`
              : "Recaps post as meetings are transcribed."}{" "}
            Decisions and votes come only from the {v.votesSource}.
          </p>
          <div className="mt-4">
            <CityMeetingList venues={[venue]} />
          </div>
        </section>

        <section className="mt-12">
          <Kicker className="text-gold">Official doors</Kicker>
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
      </div>
      </LegacyV4>
    </SiteShell>
  );
}

export function CityMissing() {
  return (
    <SiteShell>
      <LegacyV4>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <Breadcrumbs items={[{ label: "VA Cities", to: "/cities" }, { label: "Not found" }]} className="mb-8 [&_ol]:justify-center" />
          <h1 className="font-serif text-4xl font-bold uppercase">Not found</h1>
          <p className="mt-4">
            <Link to="/cities" className="text-[#1E4B8E] underline-offset-2 hover:underline">
              Back to VA Cities
            </Link>
          </p>
        </div>
      </LegacyV4>
    </SiteShell>
  );
}
