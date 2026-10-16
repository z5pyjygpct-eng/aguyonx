/** Albemarle v4 adapters: normalize city catalog data into the shared v4 template shapes. */
import { cityMeetingsFor, cityMeetingType, type CityVenueId } from "@/content/cities";
import { CITY_RECAPS } from "@/content/city-recaps";
import type { V4Meeting, V4Recap } from "@/components/site/venue-v4";

export function albMeetings(venue: CityVenueId): V4Meeting[] {
  return cityMeetingsFor(venue).map((m) => ({
    id: m.id, dateLabel: m.dateLabel, title: m.title, kind: cityMeetingType(m.title), duration: m.duration || undefined,
    href: m.playerUrl, host: m.provider === "youtube" ? "YouTube" : "Granicus", thumb: `/thumbs/${venue}/${m.id}.webp`,
  }));
}
export function albRecaps(venue: CityVenueId): V4Recap[] {
  return CITY_RECAPS.filter((r) => r.venue === venue).map((r) => ({
    slug: r.slug, dateLabel: r.dateLabel, title: r.title, kind: cityMeetingType(r.title),
    votesPosted: r.noVotesRecorded ? null : !!r.official?.votesPosted, to: "/cities/$city/recaps/$slug", params: { city: "albemarle", slug: r.slug },
  }));
}
