import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import type { Cand, Race } from "./elections-2027.ts";
import { CHAMBER_VIEWS, challengerRows, gapRows, incumbentStatus, rowsForView, toRow, unclearSeats, VIEW_BY_ID, VIEW_GROUPS } from "./elections-2027-challengers.ts";

const cand = (name: string, party: string | null, incumbent = false): Cand => ({ name, party, incumbent, party_source_url: null, filing_source_url: "x" });
const race = (district: number, member: { name: string; party: string | null } | null, candidates: Cand[], extra: Partial<Race> = {}): Race => ({
  id: `hd${district}`, seat: `HD${district}`, district, seats: 1, source_url: "x", filing_source_url: "x", candidates, members_known: !!member,
  current_member: member ? { ...member, source_url: "x" } : null, current_members: member ? [{ ...member, source_url: "x" }] : [], ...extra,
});

const R_FILED_WITH_D = race(1, { name: "Rita R", party: "R" }, [cand("Rita R", "R", true), cand("Dan D", "D")]);
const R_ALONE = race(2, { name: "Rob R", party: "R" }, [cand("Rob R", "R", true)]);
const R_NOT_FILED_IND = race(3, { name: "Ray R", party: "R" }, [cand("Ivy I", "Other")]);
const R_PRIMARY_ONLY = race(4, { name: "Rex R", party: "R" }, [cand("Rex R", "R", true), cand("Ron R", "R")]);
const D_NOT_FILED_EMPTY = race(5, { name: "Dee D", party: "D" }, []);
const D_CHECK_WITH_R = race(6, { name: "Don D", party: "D" }, [cand("Rick R", "R")], { check: { label: "Check", member: "Don D", note: "flag", committee_url: "x" } });
const UNCLEAR = race(7, { name: "Pat P", party: null }, [cand("Pat P", null, true)]);
const VACANT = race(8, null, [cand("Val D", "D")]);
const UNLISTED_CH = race(9, { name: "Dot D", party: "D" }, [cand("Dot D", "D", true), cand("Nia N", null)]);
const ALL = [R_ALONE, VACANT, R_FILED_WITH_D, R_NOT_FILED_IND, R_PRIMARY_ONLY, D_NOT_FILED_EMPTY, D_CHECK_WITH_R, UNCLEAR, UNLISTED_CH];

test("challenger rows: one per district with that party's incumbent, district order, filed or not", () => {
  assert.deepEqual(challengerRows(ALL, "R").map((r) => r.district), [1, 2, 3, 4]);
  assert.deepEqual(challengerRows(ALL, "D").map((r) => r.district), [5, 6, 9]);
});

test("columns: opposite party, other/unlisted, same party kept apart; the incumbent is never a challenger", () => {
  const a = toRow(R_FILED_WITH_D)!;
  assert.deepEqual(a.opposite.map((c) => c.name), ["Dan D"]);
  assert.equal(a.other.length, 0);
  const b = toRow(R_NOT_FILED_IND)!;
  assert.deepEqual(b.other.map((c) => c.name), ["Ivy I"]);
  const c = toRow(R_PRIMARY_ONLY)!;
  assert.deepEqual(c.same.map((x) => x.name), ["Ron R"]);
  assert.equal(c.opposite.length + c.other.length, 0);
  assert.deepEqual(toRow(UNLISTED_CH)!.other.map((x) => x.name), ["Nia N"]);
});

test("gaps: no opposite-party and no other challenger; a same-party primary does not fill a gap", () => {
  assert.deepEqual(gapRows(ALL, "R").map((r) => r.district), [2, 4]);
  assert.deepEqual(gapRows(ALL, "D").map((r) => r.district), [5]);
});

test("incumbent status: filed, not filed yet, check flag", () => {
  assert.equal(incumbentStatus(R_FILED_WITH_D), "filed");
  assert.equal(incumbentStatus(R_NOT_FILED_IND), "not-filed");
  assert.equal(incumbentStatus(D_NOT_FILED_EMPTY), "not-filed");
  assert.equal(incumbentStatus(D_CHECK_WITH_R), "check");
});

test("unclear seats (no party on roster, vacant) are reported and left out of both lists", () => {
  assert.deepEqual(unclearSeats(ALL).map((u) => u.district), [7, 8]);
  for (const p of ["D", "R"] as const) assert.ok(!challengerRows(ALL, p).some((r) => r.district === 7 || r.district === 8));
});

test("view registry: four views with Scott's labels, every view in a known group, ids unique", () => {
  assert.deepEqual(CHAMBER_VIEWS.map((v) => v.label), ["Republican Incumbent Challengers", "Democrat Incumbent Challengers", "Republican Challenger Gaps", "Democrat Challenger Gaps"]);
  const groups = new Set(VIEW_GROUPS.map((g) => g.id));
  assert.ok(CHAMBER_VIEWS.every((v) => groups.has(v.group)));
  assert.equal(VIEW_BY_ID.size, CHAMBER_VIEWS.length);
  assert.deepEqual(rowsForView(ALL, VIEW_BY_ID.get("r-gaps")!).map((r) => r.district), [2, 4]);
});

for (const office of ["house", "senate"] as const) {
  test(`${office} data: gaps are a subset of challenger rows; every seat is in exactly one party list or unclear; HD69 check carried`, () => {
    const races = (JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${office}.json`), "utf8")) as { races: Race[] }).races;
    const r = challengerRows(races, "R"), d = challengerRows(races, "D"), u = unclearSeats(races);
    assert.equal(r.length + d.length + u.length, races.length);
    for (const p of ["D", "R"] as const) {
      const ids = new Set(challengerRows(races, p).map((x) => x.seat));
      assert.ok(gapRows(races, p).every((x) => ids.has(x.seat) && !x.opposite.length && !x.other.length));
    }
    if (office === "house") {
      const hd69 = d.find((x) => x.district === 69);
      assert.equal(hd69?.status, "check");
    }
  });
}

import { presumedNoFiling, presumedStatus } from "./elections-2027-challengers.ts";
test("presumed rule: a not-filed incumbent counts toward the seat color, a filed one is not double counted, no incumbent = raw status", () => {
  assert.equal(presumedStatus(D_NOT_FILED_EMPTY), "D");
  assert.equal(presumedStatus(R_NOT_FILED_IND), "contested");
  assert.equal(presumedStatus(D_CHECK_WITH_R), "contested");
  assert.equal(presumedStatus(R_ALONE), "R");
  assert.equal(presumedStatus(VACANT), "D");
  assert.equal(presumedNoFiling(D_NOT_FILED_EMPTY), true);
  assert.equal(presumedNoFiling(R_ALONE), false);
  // gaps unchanged by the presumption
  assert.deepEqual(gapRows(ALL, "D").map((r) => r.district), [5]);
});
