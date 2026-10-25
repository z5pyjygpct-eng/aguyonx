/**
 * Virginia cities in Find the Moment (added Oct 10, 2026): City of Fairfax and City of Manassas.
 * Same model as Loudoun: one door per body (council / schools), meetings 2025-01-01 to present,
 * machine transcripts from the Mac mini, recaps with votes only from official minutes.
 */
import { CITY_MEETINGS as BASE_CITY_MEETINGS } from "./cities-meetings";
import { HC_MEETINGS } from "./hc-meetings";
import { FTM_TRANSCRIPTS } from "./ftm-transcripts";

export type CityId = "fairfax-city" | "manassas" | "albemarle" | "hanover" | "chesterfield" | "henrico";
export type CityBody = "council" | "schools";
export type CityVenueId =
  | "fairfax-city-council"
  | "fairfax-city-schools"
  | "manassas-council"
  | "manassas-schools"
  | "albemarle-bos"
  | "albemarle-schools"
  | "hanover-bos"
  | "hanover-schools"
  | "chesterfield-bos"
  | "chesterfield-schools"
  | "henrico-bos"
  | "henrico-schools";
export type CityProvider = "granicus-page" | "youtube" | "wistia" | "civicclerk" | "swagit";

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
  /** CivicClerk: direct official mp4 (CivicPlus CDN) so jump links can open at a time (#t=). */
  mediaUrl?: string;
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
  /** Catalog start shown in page copy (default "January 2025"; Albemarle "January 2024"). */
  since?: string;
  /** Short tag in combined lists (default "Council" / "Schools"; Albemarle BOS "Supervisors"). */
  tag?: string;
};

export type City = {
  id: CityId;
  name: string;
  shortName: string;
  to: string;
  venues: CityVenueId[];
  /** Region kicker, e.g. "Northern Virginia" (Albemarle: "Central Virginia"). */
  region: string;
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
  "albemarle-bos": {
    id: "albemarle-bos",
    city: "albemarle",
    body: "council",
    name: "Albemarle County Board of Supervisors",
    buttonLabel: "Albemarle Supervisors",
    to: "/cities/albemarle",
    route: "/cities/$city",
    boardLabel: "Board of Supervisors",
    videoHost: "Albemarle County video archive (Granicus)",
    votesSource: "adopted Board of Supervisors minutes and action letters from Albemarle County",
    since: "January 2024",
    tag: "Supervisors",
    doors: [
      {
        label: "Meeting video & agendas (Granicus)",
        href: "https://albemarle.granicus.com/ViewPublisher.php?view_id=1",
      },
    ],
  },
  "albemarle-schools": {
    id: "albemarle-schools",
    city: "albemarle",
    body: "schools",
    name: "Albemarle County School Board",
    buttonLabel: "Albemarle Schools",
    to: "/cities/albemarle/schools",
    route: "/cities/$city/schools",
    boardLabel: "School Board",
    videoHost: "Albemarle County Public Schools YouTube channel",
    votesSource: "adopted School Board minutes posted by Albemarle County Public Schools",
    since: "January 2024",
    doors: [
      {
        label: "Meeting recordings (ACPS)",
        href: "https://www.k12albemarle.org/school-board/school-board-meeting-videos",
      },
      { label: "Meeting video (YouTube)", href: "https://www.youtube.com/@k12albemarle" },
    ],
  },
  "hanover-bos": {
    id: "hanover-bos",
    city: "hanover",
    body: "council",
    name: "Hanover County Board of Supervisors",
    buttonLabel: "Hanover Supervisors",
    to: "/cities/hanover",
    route: "/cities/$city",
    boardLabel: "Board of Supervisors",
    videoHost: "Hanover County meeting portal (CivicClerk)",
    votesSource: "adopted Board of Supervisors minutes posted on Hanover County’s CivicClerk portal",
    since: "January 2025",
    tag: "Supervisors",
    doors: [
      { label: "Meetings, video & minutes (CivicClerk)", href: "https://hanovercova.portal.civicclerk.com/" },
    ],
  },
  "hanover-schools": {
    id: "hanover-schools",
    city: "hanover",
    body: "schools",
    name: "Hanover County School Board",
    buttonLabel: "Hanover Schools",
    to: "/cities/hanover/schools",
    route: "/cities/$city/schools",
    boardLabel: "School Board",
    videoHost: "Hanover County meeting portal (CivicClerk)",
    votesSource: "adopted School Board minutes posted by Hanover County Public Schools",
    since: "January 2025",
    doors: [
      { label: "Meetings & video (CivicClerk)", href: "https://hanovercova.portal.civicclerk.com/" },
    ],
  },
  "chesterfield-bos": {
    id: "chesterfield-bos",
    city: "chesterfield",
    body: "council",
    name: "Chesterfield County Board of Supervisors",
    buttonLabel: "Chesterfield Supervisors",
    to: "/cities/chesterfield",
    route: "/cities/$city",
    boardLabel: "Board of Supervisors",
    videoHost: "Chesterfield County meeting portal (CivicClerk)",
    votesSource: "adopted Board of Supervisors minutes posted on Chesterfield County’s CivicClerk portal",
    since: "January 2025",
    tag: "Supervisors",
    doors: [
      { label: "Meetings, video & minutes (CivicClerk)", href: "https://chesterfieldcova.portal.civicclerk.com/" },
    ],
  },
  "chesterfield-schools": {
    id: "chesterfield-schools",
    city: "chesterfield",
    body: "schools",
    name: "Chesterfield County School Board",
    buttonLabel: "Chesterfield Schools",
    to: "/cities/chesterfield/schools",
    route: "/cities/$city/schools",
    boardLabel: "School Board",
    videoHost: "Chesterfield County Public Schools video archive (Swagit)",
    votesSource: "adopted School Board minutes posted by Chesterfield County Public Schools (BoardDocs)",
    since: "January 2025",
    doors: [
      { label: "Meeting video (Swagit)", href: "https://chesterfieldschoolsva.new.swagit.com/" },
    ],
  },
  "henrico-bos": {
    id: "henrico-bos",
    city: "henrico",
    body: "council",
    name: "Henrico County Board of Supervisors",
    buttonLabel: "Henrico Supervisors",
    to: "/cities/henrico",
    route: "/cities/$city",
    boardLabel: "Board of Supervisors",
    videoHost: "Henrico County video archive (Swagit)",
    votesSource: "adopted Board of Supervisors minutes posted by Henrico County",
    since: "January 2025",
    tag: "Supervisors",
    doors: [
      { label: "Meeting video (Swagit)", href: "https://henricocountyva.new.swagit.com/" },
      { label: "Agendas & minutes (Agend-O-Gram)", href: "https://henrico.gov/supervisors/supervisors-agenda-o-gram/" },
    ],
  },
  "henrico-schools": {
    id: "henrico-schools",
    city: "henrico",
    body: "schools",
    name: "Henrico County School Board",
    buttonLabel: "Henrico Schools",
    to: "/cities/henrico/schools",
    route: "/cities/$city/schools",
    boardLabel: "School Board",
    videoHost: "Henrico County Public Schools YouTube channel",
    votesSource: "adopted School Board minutes posted by Henrico County Public Schools",
    since: "January 2025",
    doors: [
      {
        label: "Agendas & minutes (HCPS meeting portal)",
        href: "https://henricoschools.community.diligentoneplatform.com/Portal/MeetingTypeList.aspx",
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
    region: "Northern Virginia",
    venues: ["fairfax-city-council", "fairfax-city-schools"],
  },
  {
    id: "manassas",
    name: "City of Manassas",
    shortName: "Manassas",
    to: "/cities/manassas",
    region: "Northern Virginia",
    venues: ["manassas-council", "manassas-schools"],
  },
  {
    // Launched Oct 13 2026 (moved up from Nov 1). Meetings Jan 2024+; School Board transcribed first.
    id: "albemarle",
    name: "Albemarle County",
    shortName: "Albemarle",
    to: "/cities/albemarle",
    region: "Central Virginia",
    venues: ["albemarle-bos", "albemarle-schools"],
  },
  {
    // Added Oct 23 2026: Mac mini transcripts (CivicClerk video) with votes from official minutes.
    id: "hanover",
    name: "Hanover County",
    shortName: "Hanover",
    to: "/cities/hanover",
    region: "Central Virginia",
    venues: ["hanover-bos", "hanover-schools"],
  },
  {
    id: "chesterfield",
    name: "Chesterfield County",
    shortName: "Chesterfield",
    to: "/cities/chesterfield",
    region: "Central Virginia",
    venues: ["chesterfield-bos", "chesterfield-schools"],
  },
  {
    // Added Oct 25 2026 (Scott approved Henrico Oct 24): Swagit BOS video + HCPS YouTube.
    id: "henrico",
    name: "Henrico County",
    shortName: "Henrico",
    to: "/cities/henrico",
    region: "Central Virginia",
    venues: ["henrico-bos", "henrico-schools"],
  },
];

const CITY_MEETINGS: CityMeeting[] = [...BASE_CITY_MEETINGS, ...HC_MEETINGS];
export const ALL_CITY_MEETINGS = CITY_MEETINGS;

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
    case "swagit":
      return `${m.playerUrl}?ts=${s}`;
    case "civicclerk":
      return m.mediaUrl ? `${m.mediaUrl}#t=${s}` : m.playerUrl;
  }
}

export function isCityId(x: string): x is CityId {
  return x === "fairfax-city" || x === "manassas" || x === "albemarle" || x === "hanover" || x === "chesterfield" || x === "henrico";
}

/**
 * Short, standardized meeting type for list rows (full title stays on the recap page).
 * Normalizes the many city spellings ("Regular School Board Meeting", "Special Meeting & Work Session", ...).
 */
export function cityMeetingType(title: string): string {
  const t = title.toLowerCase();
  if (/joint/.test(t)) return "Joint Meeting";
  const special = /special/.test(t);
  const work = /work session/.test(t);
  if (special && /budget/.test(t)) return "Special Meeting · Budget";
  if (special && work) return "Special Meeting + Work Session";
  if (special) return "Special Meeting";
  if (work) return "Work Session";
  if (/closed/.test(t)) return "Closed Session";
  if (/retreat/.test(t)) return "Retreat";
  if (/organizational/.test(t)) return "Organizational Meeting";
  if (/public hearing/.test(t)) return "Public Hearing";
  return "Regular Meeting";
}
