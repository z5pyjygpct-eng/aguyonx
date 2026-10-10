import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { SENATE_MEETINGS, senateTranscriptCount } from "@/content/va-senate";

export const Route = createFileRoute("/general-assembly/")({
  component: GeneralAssemblyIndex,
  head: () => ({ meta: [{ title: "Virginia General Assembly · Find the Moment · A Guy on X" }] }),
});

function GeneralAssemblyIndex() {
  const n = senateTranscriptCount();
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Kicker>Virginia</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          General Assembly
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Floor sessions of the Virginia legislature: search what was said, jump to the official
          video, and see how each member voted from the official record.
        </p>
        <ul className="mt-10 grid gap-8 sm:grid-cols-2">
          <li>
            <Link
              to="/general-assembly/senate"
              className="block rounded-md border border-border bg-card px-5 py-5 hover:bg-wash"
            >
              <p className="font-mono text-xs tracking-widest text-[#0d7377] uppercase">
                {n > 0 ? "Live" : "Transcripts in progress"}
              </p>
              <p className="mt-2 font-serif text-2xl font-medium">Senate of Virginia</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {n} of {SENATE_MEETINGS.length} 2026 floor sessions searchable. Recaps with LIS
                roll-call votes.
              </p>
            </Link>
          </li>
          <li className="rounded-md border border-dashed border-border bg-card/60 px-5 py-5">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Coming later
            </p>
            <p className="mt-2 font-serif text-2xl font-medium">House of Delegates</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Not yet in Find the Moment. Official House video:{" "}
              <a
                href="https://video.house.virginia.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#1E4B8E] underline-offset-2 hover:underline"
              >
                video.house.virginia.gov
              </a>
              .
            </p>
          </li>
        </ul>
      </main>
    </SiteShell>
  );
}
