export type TopicChip = {
  label: string;
  /** Query string fed into caption search — chips only filter the index. */
  query: string;
};

/** Per-meeting caption file shape (vimeoId omitted to save bytes). */
export type LcpsCaptionSlice = {
  start: number;
  end: number;
  text: string;
};

export type LcpsCaptionWindow = LcpsCaptionSlice & {
  vimeoId: string;
};

export type LcpsMeeting = {
  id: string;
  vimeoId: string;
  title: string;
  dateLabel: string;
  duration: string;
  playerUrl: string;
  boardDocsUrl: string;
  lcpsTvUrl: string;
  /** Static JSON under /files/find-the-moment/loudoun-lcps/{vimeoId}.json */
  windowsUrl: string;
  windowCount: number;
};

export type LcpsBoardMember = {
  name: string;
  district: string;
  role: string;
};

/** Thin public School Board roster — name, district, role. No bios, finance, or findings. */
export const LCPS_SCHOOL_BOARD: LcpsBoardMember[] = [
  { name: "Anne Donohue", district: "At-Large", role: "Vice Chair" },
  { name: "April Chandler", district: "Algonkian", role: "Chair" },
  { name: "Deana Griffiths", district: "Ashburn", role: "Member" },
  { name: "Ross Svenson", district: "Broad Run", role: "Member" },
  { name: "Kari LaBell", district: "Catoctin", role: "Member" },
  { name: "Jon Pepper", district: "Dulles", role: "Member" },
  { name: "Lauren Shernoff", district: "Leesburg", role: "Member" },
  { name: "Dr. Sumera Rashid", district: "Little River", role: "Member" },
  { name: "Amy Riccardi", district: "Sterling", role: "Member" },
];

const LCPS_TV =
  "https://www.lcps.org/o/communications/page/lcps-tv-webcast";
const BOARDDOCS_PUBLIC =
  "https://go.boarddocs.com/vsba/loudoun/Board.nsf/Public";

/** Full School Board meetings 2026 YTD — lean lazy-load index (not committees). */
export const LCPS_MEETINGS: LcpsMeeting[] = [
  {
    id: "2026-08-11",
    vimeoId: "1217434020",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Aug 11, 2026",
    duration: "8h 14m",
    playerUrl: "https://player.vimeo.com/video/1217434020?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DV3GCL432C63",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1217434020.json",
    windowCount: 506,
  },
  {
    id: "2026-08-04",
    vimeoId: "1215666664",
    title: "Special Permission School Board Appeals Meeting",
    dateLabel: "Aug 4, 2026",
    duration: "3m",
    playerUrl: "https://player.vimeo.com/video/1215666664?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1215666664.json",
    windowCount: 8,
  },
  {
    id: "2026-07-13",
    vimeoId: "1209536330",
    title: "Special School Board Meeting",
    dateLabel: "Jul 13, 2026",
    duration: "2h 49m",
    playerUrl: "https://player.vimeo.com/video/1209536330?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1209536330.json",
    windowCount: 330,
  },
  {
    id: "2026-06-23",
    vimeoId: "1203915618",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Jun 23, 2026",
    duration: "7h",
    playerUrl: "https://player.vimeo.com/video/1203915618?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1203915618.json",
    windowCount: 598,
  },
  {
    id: "2026-06-09",
    vimeoId: "1199853132",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Jun 9, 2026",
    duration: "6h 28m",
    playerUrl: "https://player.vimeo.com/video/1199853132?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1199853132.json",
    windowCount: 686,
  },
  {
    id: "2026-06-08",
    vimeoId: "1199544093",
    title: "Special School Board Meeting – Closed Session",
    dateLabel: "Jun 8, 2026",
    duration: "5h 9m",
    playerUrl: "https://player.vimeo.com/video/1199544093?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1199544093.json",
    windowCount: 17,
  },
  {
    id: "2026-05-26",
    vimeoId: "1195679789",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "May 26, 2026",
    duration: "6h 59m",
    playerUrl: "https://player.vimeo.com/video/1195679789?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1195679789.json",
    windowCount: 564,
  },
  {
    id: "2026-05-12",
    vimeoId: "1191636709",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "May 12, 2026",
    duration: "6h 33m",
    playerUrl: "https://player.vimeo.com/video/1191636709?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1191636709.json",
    windowCount: 583,
  },
  {
    id: "2026-05-11",
    vimeoId: "1191494055",
    title: "Special School Board Meeting – Closed Session",
    dateLabel: "May 11, 2026",
    duration: "2h 18m",
    playerUrl: "https://player.vimeo.com/video/1191494055?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1191494055.json",
    windowCount: 14,
  },
  {
    id: "2026-04-30",
    vimeoId: "1188295564",
    title: "School Board Special Permission Appeals Meeting",
    dateLabel: "Apr 30, 2026",
    duration: "4m",
    playerUrl: "https://player.vimeo.com/video/1188295564?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1188295564.json",
    windowCount: 9,
  },
  {
    id: "2026-04-28",
    vimeoId: "1187409570",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Apr 28, 2026",
    duration: "6h 50m",
    playerUrl: "https://player.vimeo.com/video/1187409570?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1187409570.json",
    windowCount: 594,
  },
  {
    id: "2026-04-14",
    vimeoId: "1183118445",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Apr 14, 2026",
    duration: "5h 21m",
    playerUrl: "https://player.vimeo.com/video/1183118445?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1183118445.json",
    windowCount: 478,
  },
  {
    id: "2026-04-13",
    vimeoId: "1182826368",
    title: "School Board Special Permission Appeals Meeting",
    dateLabel: "Apr 13, 2026",
    duration: "5m",
    playerUrl: "https://player.vimeo.com/video/1182826368?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1182826368.json",
    windowCount: 10,
  },
  {
    id: "2026-03-24",
    vimeoId: "1176666991",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Mar 24, 2026",
    duration: "6h 22m",
    playerUrl: "https://player.vimeo.com/video/1176666991?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1176666991.json",
    windowCount: 634,
  },
  {
    id: "2026-03-23",
    vimeoId: "1176756919",
    title: "School Board Special Permission Appeals Meeting",
    dateLabel: "Mar 23, 2026",
    duration: "4m",
    playerUrl: "https://player.vimeo.com/video/1176756919?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1176756919.json",
    windowCount: 9,
  },
  {
    id: "2026-03-10",
    vimeoId: "1172260639",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Mar 10, 2026",
    duration: "4h 47m",
    playerUrl: "https://player.vimeo.com/video/1172260639?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1172260639.json",
    windowCount: 384,
  },
  {
    id: "2026-03-05",
    vimeoId: "1170500663",
    title: "Special School Board Meeting",
    dateLabel: "Mar 5, 2026",
    duration: "2h 30m",
    playerUrl: "https://player.vimeo.com/video/1170500663?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1170500663.json",
    windowCount: 290,
  },
  {
    id: "2026-02-24",
    vimeoId: "1167853411",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Feb 24, 2026",
    duration: "4h 53m",
    playerUrl: "https://player.vimeo.com/video/1167853411?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1167853411.json",
    windowCount: 561,
  },
  {
    id: "2026-02-10",
    vimeoId: "1163723566",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Feb 10, 2026",
    duration: "5h 44m",
    playerUrl: "https://player.vimeo.com/video/1163723566?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1163723566.json",
    windowCount: 393,
  },
  {
    id: "2026-02-03",
    vimeoId: "1161547575",
    title: "Special School Board Meeting — FY27 Operating Budget Adoption",
    dateLabel: "Feb 3, 2026",
    duration: "1h 38m",
    playerUrl: "https://player.vimeo.com/video/1161547575?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1161547575.json",
    windowCount: 197,
  },
  {
    id: "2026-01-28",
    vimeoId: "1159386579",
    title: "2nd Tuesday School Board Meeting (Rescheduled from 1/27/26)",
    dateLabel: "Jan 28, 2026",
    duration: "5h 46m",
    playerUrl: "https://player.vimeo.com/video/1159386579?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1159386579.json",
    windowCount: 479,
  },
  {
    id: "2026-01-13",
    vimeoId: "1154062783",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Jan 13, 2026",
    duration: "6h 45m",
    playerUrl: "https://player.vimeo.com/video/1154062783?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DP6SQW73DA73",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1154062783.json",
    windowCount: 540,
  },
  {
    id: "2026-01-06",
    vimeoId: "1151982673",
    title: "School Board Organizational Meeting",
    dateLabel: "Jan 6, 2026",
    duration: "48m",
    playerUrl: "https://player.vimeo.com/video/1151982673?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DP7LH256294C",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1151982673.json",
    windowCount: 84,
  },
];

export const LCPS_MEETING_BY_VIMEO = Object.fromEntries(
  LCPS_MEETINGS.map((m) => [m.vimeoId, m]),
) as Record<string, LcpsMeeting>;

/** Original single-meeting POC — prefer LCPS_MEETINGS for new UI. */
export const LCPS_MEETING = LCPS_MEETINGS.find((m) => m.vimeoId === "1217434020")!;

export function lcpsJumpUrl(vimeoId: string, seconds: number): string {
  return `https://player.vimeo.com/video/${vimeoId}?rel=0#t=${Math.floor(seconds)}s`;
}

export function lcpsWindowsUrl(vimeoId: string): string {
  return `/files/find-the-moment/loudoun-lcps/${vimeoId}.json`;
}

export const LCPS_INDEXED_WINDOW_COUNT = LCPS_MEETINGS.reduce(
  (sum, m) => sum + m.windowCount,
  0,
);

/** Topic chips only seed the caption search. They do not show findings. */
export const LCPS_TOPIC_CHIPS: TopicChip[] = [
  { label: "Budget", query: "budget" },
  { label: "Policy", query: "policy" },
  { label: "Curriculum", query: "curriculum" },
  { label: "Transportation", query: "transportation" },
  { label: "Staff", query: "staff" },
  { label: "Students", query: "student" },
];

export const LCPS_OFFICIAL_DOORS = [
  {
    label: "BoardDocs",
    href: BOARDDOCS_PUBLIC,
    dek: "LCPS School Board packets and agendas",
  },
  {
    label: "LCPS-TV",
    href: LCPS_TV,
    dek: "Official webcast / meeting video door",
  },
] as const;
