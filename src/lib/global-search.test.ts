import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { asLegislatorRecord, asLocalRecord } from "./campaign-money-search.ts";
import { expandDonorFile, findDonor, type DonorFile } from "./finance-donors.ts";
import { searchGlobal, type CompactBill, type GlobalHit, type GlobalSearchData } from "./global-search.ts";

const root = path.join(import.meta.dirname, "..");

function loadJson(rel: string) {
  return JSON.parse(readFileSync(path.join(root, rel), "utf8"));
}

const legislatorFile = loadJson("content/finance-committees.json") as {
  members: Record<string, Parameters<typeof asLegislatorRecord>[0]>;
};
const localFile = loadJson("content/finance-local-committees.json") as {
  committees: Parameters<typeof asLocalRecord>[0][];
};
const donorFile = loadJson("content/finance-donors.json") as DonorFile;
const billFile = loadJson("content/bills-2027-search.json") as { bills: CompactBill[] };

const DATA: GlobalSearchData = {
  legislators: Object.values(legislatorFile.members).map(asLegislatorRecord),
  locals: (localFile.committees ?? []).map(asLocalRecord),
  donors: expandDonorFile(donorFile),
  bills: billFile.bills ?? [],
};

function byCategory(hits: GlobalHit[], category: GlobalHit["category"]) {
  return hits.filter((h) => h.category === category);
}

describe("global search", () => {
  it("Patrick Hope and a partial name reach Del. Hope's legislator profile", () => {
    const hits = searchGlobal("Patrick Hope", DATA);
    const legs = byCategory(hits, "Legislator");
    assert.ok(legs.length, "expected a legislator hit");
    assert.match(legs[0].title, /Hope/);
    assert.match(legs[0].href, /\/dashboards\/house\/members\/patrick-a-hope/);
    const committees = byCategory(hits, "Committee");
    assert.ok(committees.some((h) => /Friends of Patrick Hope/i.test(h.title)));
    assert.ok(committees[0].href.includes("cfreports.elections.virginia.gov"));
  });

  it("Kilgore and HD45 resolve to Del. Terry G. Kilgore", () => {
    for (const q of ["Kilgore", "HD45", "HD 45", "District 45"]) {
      const legs = byCategory(searchGlobal(q, DATA), "Legislator");
      assert.ok(
        legs.some((h) => /Terry G\. Kilgore/.test(h.title) && h.href.includes("terry-g-kilgore")),
        `expected Kilgore profile for ${q}, got ${legs.map((h) => h.title).join("; ")}`,
      );
    }
  });

  it("Phyllis Randall is a local Board of Supervisors candidate", () => {
    const hits = searchGlobal("Phyllis Randall", DATA);
    const local = byCategory(hits, "Local Candidate");
    assert.ok(local.some((h) => /Randall/.test(h.title)));
    assert.ok(local[0].href.startsWith("/campaign-money"));
    assert.match(local[0].snippet, /Supervisor|Board of Supervisors|Loudoun/i);
  });

  it("Friends of Patrick Hope matches the official committee without the exact-title problem", () => {
    const hits = byCategory(searchGlobal("Friends of Patrick Hope", DATA), "Committee");
    assert.ok(hits.some((h) => h.title === "Friends of Patrick Hope"));
    assert.ok(hits[0].href.includes("cfreports.elections.virginia.gov/Committee/Index/"));
    assert.ok(!hits.some((h) => /vpap/i.test(h.href)));
  });

  it("Clean Virginia is a donor with official recipients", () => {
    const hits = byCategory(searchGlobal("Clean Virginia", DATA), "Donor");
    assert.ok(hits.length, "expected a donor hit");
    assert.match(hits[0].title, /Clean Virginia/i);
    assert.match(hits[0].href, /\/campaign-money\?donor=/);
    assert.match(hits[0].snippet, /\$/);
    const id = new URL("https://example.com" + hits[0].href).searchParams.get("donor");
    assert.ok(id);
    const donor = findDonor(DATA.donors, id);
    assert.ok(donor);
    assert.ok(donor.recipients.length >= 1);
    assert.ok(donor.recipients.some((r) => /Rouse for Senate|Friends of Alex Askew|Guzman/i.test(r.committeeName)));
    assert.ok(!JSON.stringify(donor).toLowerCase().includes("vpap"));
  });

  it("bill numbers reach the 2027 tracker for new and continued filings", () => {
    const newHits = byCategory(searchGlobal("SB852", DATA), "2027 Bill");
    assert.ok(newHits.some((h) => /SB 852/.test(h.title) && /New 2027/.test(h.snippet)));
    assert.ok(newHits[0].href.includes("/virginia-2027-bills?q="));

    const spaced = byCategory(searchGlobal("SB 852", DATA), "2027 Bill");
    assert.ok(spaced.some((h) => /SB 852/.test(h.title)));

    const continued = byCategory(searchGlobal("HB 1003", DATA), "2027 Bill");
    assert.ok(continued.some((h) => /HB 1003/.test(h.title) && /Continued from 2026/.test(h.snippet)));

    const missing = byCategory(searchGlobal("SB 624", DATA), "2027 Bill");
    assert.ok(missing.some((h) => h.href.includes("SB") && h.href.includes("624")));
  });

  it("HD 1 and SD 33 reach the matching legislator profiles", () => {
    const hd1 = byCategory(searchGlobal("HD 1", DATA), "Legislator");
    assert.ok(hd1.some((h) => /Hope/.test(h.title) && h.href.includes("patrick-a-hope")));

    const sd33 = byCategory(searchGlobal("SD 33", DATA), "Legislator");
    assert.ok(sd33.length, "expected a Senate District 33 member");
    assert.ok(sd33.every((h) => h.href.startsWith("/dashboards/senate/members/") || /33/.test(h.snippet) || /33/.test(h.title) || /Senate of Virginia · District 33/.test(h.snippet)));
    assert.ok(sd33.some((h) => /District 33/.test(h.snippet)));
  });

  it("committee links stay on the official state site", () => {
    const hrefs = searchGlobal("Hope", DATA)
      .filter((h) => h.category === "Committee")
      .map((h) => h.href)
      .join(" ");
    assert.ok(hrefs.includes("cfreports.elections.virginia.gov"));
    assert.ok(!/vpap/i.test(hrefs));
  });
});
