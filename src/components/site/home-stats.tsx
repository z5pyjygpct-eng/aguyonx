import { siteStats } from "@/content/site-stats";

const n = (x: number) => x.toLocaleString("en-US");

/** One-sentence "by the numbers" strip. Counts derive from site catalogs at render time. */
export function HomeStats() {
  const s = siteStats();
  return (
    <p className="mt-6 font-mono text-xs tracking-wide text-muted-foreground sm:text-sm">
      <span className="tracking-widest uppercase">By the numbers:</span>{" "}
      {n(s.videos)} videos, {n(s.transcripts)} transcripts, {n(s.recaps)} meeting recaps, and {n(s.hours)} hours of audio processed.
    </p>
  );
}
