/**
 * Loudoun BOS + School Board "by the numbers" panel, beside Find the Moment on /counties/loudoun.
 * Every number is derived from the site catalogs (no hand-entered counts):
 *  - Meeting videos: LOUDOUN_MEETINGS listed
 *  - Searchable meetings: meetings with an indexed caption/transcript (windowCount > 0 or full transcript)
 *  - Full transcripts: FTM_TRANSCRIPTS entries for loudoun-bos (speech-to-text)
 *  - Meeting recaps: BOS recaps in LOUDOUN_RECAPS
 *  - Hours of audio transcribed: sum of published durations of the fully transcribed meetings
 */
import { LOUDOUN_MEETINGS } from "@/content/loudoun";
import { LCPS_MEETINGS } from "@/content/lcps";
import { LOUDOUN_RECAPS } from "@/content/loudoun-recaps";
import { FTM_TRANSCRIPTS } from "@/content/ftm-transcripts";

function secs(label: string | undefined): number {
  if (!label) return 0;
  const h = label.match(/(\d+)\s*h/i);
  const m = label.match(/(\d+)\s*m/i);
  return (h ? +h[1] * 3600 : 0) + (m ? +m[1] * 60 : 0);
}

export function loudounStats() {
  const full = new Set(FTM_TRANSCRIPTS.filter((t) => t.venue === "loudoun-bos" || t.venue === "loudoun-lcps").map((t) => t.meetingId));
  const ms: { id: string; windowCount: number; duration: string }[] = [...LOUDOUN_MEETINGS, ...LCPS_MEETINGS];
  return {
    videos: ms.length,
    searchable: ms.filter((m) => m.windowCount > 0 || full.has(m.id)).length,
    transcripts: ms.filter((m) => full.has(m.id)).length,
    recaps: LOUDOUN_RECAPS.length,
    hours: Math.round(ms.filter((m) => full.has(m.id)).reduce((a, m) => a + secs(m.duration), 0) / 3600),
  };
}

export function LoudounStats({ heading = "By the numbers · Loudoun BOS + School Board", className }: { heading?: string; className?: string } = {}) {
  const s = loudounStats();
  const rows = [
    { n: s.videos, label: "Meeting videos" },
    { n: s.searchable, label: "Searchable meetings", sub: "captions or transcript" },
    { n: s.transcripts, label: "Full transcripts", sub: "speech-to-text" },
    { n: s.recaps, label: "Meeting recaps" },
    { n: s.hours, label: "Hours of audio transcribed" },
  ];
  return (
    <aside className={`rounded-md border border-border bg-card px-5 py-5 ${className ?? ""}`}>
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{heading}</p>
      <dl className="mt-3 divide-y divide-border">
        {rows.map((r) => (
          <div key={r.label} className="flex items-baseline justify-between gap-4 py-3">
            <dt className="text-sm leading-tight text-foreground">
              {r.label}
              {r.sub ? <span className="block text-xs text-muted-foreground">{r.sub}</span> : null}
            </dt>
            <dd className="font-serif text-3xl font-medium tabular-nums text-[#1E4B8E]">{r.n.toLocaleString("en-US")}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
