/** Hanover + Chesterfield BOS v4 adapter: official CivicClerk catalogs -> shared V4Meeting shape. */
import { CC_MEETINGS } from "@/content/civicclerk-counties-data";
import { cityMeetingType } from "@/content/cities";
import type { V4Meeting } from "@/components/site/venue-v4";

export type CcVenue = keyof typeof CC_MEETINGS;
export function ccMeetings(venue: CcVenue): V4Meeting[] {
  return CC_MEETINGS[venue].map((m) => ({
    id: m.id, dateLabel: m.dateLabel, title: m.title, kind: cityMeetingType(m.title), duration: m.duration || undefined,
    href: m.href, host: "CivicClerk", thumb: `/thumbs/${venue}/${m.id}.webp`,
  }));
}
