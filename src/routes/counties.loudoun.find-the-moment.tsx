import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { HomeSearch } from "@/components/site/home-search";
import { LegacyHero, LegacyV4 } from "@/components/site/legacy-v4";
import { LoudounCrossMeetingSearch } from "@/components/site/loudoun-cross-meeting-search";
import { LOUDOUN_MEETINGS } from "@/content/loudoun";
import { LCPS_MEETINGS } from "@/content/lcps";

export const Route = createFileRoute("/counties/loudoun/find-the-moment")({
  component: LoudounFindTheMomentPage,
});

function LoudounFindTheMomentPage() {
  return (
    <SiteShell>
      <LegacyV4>
      <HomeSearch />
      <LegacyHero
        trail={[{ label: "VA Counties", to: "/counties" }, { label: "Loudoun", to: "/counties/loudoun" }, { label: "Find the Moment" }]}
        kicker="Virginia · Northern Virginia"
        title="Search County + Schools together"
      >
        <p className="text-lg">
          Optional power tool — one box across both Loudoun venues:{" "}
          {LOUDOUN_MEETINGS.length} Board of Supervisors meetings and {LCPS_MEETINGS.length}{" "}
          School Board meetings. Jump straight to the video.
        </p>
        <p className="text-sm">
          Looking for one board only? Start at{" "}
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
      </LegacyHero>
      <div className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-8">
        <div className="mt-10">
          <LoudounCrossMeetingSearch />
        </div>
      </div>
      </LegacyV4>
    </SiteShell>
  );
}
