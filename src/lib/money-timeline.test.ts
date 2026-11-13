import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import type { FinanceIndex, FinanceSummary } from "./finance-summaries.ts";
import {
  availableMonths,
  barPercent,
  compactUsd,
  parseTimelineMonth,
  parseTimelineYear,
  timelineBars,
  timelineYears,
} from "./money-timeline.ts";

const dir = path.resolve(import.meta.dirname, "../content/finance-summaries");
const kilgore = JSON.parse(fs.readFileSync(path.join(dir, "terry-g-kilgore.json"), "utf8")) as FinanceSummary;
const index = JSON.parse(fs.readFileSync(path.join(dir, "_index.json"), "utf8")) as FinanceIndex;

test("Kilgore history runs 2021 to 2026, oldest first", () => {
  const years = timelineYears(kilgore.history?.years);
  assert.deepEqual(
    years.map((y) => y.year),
    [2021, 2022, 2023, 2024, 2025, 2026],
  );
});

test("all-years bars use the official per-year raised and spent totals", () => {
  const bars = timelineBars(kilgore.history!.years);
  const y2021 = bars.find((b) => b.year === 2021)!;
  const official = kilgore.history!.years.find((y) => y.year === 2021)!;
  assert.equal(y2021.inCents, official.raisedCents);
  assert.equal(y2021.outCents, official.spentCents);
  assert.equal(y2021.month, undefined);
});

test("monthly bars add up to the year's itemized gifts and payments", () => {
  for (const y of kilgore.history!.years) {
    const bars = timelineBars(kilgore.history!.years, y.year);
    assert.ok(bars.length >= 1 && bars.length <= 12);
    assert.equal(
      bars.reduce((s, b) => s + b.inCents, 0),
      y.giftCents,
      `${y.year} gifts`,
    );
    assert.equal(
      bars.reduce((s, b) => s + b.outCents, 0),
      y.paymentCents,
      `${y.year} payments`,
    );
    assert.deepEqual(
      bars.map((b) => b.month),
      Array.from({ length: bars.length }, (_, i) => i + 1),
    );
  }
});

test("available months only list months with activity", () => {
  const months = availableMonths(kilgore.history!.years, 2023);
  assert.ok(months.length > 0);
  for (const m of months) assert.ok(m >= 1 && m <= 12);
  assert.deepEqual(availableMonths(kilgore.history!.years, undefined), []);
});

test("index carries all-legislator totals by year and month", () => {
  const totals = index.historyTotals ?? [];
  assert.deepEqual(
    totals.map((t) => t.year),
    [2021, 2022, 2023, 2024, 2025, 2026],
  );
  const t2026 = totals.find((t) => t.year === 2026)!;
  assert.equal(
    t2026.months.reduce((s, m) => s + m.giftCents, 0),
    t2026.giftCents,
  );
});

test("helpers format and parse", () => {
  assert.equal(compactUsd(95_000), "$950");
  assert.equal(compactUsd(1_234_567), "$12K");
  assert.equal(compactUsd(121_990_300), "$1.2M");
  assert.equal(compactUsd(99_997_554), "$1M");
  assert.equal(barPercent(0, 100), 0);
  assert.equal(barPercent(1, 1_000_000), 1.5);
  assert.equal(barPercent(50, 100), 50);
  assert.equal(parseTimelineYear("2024", [2023, 2024]), 2024);
  assert.equal(parseTimelineYear("2019", [2023, 2024]), undefined);
  assert.equal(parseTimelineMonth("7"), 7);
  assert.equal(parseTimelineMonth("13"), undefined);
});
