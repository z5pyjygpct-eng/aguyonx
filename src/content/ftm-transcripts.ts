/**
 * Find the Moment — machine transcript manifest.
 *
 * One entry per meeting that has a full speech-to-text transcript. When a
 * meeting is listed here, Find the Moment searches the transcript first
 * (primary source) and keeps the county caption index as a fallback.
 *
 * To add a meeting, see docs/find-the-moment-transcripts.md.
 * Files are built by scripts/ftm-transcript-windows.mjs and live under
 * public/files/find-the-moment/{venue}/transcripts/{meetingId}.json
 * (same {start,end,text} shape as caption windows; lazy-loaded on search).
 */

export type FtmTranscriptVenue = "loudoun-bos" | "loudoun-lcps";

export type FtmTranscript = {
  /** Catalog meeting id (e.g. LOUDOUN_MEETINGS[].id). */
  meetingId: string;
  venue: FtmTranscriptVenue;
  /** Static JSON path under /files/find-the-moment/{venue}/transcripts/. */
  url: string;
  windowCount: number;
  wordCount: number;
  /** Speech-to-text engine + model, shown on the page. */
  engine: string;
  /** Date the transcript file was produced (ISO yyyy-mm-dd). */
  generated: string;
  /** Source run file name, for traceability. */
  sourceFile: string;
  /** Short, plain note about known issues in this run (optional). */
  note?: string;
};

/** Plain-language label shown wherever transcript hits appear. */
export const FTM_TRANSCRIPT_LABEL =
  "Machine transcript (speech-to-text); check the video before quoting.";

export const FTM_TRANSCRIPTS: FtmTranscript[] = [
  {
    meetingId: "escribe-3a6eea40",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/escribe-3a6eea40.json",
    windowCount: 807,
    wordCount: 44619,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-08",
    sourceFile: "whisper-loudoun-bos-2026-10-06-business.srt",
    note: "Clean full run (no repeat loops). Some names are misspelled (e.g. Saines, TeKrony); check the video.",
  },
  {
    meetingId: "2026-09-22-1229286967",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-09-22-1229286967.json",
    windowCount: 902,
    wordCount: 56738,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1229286967.srt",
  },
  {
    meetingId: "escribe-79595442",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/escribe-79595442.json",
    windowCount: 974,
    wordCount: 56506,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "escribe-79595442.srt",
    note: "16 repeated segments collapsed",
  },
  {
    meetingId: "2026-09-15-1227257661",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-09-15-1227257661.json",
    windowCount: 660,
    wordCount: 52870,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1227257661.srt",
  },
  {
    meetingId: "escribe-be4b3b17",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/escribe-be4b3b17.json",
    windowCount: 207,
    wordCount: 12877,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "escribe-be4b3b17.srt",
    note: "2 repeated segments collapsed",
  },
  {
    meetingId: "2026-09-08-1225039248",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-09-08-1225039248.json",
    windowCount: 702,
    wordCount: 51519,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1225039248.srt",
  },
  {
    meetingId: "escribe-929244b6",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/escribe-929244b6.json",
    windowCount: 961,
    wordCount: 54731,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "escribe-929244b6.srt",
    note: "2 repeated segments collapsed",
  },
  {
    meetingId: "2026-08-11-1217434020",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-08-11-1217434020.json",
    windowCount: 521,
    wordCount: 37687,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1217434020.srt",
  },
  {
    meetingId: "8216",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8216.json",
    windowCount: 723,
    wordCount: 45253,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8216.srt",
  },
  {
    meetingId: "8214",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8214.json",
    windowCount: 4,
    wordCount: 201,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8214.srt",
    note: "Very short audio (~336s)",
  },
  {
    meetingId: "8213",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8213.json",
    windowCount: 690,
    wordCount: 45009,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8213.srt",
  },
  {
    meetingId: "2026-07-13-1209536330",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-07-13-1209536330.json",
    windowCount: 358,
    wordCount: 21591,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1209536330.srt",
  },
  {
    meetingId: "8208",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8208.json",
    windowCount: 579,
    wordCount: 35855,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8208.srt",
    note: "11 repeated segments collapsed",
  },
  {
    meetingId: "2026-06-23-1203915618",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-06-23-1203915618.json",
    windowCount: 634,
    wordCount: 40999,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1203915618.srt",
  },
  {
    meetingId: "8199",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8199.json",
    windowCount: 1015,
    wordCount: 61627,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8199.srt",
    note: "4 repeated segments collapsed",
  },
  {
    meetingId: "8198",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8198.json",
    windowCount: 461,
    wordCount: 29900,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8198.srt",
    note: "2 repeated segments collapsed",
  },
  {
    meetingId: "2026-06-09-1199853132",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-06-09-1199853132.json",
    windowCount: 750,
    wordCount: 48953,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1199853132.srt",
  },
  {
    meetingId: "8191",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8191.json",
    windowCount: 794,
    wordCount: 46461,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8191.srt",
    note: "15 repeated segments collapsed",
  },
  {
    meetingId: "2026-05-26-1195679789",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-05-26-1195679789.json",
    windowCount: 626,
    wordCount: 39342,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1195679789.srt",
  },
  {
    meetingId: "8185",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8185.json",
    windowCount: 859,
    wordCount: 50980,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8185.srt",
    note: "2 repeated segments collapsed",
  },
  {
    meetingId: "8179",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8179.json",
    windowCount: 5,
    wordCount: 301,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8179.srt",
    note: "3 repeated segments collapsed; Short audio (~2099s)",
  },
  {
    meetingId: "8178",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8178.json",
    windowCount: 249,
    wordCount: 16504,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8178.srt",
  },
  {
    meetingId: "2026-05-12-1191636709",
    venue: "loudoun-lcps",
    url: "/files/find-the-moment/loudoun-lcps/transcripts/2026-05-12-1191636709.json",
    windowCount: 598,
    wordCount: 41600,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "1191636709.srt",
  },
  {
    meetingId: "8174",
    venue: "loudoun-bos",
    url: "/files/find-the-moment/loudoun-bos/transcripts/8174.json",
    windowCount: 679,
    wordCount: 45022,
    engine: "whisper.cpp · large-v3-turbo",
    generated: "2026-10-09",
    sourceFile: "8174.srt",
  },
];

export const FTM_TRANSCRIPT_BY_MEETING: Record<string, FtmTranscript> = Object.fromEntries(
  FTM_TRANSCRIPTS.map((t) => [t.meetingId, t]),
);

export function ftmTranscriptFor(meetingId: string): FtmTranscript | undefined {
  return FTM_TRANSCRIPT_BY_MEETING[meetingId];
}
