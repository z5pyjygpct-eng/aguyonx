import captionWindows from "@/content/loudoun-caption-windows.json";

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

export type LoudounMeeting = {
  id: string;
  clipId: number;
  title: string;
  dateLabel: string;
  duration: string;
  playerUrl: string;
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
    id: "8213",
    clipId: 8213,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Jul 15, 2026",
    duration: "5h 30m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8213",
  },
  {
    id: "8208",
    clipId: 8208,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "Jul 7, 2026",
    duration: "6h 37m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8208",
  },
  {
    id: "8198",
    clipId: 8198,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Jun 10, 2026",
    duration: "3h 10m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8198",
  },
  {
    id: "8178",
    clipId: 8178,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "May 13, 2026",
    duration: "1h 48m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8178",
  },
  {
    id: "8179",
    clipId: 8179,
    title: "Loudoun BOS Business (reconvened May 5)",
    dateLabel: "May 13, 2026",
    duration: "34m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8179",
  },
  {
    id: "8174",
    clipId: 8174,
    title: "Loudoun BOS Business Meeting",
    dateLabel: "May 5, 2026",
    duration: "6h 26m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8174",
  },
  {
    id: "8158",
    clipId: 8158,
    title: "Loudoun BOS Public Hearing",
    dateLabel: "Apr 15, 2026",
    duration: "5h 57m",
    playerUrl: "https://loudoun.granicus.com/player/clip/8158",
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

export const LOUDOUN_CAPTION_WINDOWS = captionWindows as CaptionWindow[];
