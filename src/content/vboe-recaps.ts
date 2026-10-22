/**
 * Virginia Board of Education meeting recaps (redesign-v4 preview). One recap per transcribed meeting video.
 * Hard rules: votes ONLY from official VDOE minutes (Virginia Regulatory Town Hall, board 93), motion text
 * quoted verbatim; teacher-license cases are counted, never named; moments come from the machine transcript
 * with neutral labels and flagged verbatim quotes. Data: scripts/vboe-recaps-build.py -> vboe-recaps-data.ts.
 */
import type { RecapAgendaGroup, RecapContextNote, RecapDecision, RecapLink, RecapMoment } from "./loudoun-recaps";
import { VBOE_RECAPS } from "./vboe-recaps-data";

export type VboeRecap = {
  slug: string;
  meetingId: string;
  date: string;
  title: string;
  dateLabel: string;
  whenWhere: string;
  official: { votesPosted: boolean; checkedLabel: string; note: string; links: RecapLink[] };
  decisions: RecapDecision[];
  context: RecapContextNote[];
  agenda: RecapAgendaGroup[];
  moments: RecapMoment[];
  transcriptDownloads?: { pdfUrl: string; txtUrl: string; pdfNote?: string };
};

export { VBOE_RECAPS };
export const VBOE_RECAP_BY_SLUG: Record<string, VboeRecap> = Object.fromEntries(VBOE_RECAPS.map((r) => [r.slug, r]));
