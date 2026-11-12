import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  formatDate,
  formatPeriod,
  formatUsd,
  kindLabel,
  lateFilingCount,
  percent,
  reportUrl,
  reportXmlUrl,
  sourceLine,
  type FinanceIndex,
  type FinanceSummary,
} from "./finance-summaries.ts";

const dir = path.join(import.meta.dirname, "../content/finance-summaries");
const kilgore = JSON.parse(fs.readFileSync(path.join(dir, "terry-g-kilgore.json"), "utf8")) as FinanceSummary;
const index = JSON.parse(fs.readFileSync(path.join(dir, "_index.json"), "utf8")) as FinanceIndex;

test("Kilgore mid-year 2026 totals match the official state XML for report 495571", () => {
  assert.equal(kilgore.slug, "terry-g-kilgore");
  assert.equal(kilgore.committeeName, "Kilgore for Delegate");
  assert.equal(kilgore.committeeCode, "CC-12-00170");
  assert.equal(kilgore.status, "ready");
  assert.equal(kilgore.itemizedCoverage, "full");
  assert.equal(kilgore.latestReport?.id, "495571");
  assert.equal(kilgore.latestReport?.filed, "2026-07-14");
  assert.equal(kilgore.latestReport?.end, "2026-06-30");
  assert.equal(kilgore.cashOnHandCents, 7_665_439);
  assert.equal(kilgore.raisedCycleCents, 11_569_600);
  assert.equal(kilgore.spentCycleCents, 14_692_540);
  assert.equal(kilgore.cycle, "11/2027");
  assert.equal(kilgore.verification?.matchedOfficialXml, true);
  assert.equal(kilgore.donors?.[0]?.name, "Ballard for Delegate");
  assert.equal(kilgore.donors?.[0]?.cents, 1_500_000);
  assert.ok(kilgore.csvPath?.endsWith("/terry-g-kilgore.csv"));
  const csv = fs.readFileSync(path.join(import.meta.dirname, "../../public/files/campaign-money/terry-g-kilgore.csv"), "utf8");
  assert.match(csv, /Copy of official Virginia Department of Elections campaign finance data, as of 2026-06-30/);
  assert.match(csv, /\$76,654\.39/);
  assert.match(csv, /Ballard for Delegate/);
});

test("every sitting legislator has a ready summary in the index", () => {
  assert.equal(index.readyCount, 139);
  assert.equal(index.members.length, 139);
  assert.equal(index.members[0]?.slug, "terry-g-kilgore");
  assert.ok(index.members.every((m) => m.status === "ready" && m.committeeId && m.cashOnHandCents != null));
});

test("display helpers format official dates, sources, and percents in plain language", () => {
  assert.equal(formatDate("2026-06-30"), "June 30, 2026");
  assert.equal(formatPeriod("2026-01-01", "2026-06-30"), "Jan 1–Jun 30, 2026");
  assert.equal(formatUsd(7_665_439), "$76,654.39");
  assert.equal(formatUsd(11_569_600), "$115,696");
  assert.equal(kindLabel("candidate"), "Candidate committee");
  assert.equal(percent(8676600, 8676600 + 2850000), 75.3);
  assert.equal(reportUrl("495571"), "https://cfreports.elections.virginia.gov/Report/Index/495571");
  assert.equal(reportXmlUrl("495571"), "https://cfreports.elections.virginia.gov/Report/ReportXML/495571");
  assert.match(sourceLine(kilgore.latestReport), /filed July 14, 2026 \(Report 495571\)/);
  const late = lateFilingCount(kilgore.filings);
  assert.equal(late.total, 22);
  assert.equal(late.late, 4);
});
