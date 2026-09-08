import captionWindows from "@/content/lcps-caption-windows.json";

export type LcpsCaptionWindow = {
  start: number;
  end: number;
  text: string;
};

export type TopicChip = {
  label: string;
  /** Query string fed into caption search — chips only filter the index. */
  query: string;
};

export type LcpsMeeting = {
  id: string;
  vimeoId: string;
  title: string;
  dateLabel: string;
  duration: string;
  boardDocsUrl: string;
  lcpsTvUrl: string;
};

/** Single-meeting School Board POC — do not invent more meetings here. */
export const LCPS_MEETING: LcpsMeeting = {
  id: "2026-08-11",
  vimeoId: "1217434020",
  title: "2nd Tuesday School Board Meeting",
  dateLabel: "Aug 11, 2026",
  duration: "8h 14m",
  boardDocsUrl:
    "https://go.boarddocs.com/vsba/loudoun/Board.nsf/goto?open&id=DV3GCL432C63",
  lcpsTvUrl: "https://www.lcps.org/o/communications/page/lcps-tv-webcast",
};

export function lcpsJumpUrl(seconds: number): string {
  return `https://player.vimeo.com/video/${LCPS_MEETING.vimeoId}?rel=0#t=${Math.floor(seconds)}s`;
}

/** Topic chips only seed the caption search. They do not show findings. */
export const LCPS_TOPIC_CHIPS: TopicChip[] = [
  { label: "Budget", query: "budget" },
  { label: "Policy", query: "policy" },
  { label: "Curriculum", query: "curriculum" },
  { label: "Transportation", query: "transportation" },
  { label: "Staff", query: "staff" },
  { label: "Students", query: "student" },
];

export const LCPS_CAPTION_WINDOWS = captionWindows as LcpsCaptionWindow[];
