import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { ArrowRight } from "lucide-react";
import { LEGACY_SOON, LEGACY_TILE, LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { COUNTY_SHELVES, type ShelfDoor } from "@/content/counties";

export const Route = createFileRoute("/counties/")({ component: CountiesIndex });

function DoorCard({ door }: { door: ShelfDoor }) {
  if (door.live && door.to) {
    return (
      <Link
        to={door.to}
        className={LEGACY_TILE}
      >
        <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
        <p className="inline-flex w-fit items-center rounded bg-gold px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest text-navy-900 uppercase">Live</p>
        <p className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">{door.name}</p>
        <p className="mt-2 text-sm text-on-dark-muted">{door.dek}</p>
      </Link>
    );
  }

  return (
    <div className={LEGACY_SOON}>
      <p className="w-fit rounded border border-on-dark-muted/50 px-1.5 py-0.5 font-mono text-xs tracking-widest text-on-dark-muted uppercase">
        Coming soon
      </p>
      <p className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">{door.name}</p>
      <p className="mt-2 text-sm text-on-dark-muted">{door.dek}</p>
    </div>
  );
}

function CountiesIndex() {
  return (
    <SiteShell>
      <LegacyV4>
      <HomeSearch />
      <LegacyHero trail={[{ label: "VA Counties" }]}
        kicker={
          <>
            <p>Virginia</p>
            <p className="mt-2 font-mono text-xs tracking-widest">Local meetings · public record</p>
          </>
        }
        title="VA Counties"
      >
        <p className="text-lg">
          County and school board doors for meetings and the official record. No dossiers.
        </p>
        <p className="text-sm">
          Cities:{" "}
          <Link to="/cities" className="font-semibold text-gold underline-offset-2 hover:underline">
            City of Fairfax and City of Manassas
          </Link>
          .
        </p>
      </LegacyHero>
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-8 sm:py-12">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {COUNTY_SHELVES.map((shelf) => (
            <li key={shelf.id} className="flex flex-col gap-4">
              <DoorCard door={shelf.county} />
              <DoorCard door={shelf.schools} />
            </li>
          ))}
        </ul>
      </div>
      </LegacyV4>
    </SiteShell>
  );
}
