import { useEffect, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

type Props = {
  /** Official video URL that jumps to this second (eScribe / Granicus / Vimeo). */
  videoUrl: string;
  /** Canonical recap page URL. */
  recapUrl: string;
  /** Short description already shown on the page (no unverified quotes). */
  text: string;
  /** e.g. "Loudoun BOS, Oct 6, 2026" */
  context: string;
  /** h:mm:ss */
  time: string;
};

const btn =
  "inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground hover:border-[#0d7377] hover:text-[#0d7377] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d7377]";

function clip(s: string, max: number) {
  return s.length <= max ? s : `${s.slice(0, max - 1).trimEnd()}…`;
}

export function buildShareText(text: string, context: string, time: string) {
  const tail = ` — ${context} at ${time}`;
  return `“${clip(text.replace(/\.$/, ""), 250 - tail.length)}”${tail}`;
}

export function ShareMoment({ videoUrl, recapUrl, text, context, time }: Props) {
  const [copied, setCopied] = useState(false);
  const shareText = buildShareText(text, context, time);
  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    `${shareText}\n\nWatch: ${videoUrl}\nRecap: ${recapUrl}`,
  )}`;

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

  const nativeShare = async () => {
    try {
      await navigator.share({ title: shareText, text: `${shareText}\nRecap: ${recapUrl}`, url: videoUrl });
    } catch {
      /* user cancelled */
    }
  };
  const [canNative, setCanNative] = useState(false);
  useEffect(() => {
    setCanNative(
      typeof navigator.share === "function" && !!window.matchMedia?.("(pointer: coarse)").matches,
    );
  }, []);

  return (
    <span className="mt-1.5 flex flex-wrap items-center gap-1.5" role="group" aria-label={`Share the moment at ${time}`}>
      <button type="button" onClick={copy} className={btn} aria-label={`Copy video link to ${time}`}>
        {copied ? <Check className="size-3" aria-hidden /> : <Link2 className="size-3" aria-hidden />}
        {copied ? "Copied" : "Copy link"}
      </button>
      <a href={xUrl} target="_blank" rel="noopener noreferrer" className={btn} aria-label={`Post the moment at ${time} on X`}>
        <span aria-hidden className="font-bold">𝕏</span> Post
      </a>
      {canNative ? (
        <button type="button" onClick={nativeShare} className={btn} aria-label={`Share the moment at ${time}`}>
          <Share2 className="size-3" aria-hidden /> Share
        </button>
      ) : null}
      <span aria-live="polite" className="sr-only">{copied ? "Link copied" : ""}</span>
    </span>
  );
}
