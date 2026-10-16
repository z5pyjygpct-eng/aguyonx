import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { MembersV4Page } from "@/components/site/members-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { HOUSE_V4_MEMBERS } from "@/lib/ga-v4";

export const Route = createFileRoute("/dashboards/house/members")({
  head: () => ({ meta: [{ title: "House of Delegates Members · A Guy on X" }] }),
  component: () => (
    <SiteShell>
      <MembersV4Page venue={V4_VENUES["va-house"]} boardName="Virginia House of Delegates" explainer="100 delegates, each elected for two years." members={HOUSE_V4_MEMBERS} rosterUrl="https://house.vga.virginia.gov/members" recapTo="/general-assembly/house/recaps/$slug" />
    </SiteShell>
  ),
});
