export type Party = "D" | "R";

export type BosMember = {
  name: string;
  party: Party;
  district: string;
  role: string;
};

export type TopicChip = {
  label: string;
  /** Query string fed into caption search — chips only filter the index. */
  query: string;
};

export type CaptionWindow = {
  clipId: number;
  start: number;
  end: number;
  text: string;
};

/** Per-meeting caption file shape (clipId omitted to save bytes). */
export type LoudounCaptionSlice = {
  start: number;
  end: number;
  text: string;
};

export type LoudounMeeting = {
  id: string;
  clipId: number;
  title: string;
  dateLabel: string;
  duration: string;
  playerUrl: string;
  /** Static JSON under /files/find-the-moment/loudoun-bos/{clipId}.json */
  windowsUrl: string;
  windowCount: number;
};

/** Thin public BOS roster — name, party, district, role. No bios, finance, or findings. */
export const LOUDOUN_BOS: BosMember[] = [
  {
    name: "Phyllis J. Randall",
    party: "D",
    district: "At-Large",
    role: "Board Chair",
  },
  {
    name: "Caleb A. Kershner",
    party: "R",
    district: "Catoctin",
    role: "Supervisor",
  },
  {
    name: "Juli E. Briskman",
    party: "D",
    district: "Algonkian",
    role: "Supervisor",
  },
  {
    name: "Koran Saines",
    party: "D",
    district: "Sterling",
    role: "Supervisor",
  },
  {
    name: "Kristen C. Umstattd",
    party: "D",
    district: "Leesburg",
    role: "Supervisor",
  },
  {
    name: "Laura A. TeKrony",
    party: "D",
    district: "Little River",
    role: "Supervisor",
  },
  {
    name: "Matthew F. Letourneau",
    party: "R",
    district: "Dulles",
    role: "Supervisor",
  },
  {
    name: "Michael R. Turner",
    party: "D",
    district: "Ashburn",
    role: "Supervisor",
  },
  {
    name: "Sylvia R. Glass",
    party: "D",
    district: "Broad Run",
    role: "Supervisor",
  },
];

/** Searchable BOS meeting index — lean slice of the Granicus archive. */
export const LOUDOUN_MEETINGS: LoudounMeeting[] = [
  {
    id: "8216",
    clipId: 8216,
    title: "Loudoun BOS Business (reconvened Jul 21)",
    dateLabel: "Jul 22, 2026",
    duration: "5h 39m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8216",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8216.json",
    windowCount: 592,
  },
  {
    id: "8214",
    clipId: 8214,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Jul 21, 2026",
    duration: "5m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8214",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8214.json",
    windowCount: 3,
  },
  {
    id: "8213",
    clipId: 8213,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Jul 15, 2026",
    duration: "5h 30m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8213",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8213.json",
    windowCount: 574,
  },
  {
    id: "8208",
    clipId: 8208,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Jul 7, 2026",
    duration: "6h 37m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8208",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8208.json",
    windowCount: 491,
  },
  {
    id: "8199",
    clipId: 8199,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Jun 16, 2026",
    duration: "8h 51m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8199",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8199.json",
    windowCount: 763,
  },
  {
    id: "8198",
    clipId: 8198,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Jun 10, 2026",
    duration: "3h 10m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8198",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8198.json",
    windowCount: 366,
  },
  {
    id: "8191",
    clipId: 8191,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Jun 2, 2026",
    duration: "7h 13m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8191",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8191.json",
    windowCount: 462,
  },
  {
    id: "8185",
    clipId: 8185,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "May 19, 2026",
    duration: "8h 53m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8185",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8185.json",
    windowCount: 683,
  },
  {
    id: "8179",
    clipId: 8179,
    title: "Loudoun BOS Business (reconvened May 5)",
    dateLabel: "May 13, 2026",
    duration: "34m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8179",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8179.json",
    windowCount: 5,
  },
  {
    id: "8178",
    clipId: 8178,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "May 13, 2026",
    duration: "1h 48m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8178",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8178.json",
    windowCount: 232,
  },
  {
    id: "8174",
    clipId: 8174,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "May 5, 2026",
    duration: "6h 26m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8174",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8174.json",
    windowCount: 580,
  },
  {
    id: "8173",
    clipId: 8173,
    title: "Loudoun BOS Special Business — Western Loudoun Rural Uses",
    dateLabel: "May 4, 2026",
    duration: "6h 48m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8173",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8173.json",
    windowCount: 665,
  },
  {
    id: "8161",
    clipId: 8161,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Apr 21, 2026",
    duration: "7h 32m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8161",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8161.json",
    windowCount: 712,
  },
  {
    id: "8158",
    clipId: 8158,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Apr 15, 2026",
    duration: "5h 57m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8158",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8158.json",
    windowCount: 650,
  },
  {
    id: "8154",
    clipId: 8154,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Apr 7, 2026",
    duration: "3h 56m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8154",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8154.json",
    windowCount: 364,
  },
  {
    id: "8143",
    clipId: 8143,
    title: "Loudoun BOS Business Meeting and Public Hearing",
    dateLabel: "Mar 17, 2026",
    duration: "3h 54m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8143",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8143.json",
    windowCount: 388,
  },
  {
    id: "8139",
    clipId: 8139,
    title: "Loudoun BOS FY 2027 Budget Work Session",
    dateLabel: "Mar 12, 2026",
    duration: "4h 46m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8139",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8139.json",
    windowCount: 498,
  },
  {
    id: "8138",
    clipId: 8138,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Mar 11, 2026",
    duration: "52m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8138",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8138.json",
    windowCount: 79,
  },
  {
    id: "8135",
    clipId: 8135,
    title: "Loudoun BOS FY 2027 Budget Work Session",
    dateLabel: "Mar 9, 2026",
    duration: "4h 22m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8135",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8135.json",
    windowCount: 457,
  },
  {
    id: "8134",
    clipId: 8134,
    title: "Loudoun BOS FY 2027 Budget Work Session",
    dateLabel: "Mar 5, 2026",
    duration: "4h 9m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8134",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8134.json",
    windowCount: 431,
  },
  {
    id: "8130",
    clipId: 8130,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Mar 3, 2026",
    duration: "3h 18m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8130",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8130.json",
    windowCount: 322,
  },
  {
    id: "8129",
    clipId: 8129,
    title: "Loudoun BOS FY 2027 Budget Work Session",
    dateLabel: "Mar 2, 2026",
    duration: "1h 48m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8129",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8129.json",
    windowCount: 182,
  },
  {
    id: "8128",
    clipId: 8128,
    title: "Loudoun BOS Budget Public Hearing (Session III)",
    dateLabel: "Feb 28, 2026",
    duration: "1h 18m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8128",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8128.json",
    windowCount: 148,
  },
  {
    id: "8127",
    clipId: 8127,
    title: "Loudoun BOS Budget Public Hearing (Session II)",
    dateLabel: "Feb 26, 2026",
    duration: "1h 5m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8127",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8127.json",
    windowCount: 94,
  },
  {
    id: "8126",
    clipId: 8126,
    title: "Loudoun BOS Budget Public Hearing (Session I)",
    dateLabel: "Feb 26, 2026",
    duration: "47m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8126",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8126.json",
    windowCount: 67,
  },
  {
    id: "8120",
    clipId: 8120,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Feb 18, 2026",
    duration: "3h 52m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8120",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8120.json",
    windowCount: 332,
  },
  {
    id: "8113",
    clipId: 8113,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Feb 11, 2026",
    duration: "2h 29m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8113",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8113.json",
    windowCount: 232,
  },
  {
    id: "8112",
    clipId: 8112,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Feb 11, 2026",
    duration: "1h 12m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8112",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8112.json",
    windowCount: 125,
  },
  {
    id: "8107",
    clipId: 8107,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Feb 3, 2026",
    duration: "3h 55m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8107",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8107.json",
    windowCount: 371,
  },
  {
    id: "8096",
    clipId: 8096,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Jan 21, 2026",
    duration: "5h 52m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8096",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8096.json",
    windowCount: 490,
  },
  {
    id: "8093",
    clipId: 8093,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Jan 14, 2026",
    duration: "2h 29m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8093",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8093.json",
    windowCount: 296,
  },
  {
    id: "8085",
    clipId: 8085,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Jan 6, 2026",
    duration: "2h 13m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8085",
    windowsUrl: "/files/find-the-moment/loudoun-bos/8085.json",
    windowCount: 253,
  },
];

export const LOUDOUN_MEETING_BY_CLIP = Object.fromEntries(
  LOUDOUN_MEETINGS.map((m) => [m.clipId, m]),
) as Record<number, LoudounMeeting>;

/** Original live POC clip — prefer LOUDOUN_MEETINGS for new UI. */
export const LOUDOUN_MEETING = LOUDOUN_MEETINGS.find((m) => m.clipId === 8178)!;

export function loudounJumpUrl(clipId: number, seconds: number): string {
  return `https://loudoun.granicus.com/player/clip/${clipId}?entrytime=${Math.floor(seconds)}`;
}

export function loudounWindowsUrl(clipId: number): string {
  return `/files/find-the-moment/loudoun-bos/${clipId}.json`;
}

export const LOUDOUN_INDEXED_WINDOW_COUNT = LOUDOUN_MEETINGS.reduce(
  (sum, m) => sum + m.windowCount,
  0,
);

/** Topic chips only seed the caption search. They do not show findings. */
export const LOUDOUN_TOPIC_CHIPS: TopicChip[] = [
  { label: "Data Centers", query: "data center" },
  { label: "Tax", query: "tax" },
  { label: "Housing", query: "housing" },
  { label: "Schools", query: "school" },
  { label: "Zoning", query: "zoning" },
  { label: "Budget", query: "budget" },
];

export const LOUDOUN_OFFICIAL_DOORS = [
  ...LOUDOUN_MEETINGS.map((m) => ({
    label: `${m.dateLabel} · ${m.title.replace(/^Loudoun BOS /, "")}`,
    href: m.playerUrl,
    dek: `Granicus clip ${m.clipId} · ${m.duration}`,
  })),
  {
    label: "Board of Supervisors",
    href: "https://www.loudoun.gov/bos",
    dek: "Official Loudoun County BOS page",
  },
  {
    label: "Meeting videos",
    href: "https://www.loudoun.gov/meetings",
    dek: "County meeting video index",
  },
] as const;
