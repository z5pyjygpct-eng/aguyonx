import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { CITIES, CITY_VENUES, cityMeetingsFor, cityTranscriptCount } from "@/content/cities";

export const Route = createFileRoute("/cities/")({ component: CitiesIndex });

function CitiesIndex() {
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Virginia</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          VA Cities
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          City council and school board meetings since January 2025: search what was said, jump to
          the official video.
        </p>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2">
          {CITIES.map((c) => (
            <li key={c.id} className="flex flex-col gap-4">
              {c.venues.map((id) => {
                const v = CITY_VENUES[id];
                const n = cityTranscriptCount(id);
                return (
                  <Link
                    key={id}
                    to={v.route}
                    params={{ city: v.city }}
                    className="block rounded-md border border-border bg-card px-5 py-5 hover:bg-wash"
                  >
                    <p className="font-mono text-xs tracking-widest text-[#0d7377] uppercase">
                      {n > 0 ? "Live" : "Transcripts in progress"}
                    </p>
                    <p className="mt-2 font-serif text-2xl font-medium">{v.name}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {n} of {cityMeetingsFor(id).length} meetings searchable (2025–2026).
                    </p>
                  </Link>
                );
              })}
            </li>
          ))}
        </ul>
      </main>
    </SiteShell>
  );
}
