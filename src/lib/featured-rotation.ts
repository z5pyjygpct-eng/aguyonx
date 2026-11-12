import type { Story } from "@/content/types";

/** Homepage Featured cards rotate weekly (ISO week, America/New_York). */
export const FEATURED_TIME_ZONE = "America/New_York";
export const FEATURED_COUNT = 3;
/** Cap how many site sections (vs. investigations) can appear in one week. */
export const FEATURED_MAX_SECTIONS = 2;

export type FeaturedKind = "investigation" | "section";

export type FeaturedItem = {
  id: string;
  kind: FeaturedKind;
  title: string;
  dek: string;
  image: string;
  imageAlt: string;
  kicker: string;
  cta: string;
  to: "/investigations/$slug" | "/virginia-2027-bills" | "/2027" | "/data/republicans-vs-democrats";
  slug?: string;
};

/** Site sections that join Investigations in the Featured pool. */
export const FEATURED_SECTIONS: FeaturedItem[] = [
  {
    id: "virginia-2027-bills",
    kind: "section",
    title: "Virginia 2027 Bills",
    dek: "Search new filings for the 2027 Regular Session, taken from Virginia's Legislative Information System.",
    image: "/images/featured/virginia-2027-bills.png",
    imageAlt: "Virginia 2027 Bills tracker",
    kicker: "Tracker",
    cta: "Open the tracker →",
    to: "/virginia-2027-bills",
  },
  {
    id: "election-2027",
    kind: "section",
    title: "2027 Election",
    dek: "Who has filed for the Nov. 2, 2027 general election — House, Senate, school boards, boards of supervisors, and constitutional officers.",
    image: "/images/featured/election-2027.png",
    imageAlt: "2027 Election filings",
    kicker: "Election",
    cta: "See who has filed →",
    to: "/2027",
  },
  {
    id: "visual-data",
    kind: "section",
    title: "Visual Data",
    dek: "Virginia House and Senate Republicans and Democrats side by side: voting records, bill outcomes, and policy areas from official records.",
    image: "/images/featured/visual-data.png",
    imageAlt: "Visual Data: Republicans vs. Democrats in the Virginia General Assembly",
    kicker: "Data · Virginia General Assembly",
    cta: "Open Visual Data →",
    to: "/data/republicans-vs-democrats",
  },
];

export function easternYmd(at: Date = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: FEATURED_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(at);
  const n = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return { year: n("year"), month: n("month"), day: n("day") };
}

/** ISO week (Monday start) for the US Eastern calendar date of `at`. */
export function isoWeek(at: Date = new Date()): { isoYear: number; week: number; serial: number } {
  const { year, month, day } = easternYmd(at);
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const isoYear = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(isoYear, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return { isoYear, week, serial: isoYear * 53 + week };
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const out = items.slice();
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function combinations<T>(items: readonly T[], k: number): T[][] {
  const out: T[][] = [];
  const rec = (start: number, acc: T[]) => {
    if (acc.length === k) {
      out.push(acc.slice());
      return;
    }
    for (let i = start; i <= items.length - (k - acc.length); i++) {
      acc.push(items[i]!);
      rec(i + 1, acc);
      acc.pop();
    }
  };
  rec(0, []);
  return out;
}

export function isFeaturedReady(item: { title?: string; image?: string; slug?: string; to?: string }): boolean {
  return Boolean(item.title?.trim() && item.image?.trim() && (item.slug?.trim() || item.to?.trim()));
}

/** Eligible Investigations plus the site-section cards, in a stable order. */
export function featuredPool(investigations: readonly Story[], sections: readonly FeaturedItem[] = FEATURED_SECTIONS): FeaturedItem[] {
  const inv: FeaturedItem[] = investigations.filter(isFeaturedReady).map((s) => ({
    id: s.slug,
    kind: "investigation",
    title: s.title,
    dek: s.dek,
    image: s.image,
    imageAlt: s.imageAlt,
    kicker: `Investigation · ${s.displayDate}`,
    cta: "Read the investigation →",
    to: "/investigations/$slug",
    slug: s.slug,
  }));
  const sec = sections.filter(isFeaturedReady);
  return [...inv, ...sec].sort((a, b) => a.id.localeCompare(b.id));
}

function sectionCount(items: readonly FeaturedItem[]): number {
  return items.filter((i) => i.kind === "section").length;
}

function setKey(items: readonly FeaturedItem[]): string {
  return items
    .map((i) => i.id)
    .slice()
    .sort()
    .join("|");
}

/**
 * Three Featured cards for the Eastern ISO week of `at`.
 * Stable for everyone in the same week; changes automatically the next week.
 * Prefers variety: at most `maxSections` site sections unless there are not enough Investigations.
 */
export function pickFeatured(
  pool: readonly FeaturedItem[],
  at: Date = new Date(),
  count = FEATURED_COUNT,
  maxSections = FEATURED_MAX_SECTIONS,
): FeaturedItem[] {
  const eligible = pool.filter(isFeaturedReady).sort((a, b) => a.id.localeCompare(b.id));
  if (eligible.length <= count) return eligible;

  const all = combinations(eligible, count);
  const valid = all.filter((combo) => sectionCount(combo) <= maxSections);
  const choices = valid.length > 0 ? valid : all;

  const { serial } = isoWeek(at);
  const indexOf = (serialKey: number) => Math.floor(mulberry32(serialKey)() * choices.length);
  let idx = indexOf(serial);
  const prevIdx = indexOf(serial - 1);
  if (choices.length > 1 && setKey(choices[idx]!) === setKey(choices[prevIdx]!)) {
    idx = (idx + 1) % choices.length;
  }
  return shuffle(choices[idx]!, serial);
}
