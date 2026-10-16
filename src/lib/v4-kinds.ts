/** Meeting-type buckets derived from titles (display only). */
export function bosKind(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("budget")) return "Budget";
  if (t.includes("special")) return "Special";
  if (t.includes("public hearing") && !t.includes("business")) return "Public hearing";
  if (t.includes("business")) return "Business";
  return "Other";
}

/** Video host label from the player URL (display only). */
export function hostFromUrl(url: string): string {
  const h = (() => { try { return new URL(url).hostname.toLowerCase(); } catch { return ""; } })();
  if (/youtube\.com|youtu\.be/.test(h)) return "YouTube";
  if (/granicus\.com/.test(h)) return "Granicus";
  if (/wistia\.(net|com)/.test(h)) return "Wistia";
  if (/vimeo\.com/.test(h)) return "Vimeo";
  if (/boxcast\./.test(h)) return "BoxCast";
  if (/swagit\./.test(h)) return "Swagit";
  if (/escribemeetings\.com|isilive|escribe/.test(h)) return "eScribe";
  if (/vod\.|swagit|viebit/.test(h)) return h;
  return h.replace(/^www\./, "") || "Video";
}
