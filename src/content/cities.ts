/**
 * Virginia cities in Find the Moment (added Oct 10, 2026): City of Fairfax and City of Manassas.
 * Same model as Loudoun: one door per body (council / schools), meetings 2025-01-01 to present,
 * machine transcripts from the Mac mini, recaps with votes only from official minutes.
 */
import { CITY_MEETINGS } from "./cities-meetings";
import { FTM_TRANSCRIPTS } from "./ftm-transcripts";

export type CityId = "fairfax-city" | "manassas";
export type CityBody = "council" | "schools";
export type CityVenueId =
  "fairfax-city-council" | "fairfax-city-schools" | "manassas-council" | "manassas-schools";
export type CityProvider = "granicus-page" | "youtube" | "wistia";

export type CityMeeting = {
  /** Mac mini file_key and transcript meetingId (e.g. fxc-4676, mcps-<youtubeId>, mcc-<wistiaId>). */
  id: string;
  venue: CityVenueId;
  title: string;
  /** ISO yyyy-mm-dd */
  date: string;
  dateLabel: string;
  /** Published duration label (blank when the host publishes none). */
  duration: string;
  provider: CityProvider;
  /** Official video page the jump links open. */
  playerUrl: string;
  agendaUrl?: string;
  /** Official minutes (votes source) when the host links them per meeting. */
  minutesUrl?: string;
};

export type CityDoor = { label: string; href: string };

export type CityVenue = {
  id: CityVenueId;
  city: CityId;
  body: CityBody;
  /** Page name, e.g. "City of Fairfax City Council". */
  name: string;
  /** Short button label for the homepage Find the Moment box. */
  buttonLabel: string;
  /** App path of the venue page (for display / sitemap). */
  to: string;
  /** Typed router target: Link to={route} params={{ city }}. */
  route: "/cities/$city" | "/cities/$city/schools";
  boardLabel: string;
  videoHost: string;
  votesSource: string;
  doors: CityDoor[];
};

export type City = {
  id: CityId;
  name: string;
  shortName: string;
  to: string;
  venues: CityVenueId[];
};

export const CITY_VENUES: Record<CityVenueId, CityVenue> = {
  "fairfax-city-council": {
    id: "fairfax-city-council",
    city: "fairfax-city",
    body: "council",
    name: "City of Fairfax City Council",
    buttonLabel: "Fairfax City Council",
    to: "/cities/fairfax-city",
    route: "/cities/$city",
    boardLabel: "City Council",
    videoHost: "City of Fairfax video archive (Granicus)",
    votesSource: "adopted City Council minutes posted on the city’s Granicus archive",
    doors: [
      {
        label: "Meeting video archive (Granicus)",
        href: "https://fairfax.granicus.com/ViewPublisher.php?view_id=13",
      },
    ],
  },
  "fairfax-city-schools": {
    id: "fairfax-city-schools",
    city: "fairfax-city",
    body: "schools",
    name: "City of Fairfax School Board",
    buttonLabel: "Fairfax City Schools",
    to: "/cities/fairfax-city/schools",
    route: "/cities/$city/schools",
    boardLabel: "School Board",
    videoHost: "City of Fairfax video archive (Granicus)",
    votesSource: "adopted School Board minutes posted on the city’s Granicus archive",
    doors: [
      {
        label: "Meeting video archive (Granicus)",
        href: "https://fairfax.granicus.com/ViewPublisher.php?view_id=13",
      },
    ],
  },
  "manassas-council": {
    id: "manassas-council",
    city: "manassas",
    body: "council",
    name: "Manassas City Council",
    buttonLabel: "Manassas City Council",
    to: "/cities/manassas",
    route: "/cities/$city",
    boardLabel: "City Council",
    videoHost: "RegionalWebTV (Wistia player)",
    votesSource: "adopted City Council minutes on the city’s Granicus agenda portal",
    doors: [
      { label: "Meeting video (RegionalWebTV)", href: "https://www.regionalwebtv.com/manassascc" },
      {
        label: "Agendas & minutes (Granicus)",
        href: "https://manassascity.granicus.com/ViewPublisher.php?view_id=1",
      },
    ],
  },
  "manassas-schools": {
    id: "manassas-schools",
    city: "manassas",
    body: "schools",
    name: "Manassas City School Board",
    buttonLabel: "Manassas Schools",
    to: "/cities/manassas/schools",
    route: "/cities/$city/schools",
    boardLabel: "School Board",
    videoHost: "Manassas City Public Schools YouTube channel",
    votesSource: "motions and votes recorded in BoardDocs minutes",
    doors: [
      {
        label: "Meeting video (YouTube)",
        href: "https://www.youtube.com/user/manassascityschools",
      },
      {
        label: "Agendas, minutes & votes (BoardDocs)",
        href: "https://go.boarddocs.com/va/mcpsva/Board.nsf/Public",
      },
    ],
  },
};

export const CITIES: City[] = [
  {
    id: "fairfax-city",
    name: "City of Fairfax",
    shortName: "Fairfax City",
    to: "/cities/fairfax-city",
    venues: ["fairfax-city-council", "fairfax-city-schools"],
  },
  {
    id: "manassas",
    name: "City of Manassas",
    shortName: "Manassas",
    to: "/cities/manassas",
    venues: ["manassas-council", "manassas-schools"],
  },
];

export const CITY_BY_ID = Object.fromEntries(CITIES.map((c) => [c.id, c])) as Record<CityId, City>;

export function cityMeetingsFor(venue: CityVenueId): CityMeeting[] {
  return CITY_MEETINGS.filter((m) => m.venue === venue);
}

export const CITY_MEETING_BY_ID: Record<string, CityMeeting> = Object.fromEntries(
  CITY_MEETINGS.map((m) => [m.id, m]),
);

/** Meetings in this venue that have a live machine transcript. */
export function cityTranscriptCount(venue: CityVenueId): number {
  return FTM_TRANSCRIPTS.filter((t) => t.venue === venue).length;
}

/** A venue is "live" (button shown on the homepage, shelf card active) once it has transcripts. */
export function cityVenueLive(venue: CityVenueId): boolean {
  return cityTranscriptCount(venue) > 0;
}

/** Official video opened at `seconds`. */
export function cityJumpUrl(m: CityMeeting, seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  switch (m.provider) {
    case "granicus-page":
      return `${m.playerUrl}&entrytime=${s}`;
    case "youtube":
      return `${m.playerUrl}&t=${s}s`;
    case "wistia":
      return `${m.playerUrl}?time=${s}`;
  }
}

export function isCityId(x: string): x is CityId {
  return x === "fairfax-city" || x === "manassas";
}
