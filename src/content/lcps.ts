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

/** Full School Board meetings CY2025 + 2026 YTD — lean lazy-load index (not committees). */
export const LCPS_MEETINGS: LcpsMeeting[] = [
  {
    id: "2026-09-08",
    vimeoId: "1225039248",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Sep 8, 2026",
    duration: "6h 21m",
    playerUrl: "https://player.vimeo.com/video/1225039248?rel=0",
    boardDocsUrl: BOARDDOCS_PUBLIC,
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1225039248.json",
    windowCount: 697,
  },
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

  {
    id: "2025-12-16",
    vimeoId: "1147068947",
    title: "2nd Tuesday School Board Meeting (Moved due to Winter Break)",
    dateLabel: "Dec 16, 2025",
    duration: "5h 42m",
    playerUrl: "https://player.vimeo.com/video/1147068947?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DNJGXE45EC88",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1147068947.json",
    windowCount: 622,
  },
  {
    id: "2025-12-02",
    vimeoId: "1142554279",
    title: "4th Tuesday School Board Meeting (Moved due to Thanksgiving Break)",
    dateLabel: "Dec 2, 2025",
    duration: "4h 52m",
    playerUrl: "https://player.vimeo.com/video/1142554279?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DMWJ6Y4BB93F",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1142554279.json",
    windowCount: 513,
  },
  {
    id: "2025-11-11",
    vimeoId: "1135569519",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Nov 11, 2025",
    duration: "5h 34m",
    playerUrl: "https://player.vimeo.com/video/1135569519?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DMGHWQ4A665F",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1135569519.json",
    windowCount: 504,
  },
  {
    id: "2025-10-28",
    vimeoId: "1127365931",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Oct 28, 2025",
    duration: "5h 52m",
    playerUrl: "https://player.vimeo.com/video/1127365931?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DM2Q5M6761E2",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1127365931.json",
    windowCount: 453,
  },
  {
    id: "2025-10-14",
    vimeoId: "1123751318",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Oct 14, 2025",
    duration: "4h 10m",
    playerUrl: "https://player.vimeo.com/video/1123751318?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DLEGHD43C3A1",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1123751318.json",
    windowCount: 322,
  },
  {
    id: "2025-09-30",
    vimeoId: "1123768746",
    title: "4th Tuesday School Board Meeting (Moved due to Rosh Hashanah)",
    dateLabel: "Sep 30, 2025",
    duration: "5h 9m",
    playerUrl: "https://player.vimeo.com/video/1123768746?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DKYJGJ4D1FDE",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1123768746.json",
    windowCount: 530,
  },
  {
    id: "2025-09-09",
    vimeoId: "1116938106",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Sep 9, 2025",
    duration: "5h 11m",
    playerUrl: "https://player.vimeo.com/video/1116938106?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DKFMTK5CCDE0",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1116938106.json",
    windowCount: 542,
  },
  {
    id: "2025-09-08",
    vimeoId: "1115339243",
    title: "Special School Board Meeting – Closed Session",
    dateLabel: "Sep 8, 2025",
    duration: "2h 22m",
    playerUrl: "https://player.vimeo.com/video/1115339243?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DKQGBR4307BE",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1115339243.json",
    windowCount: 17,
  },
  {
    id: "2025-09-02",
    vimeoId: "1110982340",
    title: "2nd Tuesday School Board Meeting (Reconvened from August 12, 2025)",
    dateLabel: "Sep 2, 2025",
    duration: "2h 33m",
    playerUrl: "https://player.vimeo.com/video/1110982340?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DHTN925EC6E3",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1110982340.json",
    windowCount: 177,
  },
  {
    id: "2025-08-12",
    vimeoId: "1107105070",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Aug 12, 2025",
    duration: "7h 3m",
    playerUrl: "https://player.vimeo.com/video/1107105070?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DHTN925EC6E3",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1107105070.json",
    windowCount: 600,
  },
  {
    id: "2025-08-04",
    vimeoId: "1100127951",
    title: "Special School Board Meeting – Closed Session",
    dateLabel: "Aug 4, 2025",
    duration: "2h 21m",
    playerUrl: "https://player.vimeo.com/video/1100127951?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DK4NN860B5C8",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1100127951.json",
    windowCount: 48,
  },
  {
    id: "2025-07-09",
    vimeoId: "1096116661",
    title: "Special School Board Meeting – Closed Session",
    dateLabel: "Jul 9, 2025",
    duration: "21m",
    playerUrl: "https://player.vimeo.com/video/1096116661?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DJ8LPS578FF4",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1096116661.json",
    windowCount: 12,
  },
  {
    id: "2025-06-24",
    vimeoId: "1095784143",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Jun 24, 2025",
    duration: "5h 38m",
    playerUrl: "https://player.vimeo.com/video/1095784143?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DGVMQM5B8E39",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1095784143.json",
    windowCount: 438,
  },
  {
    id: "2025-06-23",
    vimeoId: "1094251148",
    title: "Special School Board Meeting – Closed Session",
    dateLabel: "Jun 23, 2025",
    duration: "4h 19m",
    playerUrl: "https://player.vimeo.com/video/1094251148?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DH5NG95F2C69",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1094251148.json",
    windowCount: 14,
  },
  {
    id: "2025-06-17",
    vimeoId: "1092321196",
    title: "2nd Tuesday School Board Meeting (Reconvened from June 10, 2025)",
    dateLabel: "Jun 17, 2025",
    duration: "3h 55m",
    playerUrl: "https://player.vimeo.com/video/1092321196?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DGDH9P474922",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1092321196.json",
    windowCount: 289,
  },
  {
    id: "2025-06-10",
    vimeoId: "1089915351",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Jun 10, 2025",
    duration: "5h 54m",
    playerUrl: "https://player.vimeo.com/video/1089915351?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DGDH9P474922",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1089915351.json",
    windowCount: 570,
  },
  {
    id: "2025-05-20",
    vimeoId: "1086546653",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "May 20, 2025",
    duration: "6h 35m",
    playerUrl: "https://player.vimeo.com/video/1086546653?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DFYKT7535F91",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1086546653.json",
    windowCount: 677,
  },
  {
    id: "2025-05-06",
    vimeoId: "1081666340",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "May 6, 2025",
    duration: "5h 53m",
    playerUrl: "https://player.vimeo.com/video/1081666340?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DFKRPK6EF80A",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1081666340.json",
    windowCount: 493,
  },
  {
    id: "2025-04-22",
    vimeoId: "1074117923",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Apr 22, 2025",
    duration: "6h 15m",
    playerUrl: "https://player.vimeo.com/video/1074117923?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DF5M5V59A0F6",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1074117923.json",
    windowCount: 658,
  },
  {
    id: "2025-04-08",
    vimeoId: "1071992637",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Apr 8, 2025",
    duration: "4h 19m",
    playerUrl: "https://player.vimeo.com/video/1071992637?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DEPP826335A9",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1071992637.json",
    windowCount: 443,
  },
  {
    id: "2025-04-01",
    vimeoId: "1069432152",
    title: "4th Tuesday School Board Meeting (Reconvened from March 25, 2025)",
    dateLabel: "Apr 1, 2025",
    duration: "1h 57m",
    playerUrl: "https://player.vimeo.com/video/1069432152?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DEANZV6245CC",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1069432152.json",
    windowCount: 248,
  },
  {
    id: "2025-03-25",
    vimeoId: "1069012335",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Mar 25, 2025",
    duration: "5h 27m",
    playerUrl: "https://player.vimeo.com/video/1069012335?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DEANZV6245CC",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1069012335.json",
    windowCount: 595,
  },
  {
    id: "2025-03-11",
    vimeoId: "1063013914",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Mar 11, 2025",
    duration: "5h 27m",
    playerUrl: "https://player.vimeo.com/video/1063013914?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DDVHR249AF6B",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1063013914.json",
    windowCount: 592,
  },
  {
    id: "2025-02-25",
    vimeoId: "1059923212",
    title: "4th Tuesday School Board Meeting",
    dateLabel: "Feb 25, 2025",
    duration: "6h",
    playerUrl: "https://player.vimeo.com/video/1059923212?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DDMQHP696B54",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1059923212.json",
    windowCount: 437,
  },
  {
    id: "2025-02-13",
    vimeoId: "1053570466",
    title: "2nd Tuesday School Board Meeting (Rescheduled due to inclement weather)",
    dateLabel: "Feb 13, 2025",
    duration: "6h 17m",
    playerUrl: "https://player.vimeo.com/video/1053570466?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DCVPRE65DD8B",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1053570466.json",
    windowCount: 697,
  },
  {
    id: "2025-02-04",
    vimeoId: "1052098361",
    title: "Special School Board Meeting — FY26 Operating Budget Adoption",
    dateLabel: "Feb 4, 2025",
    duration: "1h 49m",
    playerUrl: "https://player.vimeo.com/video/1052098361?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DCWJ6F4BA5A5",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1052098361.json",
    windowCount: 212,
  },
  {
    id: "2025-01-14",
    vimeoId: "1047051714",
    title: "2nd Tuesday School Board Meeting",
    dateLabel: "Jan 14, 2025",
    duration: "4h 31m",
    playerUrl: "https://player.vimeo.com/video/1047051714?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DBLLY958CDD7",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1047051714.json",
    windowCount: 477,
  },
  {
    id: "2025-01-09",
    vimeoId: "1045703767",
    title: "School Board Organizational Meeting",
    dateLabel: "Jan 9, 2025",
    duration: "16m",
    playerUrl: "https://player.vimeo.com/video/1045703767?rel=0",
    boardDocsUrl:
      "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DBNQ59679910",
    lcpsTvUrl: LCPS_TV,
    windowsUrl: "/files/find-the-moment/loudoun-lcps/1045703767.json",
    windowCount: 33,
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
