/**
 * Find the Moment localities: ONE homepage button per locality (standard as of 2026-10-13).
 * Each locality opens a hub where the visitor picks the venue. New localities: add one entry here.
 */
import { LOUDOUN_MEETINGS } from "./loudoun";
import { LCPS_MEETINGS } from "./lcps";
import { senateLive, senateTranscriptCount, SENATE_MEETINGS } from "./va-senate";
import { houseLive, houseTranscriptCount, HOUSE_MEETINGS } from "./va-house";
import { vboeLive, vboeTranscriptCount, VBOE_MEETINGS } from "./va-boe";
import { CITY_BY_ID, CITY_VENUES, cityMeetingsFor, cityTranscriptCount, cityVenueLive, type CityId } from "./cities";

export type FtmVenueCard = { name: string; href: string; live: boolean; note: string };
export type FtmLocality = {
  id: string;
  label: string;
  title: string;
  region: string;
  /** Homepage button target: hub page or an existing locality page. */
  href: string;
  live: boolean;
  venues: FtmVenueCard[];
  extra?: { label: string; href: string };
};

function cityLocality(id: CityId, label: string): FtmLocality {
  const c = CITY_BY_ID[id];
  const venues = c.venues.map((vid) => {
    const v = CITY_VENUES[vid];
    const live = cityVenueLive(vid);
    const n = cityMeetingsFor(vid).length;
    return {
      name: v.name,
      href: v.route === "/cities/$city/schools" ? `/cities/${id}/schools` : `/cities/${id}`,
      live,
      note: live
        ? `${cityTranscriptCount(vid)} of ${n} meetings searchable since ${v.since ?? "January 2025"}.`
        : "Queued for transcription. Coming soon.",
    };
  });
  return {
    id,
    label,
    title: c.name,
    region: c.region,
    href: `/find-the-moment/${id}`,
    live: venues.some((v) => v.live),
    venues,
  };
}

export function ftmLocalities(): FtmLocality[] {
  return [
    {
      id: "loudoun",
      label: "Loudoun County",
      title: "Loudoun County",
      region: "Northern Virginia",
      href: "/find-the-moment/loudoun",
      live: true,
      venues: [
        { name: "Loudoun Board of Supervisors", href: "/counties/loudoun", live: true, note: `${LOUDOUN_MEETINGS.length} meetings indexed. Jump to the exact second on the county video.` },
        { name: "Loudoun County School Board", href: "/counties/loudoun/schools", live: true, note: `${LCPS_MEETINGS.length} full board, committee and public closed-session meetings.` },
      ],
      extra: { label: "Search County + Schools together →", href: "/counties/loudoun/find-the-moment" },
    },
    cityLocality("fairfax-city", "Fairfax City"),
    cityLocality("albemarle", "Albemarle"),
    cityLocality("manassas", "Manassas"),
    {
      id: "general-assembly",
      label: "General Assembly",
      title: "Virginia General Assembly",
      region: "Statewide",
      href: "/general-assembly",
      live: senateLive() || houseLive(),
      venues: [
        { name: "House of Delegates", href: "/general-assembly/house", live: houseLive(), note: `${houseTranscriptCount()} of ${HOUSE_MEETINGS.length} floor sessions searchable.` },
        { name: "Senate of Virginia", href: "/general-assembly/senate", live: senateLive(), note: `${senateTranscriptCount()} of ${SENATE_MEETINGS.length} floor sessions searchable.` },
      ],
    },
    {
      id: "board-of-education",
      label: "VA Board of Education",
      title: "Virginia Board of Education",
      region: "Statewide",
      href: "/board-of-education",
      live: vboeLive(),
      venues: [
        { name: "Virginia Board of Education", href: "/board-of-education", live: vboeLive(), note: `${vboeTranscriptCount()} of ${VBOE_MEETINGS.length} meetings searchable.` },
      ],
    },
  ];
}
