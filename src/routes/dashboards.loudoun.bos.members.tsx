import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/shell";
import { MembersV4Page } from "@/components/site/members-v4";
import { parseDate } from "@/components/site/lcps-v4";
import { V4_VENUES } from "@/lib/v4-venues";
import { buildMembers } from "@/lib/members-v4";
import { LOUDOUN_BOS, LOUDOUN_MEETING_BY_ID, loudounMeetingJumpUrl } from "@/content/loudoun";
import { LOUDOUN_RECAPS } from "@/content/loudoun-recaps";

const MEMBERS = buildMembers(LOUDOUN_BOS, LOUDOUN_RECAPS, "loudoun-bos", parseDate, (r, s) => { const m = LOUDOUN_MEETING_BY_ID[r.meetingId]; return m ? loudounMeetingJumpUrl(m, s) : undefined; });

export const Route = createFileRoute("/dashboards/loudoun/bos/members")({
  head: () => ({ meta: [{ title: "Loudoun Board of Supervisors Members · A Guy on X" }] }),
  component: () => (
    <SiteShell>
      <MembersV4Page comingSoon venue={V4_VENUES["loudoun-bos"]} boardName="Loudoun County Board of Supervisors" explainer="Nine elected supervisors who set county policy, taxes and the budget." members={MEMBERS} rosterUrl="https://www.loudoun.gov/bos" recapTo="/counties/loudoun/recaps/$slug" />
    </SiteShell>
  ),
});
