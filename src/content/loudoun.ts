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
  start: number;
  end: number;
  text: string;
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

export const LOUDOUN_MEETING = {
  title: "Loudoun BOS Public Hearing",
  dateLabel: "May 13, 2026",
  clipId: 8178,
  playerUrl: "https://loudoun.granicus.com/player/clip/8178",
  jumpUrl: (seconds: number) =>
    `https://loudoun.granicus.com/player/clip/8178?entrytime=${Math.floor(seconds)}`,
} as const;

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
  {
    label: "This meeting on Granicus",
    href: LOUDOUN_MEETING.playerUrl,
    dek: `Public Hearing · ${LOUDOUN_MEETING.dateLabel} · clip ${LOUDOUN_MEETING.clipId}`,
  },
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
