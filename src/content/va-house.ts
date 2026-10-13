/**
 * Virginia House of Delegates floor sessions in Find the Moment (added Oct 13, 2026). Same scope as
 * the Senate: 2026 floor sessions (Regular Session Jan 14–Mar 14, Reconvened Apr 22–23, Special
 * Session I days), including Joint Assemblies and the Feb 15 pro forma day.
 * Video: the House's official video archive (video.house.virginia.gov, "Floor Sessions"), which is
 * hosted on YouTube; long days are split into Part 1, 2, ... videos.
 * Votes: ONLY official LIS House floor roll calls (lis.blob.core.windows.net/lisfiles HISTORY.CSV +
 * VOTE.CSV), built per day by scripts/va-house-build.py. Never inferred from video or transcript.
 */
import { FTM_TRANSCRIPTS } from "./ftm-transcripts";
import { HOUSE_MEETINGS, HOUSE_RECAPS as HOUSE_RECAPS_RAW, DELEGATES } from "./va-house-data";
import { sortRecapsNewestFirst } from "./recap-sort";

const HOUSE_RECAPS = sortRecapsNewestFirst(HOUSE_RECAPS_RAW);

export type HouseMeeting = {
  /** Mac mini file_key and transcript meetingId: house-{youtubeId}. */
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

export type Delegate = {
  name: string;
  district: number;
  party: string;
  /** LIS member number, e.g. H0386. */
  lisId: string;
};

export type HouseRecapIndex = {
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

export type HouseRollCall = {
  session: string;
  sessionName: string;
  voteId: string;
  tally: string | null;
  memberTally: string | null;
  bills: { bill: string; title: string; action: string; href: string; voteHref: string }[];
  members: Partial<Record<"Y" | "N" | "A" | "X", string[]>> | null;
};

export { HOUSE_MEETINGS, HOUSE_RECAPS, DELEGATES };

export const HOUSE_VENUE = "va-house-floor" as const;
export const HOUSE_LIS_SESSION = "20262";

export const HOUSE_MEETING_BY_ID: Record<string, HouseMeeting> = Object.fromEntries(
  HOUSE_MEETINGS.map((m) => [m.id, m]),
);
export const HOUSE_RECAP_BY_SLUG: Record<string, HouseRecapIndex> = Object.fromEntries(
  HOUSE_RECAPS.map((r) => [r.slug, r]),
);
export const HOUSE_RECAP_BY_MEETING: Record<string, HouseRecapIndex> = Object.fromEntries(
  HOUSE_RECAPS.flatMap((r) => r.meetingIds.map((id) => [id, r])),
);

export function houseTranscriptCount(): number {
  return FTM_TRANSCRIPTS.filter((t) => t.venue === HOUSE_VENUE).length;
}
/** Homepage VA HOUSE button and "Live" badge show only once transcripts are posted. */
export function houseLive(): boolean {
  return houseTranscriptCount() > 0;
}

export function houseJumpUrl(m: HouseMeeting, seconds: number): string {
  return `https://www.youtube.com/watch?v=${m.youtubeId}&t=${Math.max(0, Math.floor(seconds))}s`;
}
export function houseVideoUrl(m: HouseMeeting): string {
  return `https://www.youtube.com/watch?v=${m.youtubeId}`;
}
export function lisMemberUrl(s: Delegate): string {
  return `https://lis.virginia.gov/session-details/${HOUSE_LIS_SESSION}/member-information/${s.lisId}/member-details`;
}
export function houseProfileUrl(s: Delegate): string {
  return `https://house.vga.virginia.gov/members/${s.lisId}`;
}
export const LIS_HOUSE_MINUTES = "https://lis.virginia.gov/session-details/20261/minutes-list/H";
export const HOUSE_YOUTUBE = "https://video.house.virginia.gov/videos";
export const HOUSE_VOTES_SOURCE =
  "Legislative Information System (LIS) roll-call records: HISTORY.CSV and VOTE.CSV public data files for sessions 20261 and 20262";
