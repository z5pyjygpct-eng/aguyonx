import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  asLegislatorRecord,
  asLocalRecord,
  committeePageUrl,
  rankCampaignMoney,
  type CampaignMoneyRecord,
} from "./campaign-money-search.ts";

const legislatorRaw = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "../content/finance-committees.json"), "utf8"),
) as { members: Record<string, Parameters<typeof asLegislatorRecord>[0]> };

const localRaw = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "../content/finance-local-committees.json"), "utf8"),
) as { committees: Parameters<typeof asLocalRecord>[0][]; counts: { total: number } };

const LEGISLATORS: CampaignMoneyRecord[] = Object.values(legislatorRaw.members).map(asLegislatorRecord);
const LOCAL: CampaignMoneyRecord[] = localRaw.committees.map(asLocalRecord);
const ALL = [...LEGISLATORS, ...LOCAL];

function names(q: string, filter?: { kind?: "legislator" | "supervisor" | "school-board" | "all" }): string[] {
  return rankCampaignMoney(ALL, q, 25, filter).map((h) => h.name);
}

test("Patrick Hope finds Friends of Patrick Hope without the exact committee title", () => {
  const hits = rankCampaignMoney(LEGISLATORS, "Patrick Hope");
  assert.ok(hits.length > 0);
  assert.equal(hits[0]!.name, "Patrick A. Hope");
  assert.equal(hits[0]!.committeeName, "Friends of Patrick Hope");
  assert.equal(
    hits[0]!.href,
    "https://cfreports.elections.virginia.gov/Committee/Index/ab516195-90cf-e111-b0b8-984be103f032",
  );
});

test("reordered and partial Hope queries still put Del. Hope first", () => {
  assert.equal(names("Hope Patrick")[0], "Patrick A. Hope");
  assert.equal(names("Patr Hope")[0], "Patrick A. Hope");
});

test("Kilgore and HD45 resolve to Del. Terry G. Kilgore's official committee", () => {
  const byName = rankCampaignMoney(LEGISLATORS, "Kilgore");
  assert.equal(byName[0]!.name, "Terry G. Kilgore");
  assert.equal(byName[0]!.committeeName, "Kilgore for Delegate");
  assert.equal(byName[0]!.href, committeePageUrl("69de0881-babf-e111-a757-984be103f032"));

  const byDistrict = rankCampaignMoney(LEGISLATORS, "HD45");
  assert.ok(byDistrict.some((h) => h.name === "Terry G. Kilgore"));
});

test("every sitting legislator in the official map is findable by last name", () => {
  const missing: string[] = [];
  for (const row of LEGISLATORS) {
    const last =
      row.name
        .replace(/,/g, "")
        .trim()
        .split(/\s+/)
        .filter((p) => !/^(Jr\.?|Sr\.?|II|III|IV)$/.test(p))
        .pop() ?? "";
    const hits = rankCampaignMoney(LEGISLATORS, last, 200);
    if (!hits.some((h) => h.lisId === row.lisId)) missing.push(`${row.name} (queried ${last})`);
  }
  assert.equal(missing.length, 0, missing.join(", "));
});

test("Phyllis Randall finds the Loudoun Board of Supervisors chair committee without the exact title", () => {
  const hits = rankCampaignMoney(ALL, "Phyllis Randall", 10, { kind: "supervisor" });
  assert.ok(hits.length > 0);
  assert.ok(/randall/i.test(hits[0]!.name));
  assert.equal(hits[0]!.committeeName, "Friends of Phyllis Randall");
  assert.equal(hits[0]!.href, committeePageUrl("0f0e5872-7496-e411-b268-984be103f032"));
  assert.equal(hits[0]!.kind, "supervisor");
});

test("Ashburn school board finds the official Loudoun school board committee", () => {
  const hits = rankCampaignMoney(ALL, "Ashburn school board", 15, { kind: "school-board" });
  assert.ok(hits.some((h) => /Griffiths/i.test(h.name) && /Ashburn/i.test(h.officeLabel + h.seat + h.committeeName)));
});

test("committee links stay on the official state site and never point at VPAP", () => {
  for (const row of ALL) {
    const href = committeePageUrl(row.committeeId);
    assert.ok(href.startsWith("https://cfreports.elections.virginia.gov/Committee/Index/"));
    assert.ok(!href.toLowerCase().includes("vpap"));
  }
  assert.equal(LEGISLATORS.length, 139);
  assert.ok(localRaw.counts.total >= 2000);
});
