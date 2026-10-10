/**
 * Find the Moment hub registry. Built from the live catalogs, so a new venue appears on
 * /find-the-moment automatically once it has meetings (Loudoun) or transcripts (cities/Senate).
 */
import { LOUDOUN_MEETINGS } from "./loudoun";
import { LCPS_MEETINGS } from "./lcps";
import { SENATE_MEETINGS, senateLive, senateTranscriptCount } from "./va-senate";
import { CITIES, CITY_VENUES, cityMeetingsFor, cityTranscriptCount, cityVenueLive } from "./cities";

export type FtmHubStatus = "live" | "in-progress";

export type FtmHubEntry = {
  key: string;
  group: string;
  name: string;
  description: string;
  status: FtmHubStatus;
  meetingCount: number;
  transcriptCount?: number;
  range?: string;
  /** Plain href (typed Link targets vary by venue). */
  href: string;
};

function fmt(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
}

function rangeOf(dates: (string | undefined)[]): string | undefined {
  const ts = dates
    .map((s) => (s ? Date.parse(/^\d{4}-\d{2}-\d{2}$/.test(s) ? `${s}T00:00:00Z` : `${s} UTC`) : NaN))
    .filter((n) => !Number.isNaN(n))
    .sort((a, b) => a - b);
  if (!ts.length) return undefined;
  const a = fmt(new Date(ts[0]));
  const b = fmt(new Date(ts[ts.length - 1]));
  return a === b ? a : `${a} – ${b}`;
}

export function ftmHubEntries(): FtmHubEntry[] {
  const out: FtmHubEntry[] = [];
  if (LOUDOUN_MEETINGS.length) {
    out.push({
      key: "loudoun-bos",
      group: "Loudoun County",
      name: "Loudoun Board of Supervisors",
      description: "Search every indexed Board of Supervisors meeting and jump to the exact second on the county video.",
      status: "live",
      meetingCount: LOUDOUN_MEETINGS.length,
      range: rangeOf(LOUDOUN_MEETINGS.map((m) => m.dateLabel)),
      href: "/counties/loudoun",
    });
  }
  if (LCPS_MEETINGS.length) {
    out.push({
      key: "loudoun-lcps",
      group: "Loudoun County",
      name: "Loudoun School Board",
      description: "Full board, committees, and public closed-session meetings of the Loudoun County School Board.",
      status: "live",
      meetingCount: LCPS_MEETINGS.length,
      range: rangeOf(LCPS_MEETINGS.map((m) => m.dateLabel)),
      href: "/counties/loudoun/schools",
    });
  }
  if (LOUDOUN_MEETINGS.length && LCPS_MEETINGS.length) {
    out.push({
      key: "loudoun-cross",
      group: "Loudoun County",
      name: "Loudoun County + Schools together",
      description: "One search across both the Board of Supervisors and the School Board.",
      status: "live",
      meetingCount: LOUDOUN_MEETINGS.length + LCPS_MEETINGS.length,
      href: "/counties/loudoun/find-the-moment",
    });
  }
  if (SENATE_MEETINGS.length) {
    const live = senateLive();
    out.push({
      key: "va-senate",
      group: "Statewide",
      name: "Senate of Virginia floor sessions",
      description: live
        ? "Search what senators said on the floor and jump to the session video."
        : "Floor sessions are being transcribed now. Search opens as transcripts post.",
      status: live ? "live" : "in-progress",
      meetingCount: SENATE_MEETINGS.length,
      transcriptCount: senateTranscriptCount(),
      range: rangeOf(SENATE_MEETINGS.map((m) => m.date)),
      href: "/general-assembly/senate",
    });
  }
  for (const city of CITIES) {
    for (const vid of city.venues) {
      if (!cityVenueLive(vid)) continue;
      const v = CITY_VENUES[vid];
      const ms = cityMeetingsFor(vid);
      out.push({
        key: vid,
        group: city.name,
        name: v.name,
        description: `Search ${v.boardLabel} meetings since January 2025 and jump to the official video.`,
        status: "live",
        meetingCount: ms.length,
        transcriptCount: cityTranscriptCount(vid),
        range: rangeOf(ms.map((m) => m.date)),
        href: v.body === "schools" ? `/cities/${city.id}/schools` : `/cities/${city.id}`,
      });
    }
  }
  return out;
}
