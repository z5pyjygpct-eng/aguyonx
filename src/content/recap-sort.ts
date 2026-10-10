/**
 * Recap lists render newest meeting first. Sort is derived from data (slug date / date field),
 * never from array order, so recaps appended by the morning routine stay ordered.
 */
type Sortable = { slug: string; date?: string; venue?: string; dateLabel?: string; whenWhere?: string };

export function recapDateKey(r: Sortable): string {
  const m = (r.date ?? r.slug).match(/(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  const t = r.dateLabel ? Date.parse(r.dateLabel.replace(/^\w+,\s*/, "")) : NaN;
  return Number.isNaN(t) ? "0000-00-00" : new Date(t).toISOString().slice(0, 10);
}

function timeKey(r: Sortable): number {
  const m = (r.whenWhere ?? "").match(/(\d{1,2}):(\d{2})\s*([ap])\.?m/i);
  if (!m) return -1;
  return ((+m[1] % 12) + (m[3].toLowerCase() === "p" ? 12 : 0)) * 60 + +m[2];
}

export function sortRecapsNewestFirst<T extends Sortable>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const d = recapDateKey(b).localeCompare(recapDateKey(a));
    if (d) return d;
    const t = timeKey(b) - timeKey(a);
    if (t) return t;
    return (a.venue ?? "").localeCompare(b.venue ?? "") || a.slug.localeCompare(b.slug);
  });
}
