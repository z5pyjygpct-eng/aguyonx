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
  assert.equal(kilgore.donors?.length, 40);
  assert.ok((kilgore.donors ?? []).every((d, i, all) => i === 0 || all[i - 1]!.cents >= d.cents));
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

test("Kilgore spending categories include itemized payees so a category can be opened to see who was paid", () => {
  const categories = kilgore.spending?.categories ?? [];
  assert.ok(categories.length > 0);
  for (const category of categories) {
    const items = category.items ?? [];
    assert.ok(items.length > 0, `${category.name} should list itemized payments`);
    assert.equal(
      items.reduce((sum, item) => sum + item.cents, 0),
      category.cents,
      `${category.name} itemized payments should add up to the category total`,
    );
    assert.ok(items[0]!.name);
    assert.ok(items.every((item, i) => i === 0 || items[i - 1]!.cents >= item.cents));
  }
  const consulting = categories.find((c) => c.name === "Consulting and campaign work");
  assert.ok(consulting);
  assert.equal(consulting.cents, 4_329_210);
  assert.ok(consulting.items?.some((item) => item.name === "Hayley Allison"));
  const polling = categories.find((c) => c.name === "Polling and research");
  assert.equal(polling?.items?.[0]?.name, "Cygnal (IFA Holdings LLC)");
  assert.equal(polling?.items?.[0]?.item, "Polling");
  assert.equal(polling?.items?.[0]?.cents, 3_000_000);
});

test("Kilgore donors include itemized gifts so a donor row can be opened", () => {
  const donors = kilgore.donors ?? [];
  assert.equal(donors.length, 40);
  for (const donor of donors) {
    const gifts = donor.gifts ?? [];
    assert.ok(gifts.length > 0, `${donor.name} should list itemized gifts`);
    assert.equal(gifts.length, donor.count);
    assert.equal(
      gifts.reduce((sum, gift) => sum + gift.cents, 0),
      donor.cents,
      `${donor.name} itemized gifts should add up to the donor total`,
    );
    assert.ok(gifts.every((gift) => gift.type === "direct" || gift.type === "inkind"));
  }
  const ballard = donors[0];
  assert.equal(ballard?.name, "Ballard for Delegate");
  assert.equal(ballard?.donorId, "ballard-for-delegate");
  assert.equal(ballard?.gifts?.[0]?.cents, 1_500_000);
  assert.equal(ballard?.gifts?.[0]?.type, "direct");
  assert.equal(ballard?.gifts?.[0]?.date, "2026-01-02");
  assert.equal(ballard?.gifts?.[0]?.reportId, "495571");
  const party = donors.find((d) => d.name === "Republican Party of Virginia Inc.");
  assert.equal(party?.gifts?.[0]?.type, "inkind");
  assert.equal(party?.gifts?.[0]?.item, "Printing, postage and mailing");
  const pace = donors.find((d) => d.name === "Karmin A. Pace");
  assert.equal(pace?.kind, "individual");
  assert.equal(pace?.gifts?.[0]?.employer, "requested");
  assert.equal(pace?.gifts?.[0]?.occupation, "requested");
});

test("Kilgore vendors include every payee, with itemized payments for a vendor row", () => {
  const vendors = kilgore.spending?.vendors ?? [];
  assert.equal(vendors.length, 62);
  assert.ok(vendors.length > 10);
  assert.ok((vendors ?? []).every((v, i, all) => i === 0 || all[i - 1]!.cents >= v.cents));
  for (const vendor of vendors) {
    const items = vendor.items ?? [];
    assert.ok(items.length > 0, `${vendor.name} should list itemized payments`);
    assert.equal(items.length, vendor.count);
    assert.equal(
      items.reduce((sum, item) => sum + item.cents, 0),
      vendor.cents,
      `${vendor.name} itemized payments should add up to the vendor total`,
    );
  }
  const hayley = vendors[0];
  assert.equal(hayley?.name, "Hayley Allison");
  assert.equal(hayley?.cents, 3_734_935);
  assert.equal(hayley?.count, 13);
  assert.ok(hayley?.items?.some((item) => item.item === "Campaign work" && item.category === "Consulting and campaign work"));
  const cygnal = vendors.find((v) => v.name === "Cygnal (IFA Holdings LLC)");
  assert.equal(cygnal?.cents, 3_000_000);
  assert.equal(cygnal?.items?.[0]?.item, "Polling");
  assert.equal(cygnal?.items?.[0]?.category, "Polling and research");
  assert.equal(cygnal?.items?.[0]?.date, "2026-01-27");
  assert.equal(cygnal?.items?.[0]?.cents, 3_000_000);
});
