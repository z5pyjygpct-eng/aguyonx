/**
 * Virginia Board of Education (VBOE) in Find the Moment (added Oct 13, 2026). Scope: Board of
 * Education work sessions, business and special meetings, Jan 2025 onward (older streams back to
 * 2023 exist on the same channel). Video: VDOE's official YouTube channel
 * (youtube.com/channel/UCrbxl9wHScrWKWIEoUWNIfQ). Closed sessions are never streamed.
 * Mini body/venue "va-boe", file_key = meetingId = vboe-{youtubeId}. Built by scripts/va-boe-build.py.
 */
import { FTM_TRANSCRIPTS } from "./ftm-transcripts";
import { VBOE_MEETINGS } from "./va-boe-data";

export type VboeMeeting = {
  id: string;
  youtubeId: string;
  date: string;
  dateLabel: string;
  title: string;
  duration: string;
  durationS: number;
};

export { VBOE_MEETINGS };
export const VBOE_VENUE = "va-boe" as const;
export const VBOE_YOUTUBE = "https://www.youtube.com/channel/UCrbxl9wHScrWKWIEoUWNIfQ/streams";
export const VBOE_AGENDAS =
  "https://www.doe.virginia.gov/state-board-data-funding/virginia-board-of-education";
export const vboeVideoUrl = (m: VboeMeeting, t = 0) =>
  `https://www.youtube.com/watch?v=${m.youtubeId}${t ? `&t=${Math.floor(t)}s` : ""}`;
export const vboeTranscriptCount = () =>
  FTM_TRANSCRIPTS.filter((t) => t.venue === VBOE_VENUE).length;
export const vboeLive = () => vboeTranscriptCount() > 0;
export const vboeMeetingType = (title: string) => title.replace(/\s*\(.*\)$/, "");
