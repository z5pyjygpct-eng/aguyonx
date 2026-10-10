/**
 * Virginia Senate floor sessions in Find the Moment (added Oct 10, 2026). Scope: 2026 floor
 * sessions only (Regular Session Jan 14–Mar 14, Reconvened Apr 22, Special Session I days).
 * Video: the Senate of Virginia's official YouTube channel (@SenateofVirginia), which carries the
 * 2026 "Senate Chamber" streams (the Granicus archive stops at Dec 2025).
 * Votes: ONLY official LIS roll-call records (lis.blob.core.windows.net/lisfiles HISTORY.CSV +
 * VOTE.CSV), built per day by scripts/va-senate-build.py. Never inferred from video or transcript.
 */
import { FTM_TRANSCRIPTS } from "./ftm-transcripts";
import { SENATE_MEETINGS, SENATE_RECAPS, SENATORS } from "./va-senate-data";

export type SenateMeeting = {
  /** Mac mini file_key and transcript meetingId: vas-{youtubeId}. */
  id: string;
  youtubeId: string;
  /** ISO yyyy-mm-dd */
  date: string;
  dateLabel: string;
  title: string;
  duration: string;
  durationS: number;
  /** LIS session code. */
  session: string;
};

export type Senator = {
  name: string;
  district: number;
  party: string;
  /** LIS member number, e.g. S0115. */
  lisId: string;
  /** Senate directory id, e.g. S115. */
  senateId: string;
};

export type SenateRecapIndex = {
  slug: string;
  date: string;
  dateLabel: string;
  meetingIds: string[];
  rollCallCount: number;
  billCount: number;
  sessions: string[];
  /** Day's LIS roll calls (public JSON) or null when LIS records none for the day. */
  votesUrl: string | null;
};

export type SenateRollCall = {
  session: string;
  sessionName: string;
  voteId: string;
  tally: string | null;
  memberTally: string | null;
  bills: { bill: string; title: string; action: string; href: string; voteHref: string }[];
  members: Partial<Record<"Y" | "N" | "A" | "X", string[]>> | null;
};

export { SENATE_MEETINGS, SENATE_RECAPS, SENATORS };

export const SENATE_VENUE = "va-senate-floor" as const;
export const SENATE_LIS_SESSION = "20262";

export const SENATE_MEETING_BY_ID: Record<string, SenateMeeting> = Object.fromEntries(
  SENATE_MEETINGS.map((m) => [m.id, m]),
);
export const SENATE_RECAP_BY_SLUG: Record<string, SenateRecapIndex> = Object.fromEntries(
  SENATE_RECAPS.map((r) => [r.slug, r]),
);
export const SENATE_RECAP_BY_MEETING: Record<string, SenateRecapIndex> = Object.fromEntries(
  SENATE_RECAPS.flatMap((r) => r.meetingIds.map((id) => [id, r])),
);

export function senateTranscriptCount(): number {
  return FTM_TRANSCRIPTS.filter((t) => t.venue === SENATE_VENUE).length;
}
/** Homepage VA SENATE button and "Live" badge show only once transcripts are posted. */
export function senateLive(): boolean {
  return senateTranscriptCount() > 0;
}

export function senateJumpUrl(m: SenateMeeting, seconds: number): string {
  return `https://www.youtube.com/watch?v=${m.youtubeId}&t=${Math.max(0, Math.floor(seconds))}s`;
}
export function senateVideoUrl(m: SenateMeeting): string {
  return `https://www.youtube.com/watch?v=${m.youtubeId}`;
}
export function lisMemberUrl(s: Senator): string {
  return `https://lis.virginia.gov/session-details/${SENATE_LIS_SESSION}/member-information/${s.lisId}/member-details`;
}
export function senateProfileUrl(s: Senator): string {
  return `https://apps.senate.virginia.gov/Senator/memberpage.php?id=${s.senateId}`;
}
export const LIS_SENATE_MINUTES = "https://lis.virginia.gov/session-details/20261/minutes-list/S";
export const SENATE_YOUTUBE = "https://www.youtube.com/@SenateofVirginia/streams";
export const SENATE_VOTES_SOURCE =
  "Legislative Information System (LIS) roll-call records: HISTORY.CSV and VOTE.CSV public data files for sessions 20261 and 20262";
