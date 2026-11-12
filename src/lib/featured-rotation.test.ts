import assert from "node:assert/strict";
import test from "node:test";
import { INVESTIGATIONS } from "../content/investigations.ts";
import {
  FEATURED_SECTIONS,
  featuredPool,
  isoWeek,
  pickFeatured,
  type FeaturedItem,
} from "./featured-rotation.ts";

/** Instant for a wall-clock time in America/New_York. */
function atEastern(isoLocal: string): Date {
  const offset = [..."America/New_York"].reduce(() => 0, 0);
  void offset;
  // Use the offset that Intl reports for that civil time by probing.
  const naive = isoLocal; // YYYY-MM-DDTHH:mm:ss
  const guess = new Date(naive + "Z");
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(guess);
  const n = (t: string) => parts.find((p) => p.type === t)?.value;
  const got = `${n("year")}-${n("month")}-${n("day")}T${n("hour")}:${n("minute")}:${n("second")}`;
  const want = naive;
  // Difference between UTC guess and the Eastern reading, in ms.
  const [wy, wm, wd, wh, wmi, ws] = want.split(/[-T:]/).map(Number);
  const [gy, gm, gd, gh, gmi, gs] = got.split(/[-T:]/).map(Number);
  const wantUtc = Date.UTC(wy, wm - 1, wd, wh, wmi, ws);
  const gotUtc = Date.UTC(gy, gm - 1, gd, gh, gmi, gs);
  return new Date(guess.getTime() + (wantUtc - gotUtc));
}

const pool = featuredPool(INVESTIGATIONS, FEATURED_SECTIONS);

function ids(items: FeaturedItem[]): string[] {
  return items.map((i) => i.id);
}
function setOf(items: FeaturedItem[]): string {
  return [...ids(items)].sort().join("|");
}

test("pool includes every investigation with a title, image and link, plus the three site sections", () => {
  const invIds = INVESTIGATIONS.filter((s) => s.title && s.image && s.slug).map((s) => s.slug);
  const sectionIds = FEATURED_SECTIONS.map((s) => s.id);
  assert.equal(pool.length, invIds.length + sectionIds.length);
  for (const id of [...invIds, ...sectionIds]) assert.ok(pool.some((i) => i.id === id), id);
  assert.ok(pool.some((i) => i.to === "/virginia-2027-bills"));
  assert.ok(pool.some((i) => i.to === "/2027"));
  assert.ok(pool.some((i) => i.to === "/data/republicans-vs-democrats"));
});

test("ISO week uses the America/New_York calendar date", () => {
  const cases: [string, number, number][] = [
    ["2026-01-01T12:00:00", 2026, 1],
    ["2026-11-11T18:57:00", 2026, 46],
    ["2026-11-15T23:59:00", 2026, 46],
    ["2026-11-16T00:01:00", 2026, 47],
    ["2026-11-23T12:00:00", 2026, 48],
    ["2026-12-31T12:00:00", 2026, 53],
    ["2027-01-01T12:00:00", 2026, 53],
  ];
  for (const [when, year, week] of cases) {
    const got = isoWeek(atEastern(when));
    assert.deepEqual({ isoYear: got.isoYear, week: got.week }, { isoYear: year, week }, when);
  }
});

test("the same instant is stable, and consecutive weeks produce different sets", () => {
  const week46a = pickFeatured(pool, atEastern("2026-11-11T09:00:00"));
  const week46b = pickFeatured(pool, atEastern("2026-11-15T23:59:00"));
  const week47 = pickFeatured(pool, atEastern("2026-11-16T00:01:00"));
  const week48 = pickFeatured(pool, atEastern("2026-11-23T12:00:00"));

  assert.equal(week46a.length, 3);
  assert.deepEqual(ids(week46a), ids(week46b), "stable through the week");
  assert.notEqual(setOf(week46a), setOf(week47), "week 47 changes");
  assert.notEqual(setOf(week47), setOf(week48), "week 48 changes");
});

test("a week never repeats the previous week's set, and keeps at most two site sections", () => {
  let prev: string | null = null;
  for (let day = 0; day < 53; day++) {
    // Walk Mondays of 2026 starting Jan 5 (week 2) plus week 1 via Jan 1
    const start = Date.UTC(2026, 0, 1 + day * 7, 17); // 12:00 ET (EST)
    const pick = pickFeatured(pool, new Date(start));
    assert.equal(pick.length, 3);
    const sections = pick.filter((i) => i.kind === "section").length;
    assert.ok(sections <= 2, `too many sections: ${ids(pick).join(", ")}`);
    const key = setOf(pick);
    if (prev) assert.notEqual(key, prev, "repeated the previous week's set");
    prev = key;
  }
});
