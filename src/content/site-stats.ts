/**
 * Homepage "By the numbers" — derived entirely from the site's catalogs, so counts
 * grow automatically whenever the morning routine adds meetings/transcripts/recaps and deploys.
 *
 * videos      = every meeting video listed (Loudoun BOS + LCPS + city venues + Senate floor) + Videos shelf
 * transcripts = FTM_TRANSCRIPTS entries (full speech-to-text transcripts)
 * recaps      = LOUDOUN_RECAPS + CITY_RECAPS + SENATE_RECAPS
 * hours       = sum of published video durations of the transcribed meetings, rounded
 */
import { LOUDOUN_MEETINGS } from "./loudoun";
import { LCPS_MEETINGS } from "./lcps";
import { CITY_MEETINGS } from "./cities-meetings";
import { SENATE_MEETINGS, SENATE_RECAPS } from "./va-senate";
import { VIDEOS } from "./videos";
import { FTM_TRANSCRIPTS } from "./ftm-transcripts";
import { LOUDOUN_RECAPS } from "./loudoun-recaps";
import { CITY_RECAPS } from "./city-recaps";

export function durationToSeconds(label: string | undefined): number {
  if (!label) return 0;
  const h = label.match(/(\d+)\s*h/i);
  const m = label.match(/(\d+)\s*m/i);
  const s = label.match(/(\d+)\s*s\b/i);
  return (h ? +h[1] * 3600 : 0) + (m ? +m[1] * 60 : 0) + (s ? +s[1] : 0);
}

export type SiteStats = { videos: number; transcripts: number; recaps: number; hours: number };

export function siteStats(): SiteStats {
  const dur = new Map<string, number>();
  for (const m of LOUDOUN_MEETINGS) dur.set(m.id, durationToSeconds(m.duration));
  for (const m of LCPS_MEETINGS) dur.set(m.id, durationToSeconds(m.duration));
  for (const m of CITY_MEETINGS) dur.set(m.id, durationToSeconds(m.duration));
  for (const m of SENATE_MEETINGS as { id: string; duration?: string; durationS?: number }[])
    dur.set(m.id, m.durationS ?? durationToSeconds(m.duration));
  const ids = new Set(FTM_TRANSCRIPTS.map((t) => t.meetingId));
  let secs = 0;
  for (const id of ids) secs += dur.get(id) ?? 0;
  return {
    videos: LOUDOUN_MEETINGS.length + LCPS_MEETINGS.length + CITY_MEETINGS.length + SENATE_MEETINGS.length + VIDEOS.length,
    transcripts: ids.size,
    recaps: LOUDOUN_RECAPS.length + CITY_RECAPS.length + SENATE_RECAPS.length,
    hours: Math.round(secs / 3600),
  };
}
