/**
 * Share controls for GA House / Senate floor recaps (preview).
 * - GaRecapMoments: renders recap.moments (optional, not in the data yet) with the same ShareMoment
 *   used by the Loudoun / city recaps. Nothing renders until the routine adds moments.
 * - ShareVideo: Copy link + X Post for the full session video (no timestamp), same button look.
 */
import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { ShareMoment } from "@/components/site/share-moment";

/** Shape a future moment needs on a GA recap entry (recap.moments). */
export type GaRecapMoment = {
  /** YouTube id of the session video (same as the meeting's youtubeId). */
  youtubeId: string;
  /** Offset into the video, in whole seconds. */
  seconds: number;
  /** Short description already shown on the page (sourced; no unverified quotes). */
  label: string;
  /** Optional LIS bill or item reference, e.g. "HB 1234". Shown as "Item HB 1234: label". */
  item?: string;
};

const btn =
  "inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground hover:border-[#0d7377] hover:text-[#0d7377] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d7377]";

export function stripWeekday(label: string) {
  return label.replace(/^[A-Z][a-z]+day,\s*/, "");
}

function secToHms(raw: number) {
  const s = Math.max(0, Math.floor(raw));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** Reads the optional moments field without touching the content types. */
export function recapMoments(recap: object): GaRecapMoment[] {
  const list = (recap as { moments?: unknown }).moments;
  if (!Array.isArray(list)) return [];
  return list.filter(
    (m): m is GaRecapMoment =>
      !!m && typeof m.youtubeId === "string" && m.youtubeId !== "" && typeof m.seconds === "number" && Number.isFinite(m.seconds) && typeof m.label === "string",
  );
}

export function GaRecapMoments({ moments, recapUrl, context }: { moments: GaRecapMoment[]; recapUrl: string; context: string }) {
  if (!moments.length) return null;
  return (
    <ul className="mt-3 divide-y divide-border">
      {moments.map((m) => {
        const url = `https://www.youtube.com/watch?v=${m.youtubeId}&t=${Math.max(0, Math.floor(m.seconds))}s`;
        const hms = secToHms(m.seconds);
        const time = hms.replace(/^0/, ""); // same as the local recaps
        return (
          <li key={`${m.youtubeId}-${m.seconds}`} className="py-2 text-sm">
            <p className="min-w-0 [overflow-wrap:anywhere]">
              <a href={url} target="_blank" rel="noopener noreferrer" className="mr-2 font-mono text-xs font-semibold text-gold hover:underline" aria-label={`Jump to ${hms} in the session video`}>
                {hms}
              </a>
              {m.item ? `Item ${m.item}: ${m.label}` : m.label}
            </p>
            <ShareMoment videoUrl={url} recapUrl={recapUrl} text={m.item ? `Item ${m.item}: ${m.label}` : m.label} context={context} time={time} />
          </li>
        );
      })}
    </ul>
  );
}

export function ShareVideo({ videoUrl, recapUrl, text }: { videoUrl: string; recapUrl: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(`${text}\n\nWatch: ${videoUrl}\nRecap: ${recapUrl}`)}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(videoUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = videoUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };
  return (
    <span className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Share the full video">
      <button type="button" onClick={copy} className={btn} aria-label="Copy full video link">
        {copied ? <Check className="size-3" aria-hidden /> : <Link2 className="size-3" aria-hidden />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a href={xUrl} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Post the full video on X">
        <span aria-hidden className="font-bold">𝕏</span> Post
      </a>
      <span aria-live="polite" className="sr-only">{copied ? "Link copied" : ""}</span>
    </span>
  );
}
