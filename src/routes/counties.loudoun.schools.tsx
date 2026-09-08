import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { LcpsMeetingSearch } from "@/components/site/lcps-meeting-search";
import { LCPS_MEETINGS, LCPS_OFFICIAL_DOORS } from "@/content/lcps";

export const Route = createFileRoute("/counties/loudoun/schools")({
  component: LoudounSchoolsPage,
});

function LoudounSchoolsPage() {
  return (
    <SiteShell>
      <HomeSearch />
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          <Link to="/counties" className="hover:text-foreground hover:underline">
            VA Counties
          </Link>
          <span className="mx-2 text-border">/</span>
          <Link to="/counties/loudoun" className="hover:text-foreground hover:underline">
            Loudoun
          </Link>
          <span className="mx-2 text-border">/</span>
          Schools
        </p>
        <Kicker className="mt-4">Virginia · Northern Virginia</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Loudoun Schools
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          <span className="font-medium text-foreground">Find the Moment</span> for Loudoun County
          Public Schools School Board — {LCPS_MEETINGS.length} full Board meetings indexed (2026
          YTD). Captions are an index, not quotes. County Board of Supervisors lives on the{" "}
          <Link
            to="/counties/loudoun"
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            Loudoun County
          </Link>{" "}
          door.
        </p>

        <div className="mt-10">
          <LcpsMeetingSearch />
        </div>

        <section className="mt-14">
          <Kicker>Official doors</Kicker>
          <h2 className="mt-2 font-serif text-3xl font-medium">Out to the record</h2>
          <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
            BoardDocs packets and LCPS-TV. Jump links open Vimeo from Find the Moment.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {LCPS_OFFICIAL_DOORS.map((door) => (
              <li key={door.href}>
                <a
                  href={door.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full flex-col rounded-md border border-border bg-card px-5 py-5 transition-[background-color] duration-150 hover:bg-wash"
                >
                  <span className="inline-flex items-center gap-2 font-serif text-xl font-medium">
                    {door.label}
                    <ExternalLink className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  </span>
                  <span className="mt-2 text-sm text-muted-foreground">{door.dek}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </SiteShell>
  );
}
