/**
 * City meeting recaps (City of Fairfax, Manassas). Same rules as src/content/loudoun-recaps.ts:
 * decisions and votes ONLY from official minutes (Fairfax: Granicus minutes; Manassas City Council:
 * manassascity.granicus.com minutes; Manassas schools: BoardDocs minutes/motions). Until minutes are
 * posted keep official.votesPosted false. Never infer a vote from video or transcript.
 * Renders at /cities/{city}/recaps/{slug}.
 */
import type { LoudounRecap } from "./loudoun-recaps";
import type { CityVenueId } from "./cities";

export type CityRecap = Omit<LoudounRecap, "venue"> & { venue: CityVenueId };

export const CITY_RECAPS: CityRecap[] = [];

export const CITY_RECAP_BY_SLUG: Record<string, CityRecap> = Object.fromEntries(
  CITY_RECAPS.map((r) => [r.slug, r]),
);

export const CITY_RECAP_BY_MEETING: Record<string, CityRecap> = Object.fromEntries(
  CITY_RECAPS.map((r) => [r.meetingId, r]),
);
