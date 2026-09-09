import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { Kicker } from "@/components/site/kicker";
import { LoudounCrossMeetingSearch } from "@/components/site/loudoun-cross-meeting-search";
import { LOUDOUN_MEETINGS } from "@/content/loudoun";
import { LCPS_MEETINGS } from "@/content/lcps";

export const Route = createFileRoute("/counties/loudoun/find-the-moment")({
  component: LoudounFindTheMomentPage,
});

function LoudounFindTheMomentPage() {
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
          Find the Moment
        </p>
        <Kicker className="mt-4">Virginia · Northern Virginia</Kicker>
        <h1 className="mt-2 font-serif text-4xl font-medium tracking-tight sm:text-5xl">
          Find the Moment
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          Cross-meeting search for Loudoun — {LOUDOUN_MEETINGS.length} Board of Supervisors
          meetings plus {LCPS_MEETINGS.length} School Board meetings. One box, both venues,
          jump straight to the video.
        </p>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Prefer a single venue? Use{" "}
          <Link
            to="/counties/loudoun"
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            Loudoun County
          </Link>{" "}
          or{" "}
          <Link
            to="/counties/loudoun/schools"
            className="text-[#1E4B8E] underline-offset-2 hover:underline"
          >
            Loudoun Schools
          </Link>
          .
        </p>

        <div className="mt-10">
          <LoudounCrossMeetingSearch />
        </div>
      </main>
    </SiteShell>
  );
}
