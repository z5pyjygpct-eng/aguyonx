import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { ArrowRight } from "lucide-react";
import { LEGACY_TILE, LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { CITIES, CITY_VENUES, cityMeetingsFor, cityTranscriptCount } from "@/content/cities";

export const Route = createFileRoute("/cities/")({ component: CitiesIndex });

function CitiesIndex() {
  return (
    <SiteShell>
      <LegacyV4>
      <HomeSearch />
      <LegacyHero trail={[{ label: "VA Cities & Counties" }]} kicker="Virginia" title={<>VA Cities &amp; Counties</>}>
        <p className="text-lg">
          Council, Board of Supervisors and school board meetings (Albemarle since January 2024,
          cities since January 2025): search what was said, jump to the official video.
        </p>
      </LegacyHero>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-12">
        <ul className="grid gap-6 sm:grid-cols-2">
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
                    className={LEGACY_TILE}
                  >
                    <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
                    <p className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest uppercase ${n > 0 ? "bg-gold text-navy-900" : "border border-gold/60 text-gold"}`}>
                      {n > 0 ? "Live" : "Transcripts in progress"}
                    </p>
                    <p className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">{v.name}</p>
                    <p className="mt-2 text-sm text-on-dark-muted">
                      {n} of {cityMeetingsFor(id).length} meetings searchable (2025–2026).
                    </p>
                  </Link>
                );
              })}
            </li>
          ))}
        </ul>
      </div>
      </LegacyV4>
    </SiteShell>
  );
}
