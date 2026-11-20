/**
 * Collapse Emergency Monitor carry-forwards: group by the title with
 * NEW / UPDATE / CONTINUATION / RESOLVED / MONITORING stripped, and keep
 * only the newest snapshot of each story. Location is not part of the key —
 * the same story often gets a slightly tighter Location on later windows,
 * and including it would split one event. Unnamed/empty titles are not merged.
 */

const STORY_PREFIX = /^(NEW|UPDATE|CONTINUATION|RESOLVED|MONITORING)\s*:\s*/i;

export function storyKey(it: { title?: string; text?: string }) {
  const raw = (it.title ?? it.text ?? "").trim();
  return raw.replace(STORY_PREFIX, "").replace(/\s+/g, " ").trim().toLowerCase();
}

export type StoryPack<I> = { datetime: string; sections: [string, I[]][] };

/** Keep the newest snapshot of each story. `rows` must already be newest-first. */
export function collapseLatest<I extends { title?: string; text?: string }>(rows: StoryPack<I>[]): StoryPack<I>[] {
  const seen = new Set<string>();
  const out: StoryPack<I>[] = [];
  let empty = 0;
  for (const e of rows) {
    const sections: [string, I[]][] = [];
    for (const [name, items] of e.sections) {
      const keep: I[] = [];
      for (const it of items) {
        const k = storyKey(it) || `\0empty-${e.datetime}-${empty++}`;
        if (seen.has(k)) continue;
        seen.add(k);
        keep.push(it);
      }
      if (keep.length) sections.push([name, keep]);
    }
    if (sections.length) out.push({ datetime: e.datetime, sections });
  }
  return out;
}

export function countPackedItems<I>(rows: StoryPack<I>[]) {
  return rows.reduce((n, e) => n + e.sections.reduce((m, [, items]) => m + items.length, 0), 0);
}
