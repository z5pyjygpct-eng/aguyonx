import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { MembersV4Page } from "@/components/site/members-v4";
import { parseDate } from "@/components/site/lcps-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { buildMembers } from "@/lib/members-v4";
import { LCPS_SCHOOL_BOARD, LCPS_MEETINGS, lcpsJumpUrl } from "@/content/lcps";
import { LOUDOUN_RECAPS } from "@/content/loudoun-recaps";

const MEET = Object.fromEntries(LCPS_MEETINGS.map((m) => [m.id, m]));
const MEMBERS = buildMembers(LCPS_SCHOOL_BOARD, LOUDOUN_RECAPS, "loudoun-lcps", parseDate, (r, s) => { const m = MEET[r.meetingId]; return m ? lcpsJumpUrl(m.vimeoId, s) : undefined; });

export const Route = createFileRoute("/dashboards/loudoun/schools/members")({
  head: () => ({ meta: [{ title: "LCPS School Board Members · A Guy on X" }] }),
  component: () => (
    <SiteShell>
      <MembersV4Page venue={V4_VENUES["loudoun-lcps"]} boardName="Loudoun County School Board" explainer="Nine elected members who set LCPS policy and adopt the school budget." members={MEMBERS} rosterUrl="https://www.lcps.org/page/school-board" recapTo="/counties/loudoun/recaps/$slug" />
    </SiteShell>
  ),
});
