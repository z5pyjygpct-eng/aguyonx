import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { ArrowRight } from "lucide-react";
import { LEGACY_TILE, LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { SENATE_MEETINGS, senateTranscriptCount } from "@/content/va-senate";
import { HOUSE_MEETINGS, houseTranscriptCount } from "@/content/va-house";

export const Route = createFileRoute("/general-assembly/")({
  component: GeneralAssemblyIndex,
  head: () => ({ meta: [{ title: "Virginia General Assembly · Find the Moment · A Guy on X" }] }),
});

function GeneralAssemblyIndex() {
  const n = senateTranscriptCount();
  const h = houseTranscriptCount();
  return (
    <SiteShell>
      <LegacyV4>
      <HomeSearch />
      <LegacyHero trail={[{ label: "General Assembly" }]} kicker="Virginia" title="General Assembly">
        <p className="text-lg">
          Floor sessions of the Virginia legislature: search what was said, jump to the official
          video, and see how each member voted from the official record.
        </p>
      </LegacyHero>
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8 sm:py-12">
        <ul className="grid gap-6 sm:grid-cols-2">
          <li>
            <Link
              to="/general-assembly/senate"
              className={LEGACY_TILE}
            >
              <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
              <p className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest uppercase ${n > 0 ? "bg-gold text-navy-900" : "border border-gold/60 text-gold"}`}>
                {n > 0 ? "Live" : "Transcripts in progress"}
              </p>
              <p className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">Senate of Virginia</p>
              <p className="mt-2 text-sm text-on-dark-muted">
                {n} of {SENATE_MEETINGS.length} 2026 floor sessions searchable. Recaps with LIS
                roll-call votes.
              </p>
            </Link>
          </li>
          <li>
            <Link
              to="/general-assembly/house"
              className={LEGACY_TILE}
            >
              <ArrowRight className="absolute top-4 right-4 size-5 text-gold transition-transform group-hover:translate-x-0.5" aria-hidden />
              <p className={`inline-flex w-fit items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-bold tracking-widest uppercase ${h > 0 ? "bg-gold text-navy-900" : "border border-gold/60 text-gold"}`}>
                {h > 0 ? "Live" : "Transcripts in progress"}
              </p>
              <p className="mt-2 font-serif text-2xl font-bold uppercase leading-tight">House of Delegates</p>
              <p className="mt-2 text-sm text-on-dark-muted">
                {h} of {HOUSE_MEETINGS.length} 2026 floor session videos searchable. Recaps with LIS
                roll-call votes.
              </p>
            </Link>
          </li>
        </ul>
      </div>
      </LegacyV4>
    </SiteShell>
  );
}
