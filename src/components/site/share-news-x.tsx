const btn =
  "inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-0.5 text-xs font-medium text-muted-foreground hover:border-[#0d7377] hover:text-[#0d7377] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0d7377]";

export function newsXIntentUrl(headline: string, url: string) {
  return `https://x.com/intent/post?text=${encodeURIComponent(headline)}&url=${encodeURIComponent(url)}`;
}

/** Opens X's pre-filled composer for a news clip (visitor still presses Post). */
export function ShareNewsX({ headline, url }: { headline: string; url: string }) {
  return (
    <a
      href={newsXIntentUrl(headline, url)}
      target="_blank"
      rel="noopener noreferrer"
      className={btn}
      aria-label={`Share on X: ${headline}`}
    >
      <span aria-hidden>Share on</span> <span aria-hidden className="font-bold">𝕏</span>
    </a>
  );
}
