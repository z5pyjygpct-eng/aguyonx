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

export type FtmTranscriptVenue = "loudoun-bos";

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
];

export const FTM_TRANSCRIPT_BY_MEETING: Record<string, FtmTranscript> = Object.fromEntries(
  FTM_TRANSCRIPTS.map((t) => [t.meetingId, t]),
);

export function ftmTranscriptFor(meetingId: string): FtmTranscript | undefined {
  return FTM_TRANSCRIPT_BY_MEETING[meetingId];
}
