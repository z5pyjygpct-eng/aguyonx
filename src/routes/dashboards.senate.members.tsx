import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { MembersV4Page } from "@/components/site/members-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { SENATE_V4_MEMBERS } from "@/lib/ga-v4";

export const Route = createFileRoute("/dashboards/senate/members")({
  head: () => ({ meta: [{ title: "State Senate Members · A Guy on X" }] }),
  component: () => (
    <SiteShell>
      <MembersV4Page venue={V4_VENUES["va-senate"]} boardName="Senate of Virginia" explainer="40 senators, each elected for four years." members={SENATE_V4_MEMBERS} rosterUrl="https://apps.senate.virginia.gov/Senator/index.php" recapTo="/general-assembly/senate/recaps/$slug" />
    </SiteShell>
  ),
});
