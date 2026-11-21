import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { candFinanceUrl, isFinanceUrl, memberFinanceUrl, type Cand, type Race } from "./elections-2027.ts";
import { endorsementFor, LOCAL_VIEWS, localGaps, localSections, matchMember, sameName, summarize, toLocalRow, type LocalFile, type LocalOffice } from "./elections-2027-local.ts";

const cand = (name: string, party: string | null, incumbent = false): Cand => ({ name, party, incumbent, party_source_url: null, filing_source_url: "x", committee_url: `cf/${name}` });
const race = (id: string, members: { name: string; party?: string | null }[], candidates: Cand[], extra: Partial<Race> = {}): Race => ({
  id, seat: id, seats: 1, source_url: "x", filing_source_url: "x", candidates, locality_id: "t", members_known: members.length > 0,
  current_members: members.map((m) => ({ name: m.name, party: m.party ?? null, source_url: "roster" })), ...extra,
});

test("BOS incumbent party: roster party first, then the incumbent's own committee record, else not listed", () => {
  const a = toLocalRow(race("a", [{ name: "Ann A", party: "R" }], [cand("Ann A", "D", true)]), "bos");
  assert.equal(a.incumbents[0].party, "R");
  const b = toLocalRow(race("b", [{ name: "Bob B" }], [cand("Robert B", "D", true)]), "bos");
  assert.equal(b.incumbents[0].party, "D");
  assert.equal(b.incumbents[0].partySource, "cf/Robert B");
  assert.equal(b.incumbents[0].filed, true);
  const c = toLocalRow(race("c", [{ name: "Cy C" }], []), "bos");
  assert.equal(c.incumbents[0].party, null);
  assert.equal(c.incumbents[0].filed, false);
});

test("challengers vs same-party (possible primary) for BOS/CO; School Board never splits by party or shows incumbent party", () => {
  const r = race("d", [{ name: "Dee D" }], [cand("Dee D", "D", true), cand("Rex R", "R"), cand("Dan D", "D"), cand("Ivy I", "Other")]);
  const bos = toLocalRow(r, "bos");
  assert.deepEqual(bos.challengers.map((c) => c.name), ["Rex R", "Ivy I"]);
  assert.deepEqual(bos.same.map((c) => c.name), ["Dan D"]);
  const sb = toLocalRow(r, "sb");
  assert.deepEqual(sb.challengers.map((c) => c.name), ["Rex R", "Dan D", "Ivy I"]);
  assert.equal(sb.same.length, 0);
  assert.equal(sb.incumbents[0].party, null);
});

test("multi-seat: committees match roster members by name; an unflagged committee with a member's name is that member's, not a challenger", () => {
  const r = race("al", [{ name: "Kyle McDaniel" }, { name: "Ryan McElveen" }, { name: "Ilryong Moon" }], [cand("Ryan Leighton McElveen", "D", true), cand("Robert Kyle McDaniel", "Other"), cand("Russ Brooks", "D")], { seats: 3 });
  const row = toLocalRow(r, "sb");
  assert.deepEqual(row.incumbents.map((i) => i.filed), [true, true, false]);
  assert.deepEqual(row.challengers.map((c) => c.name), ["Russ Brooks"]);
  assert.equal(sameName("Kyle McDaniel", "Robert Kyle McDaniel"), true);
  assert.equal(sameName("Kyle McDaniel", "Robert McDaniel"), false);
  assert.equal(matchMember(cand("Ryan Leighton McElveen", "D", true), r.current_members!)?.name, "Ryan McElveen");
});

test("no roster: no incumbent is invented; every counted committee is a challenger", () => {
  const row = toLocalRow(race("n", [], [cand("Karl L", "R")]), "co");
  assert.equal(row.incumbents.length, 0);
  assert.deepEqual(row.challengers.map((c) => c.name), ["Karl L"]);
});

test("School Board endorsements: none recorded means a dash (no guessing)", () => {
  assert.equal(endorsementFor("loudoun-at-large", "Anne Pogue Donohue"), null);
});

const load = (o: LocalOffice) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${o}.json`), "utf8")) as LocalFile;
const files = { bos: load("bos"), sb: load("sb"), co: load("co") };

test("real data: Loudoun shows all three offices with Algonkian and Sterling Check flags; Hanover has none; cities only show the shared county races", () => {
  const l = localSections("loudoun", files).shown;
  assert.deepEqual(l.map((x) => [x.view, x.rows.length]), [["bos", 9], ["sb", 4], ["co", 4]]);
  assert.deepEqual(l[0].rows.filter((r) => r.check).map((r) => r.seat).sort(), ["Algonkian", "Sterling"]);
  assert.equal(localSections("hanover", files).shown.length, 0);
  for (const c of ["fairfax-city", "manassas"]) {
    const x = localSections(c, files);
    assert.deepEqual(x.shown.map((s) => s.view), ["co"]);
    assert.ok(x.shown[0].rows.every((r) => !!r.sharedFrom));
    assert.deepEqual(x.offBallot.map((o) => o.body).sort(), ["City Council", "School Board"]);
    assert.equal(summarize(x.shown).seats, 0);
  }
  const ffx = localSections("fairfax-county", files).shown.find((s) => s.view === "sb")!;
  assert.ok(ffx.rows.find((r) => r.seat === "Hunter Mill")!.check);
  assert.equal(LOCAL_VIEWS.length, 3);
});

test("roster party from the Department of Elections record: label (Independent) and a title naming the election and the listed name", () => {
  const r: Race = { ...race("ca", [], [cand("Erin Bumgarner Barr", "Other", true)]), current_members: [{ name: "Erin B. Barr", party: "Other", party_label: "Independent", source_url: "roster", party_source_url: "elect.xlsx", party_election: "Nov. 7, 2023 general", party_elect_name: "Erin B. Barr" }] };
  const i = toLocalRow(r, "co").incumbents[0];
  assert.equal(i.party, "Other");
  assert.equal(i.partyLabel, "Independent");
  assert.equal(i.partySource, "elect.xlsx");
  assert.equal(i.partyTitle, "Party from the Virginia Department of Elections candidate list, Nov. 7, 2023 general");
  const w: Race = { ...race("tc", [], []), current_members: [{ name: "Misty D. Roundtree", party: "D", party_label: "Democratic", source_url: "roster", party_source_url: "elect.xlsx", party_election: "Nov. 7, 2023 general", party_elect_name: "Misty D. Whitehead", party_note: "Earlier name." }] };
  assert.equal(toLocalRow(w, "bos").incumbents[0].partyTitle, "Party from the Virginia Department of Elections candidate list, Nov. 7, 2023 general (listed as Misty D. Whitehead). Earlier name.");
});

test("data: rosters loaded for every covered board and office; partisan seats carry an ELECT-sourced party, School Board seats none", () => {
  const load = (o: string) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${o}.json`), "utf8")) as { races: Race[] };
  for (const o of ["bos", "sb", "co"]) {
    for (const r of load(o).races) {
      assert.ok((r.current_members ?? []).length > 0, `${r.id} has a roster`);
      for (const m of r.current_members ?? []) {
        if (o === "sb") assert.equal(m.party, null, `${r.id} ${m.name} is non-partisan`);
        else assert.match(m.party_source_url ?? "", /^https:\/\/(www|enr)\.elections\.virginia\.gov\//, `${r.id} ${m.name} party source`);
      }
    }
  }
  const co = load("co").races;
  const leonard = co.find((r) => r.id === "chesterfield-sheriff")!.candidates.find((c) => c.name === "Karl Stephen Leonard")!;
  assert.equal(leonard.incumbent, true);
  const al = load("sb").races.find((r) => r.id === "fairfax-county-at-large")!;
  assert.equal(al.candidates.find((c) => c.name === "Robert Kyle McDaniel")!.incumbent, true);
  const hd20 = load("house").races.find((r) => r.district === 20)!;
  assert.equal(hd20.current_member!.party, "D");
});

test("running for another office: still the seat's member, tagged runningFor, never counted as filed; summary counts it", () => {
  const r: Race = { ...race("sbc", [], [cand("Doug K", "D")]), current_members: [{ name: "Lisa Z", party: null, source_url: "roster", running_for: { office_id: "bos", race_id: "bc", office: "Board of County Supervisors, Coles District", committee_url: "cf/Lisa" } }] };
  const row = toLocalRow(r, "sb");
  assert.equal(row.incumbents[0].member.name, "Lisa Z");
  assert.equal(row.incumbents[0].filed, false);
  assert.equal(row.incumbents[0].runningFor!.race_id, "bc");
  assert.deepEqual(row.challengers.map((c) => c.name), ["Doug K"]);
});

test("data: Franklin's stale Woodbridge committee is dropped with a reason; Zargarpur is a Coles supervisor challenger and runs elsewhere on the School Board", () => {
  const load = (o: string) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${o}.json`), "utf8")) as { races: Race[] };
  const bos = load("bos").races, sb = load("sb").races;
  const wb = bos.find((r) => r.id === "prince-william-woodbridge")!;
  assert.ok(!wb.candidates.some((c) => c.name === "Margaret Angela Franklin"));
  const ex = wb.excluded!.find((x) => x.name === "Margaret Angela Franklin")!;
  assert.match(ex.reason, /^Stale: .*House of Delegates District 23/);
  assert.match(ex.source_url, /^https:\/\/house\.vga\.virginia\.gov\//);
  const wbRow = toLocalRow(wb, "bos");
  assert.equal(wbRow.incumbents[0].member.name, "Jeannie LaCroix");
  assert.ok(!wbRow.challengers.some((c) => c.name === "Margaret Angela Franklin"));
  const coles = toLocalRow(bos.find((r) => r.id === "prince-william-coles")!, "bos");
  assert.ok(coles.challengers.some((c) => c.name === "Lisa Zargarpur"));
  const sbc = toLocalRow(sb.find((r) => r.id === "prince-william-coles")!, "sb");
  assert.equal(sbc.incumbents[0].member.name, "Lisa A. Zargarpur");
  assert.equal(sbc.incumbents[0].runningFor!.race_id, "prince-william-coles");
  assert.equal(sbc.incumbents[0].runningFor!.office_id, "bos");
});

test("tile gaps: per incumbent with no challenger; partisan split by incumbent party; School Board counts as unchallenged; same-party and running-elsewhere do not count", () => {
  const sec = (view: LocalOffice, rows: ReturnType<typeof toLocalRow>[]) => ({ view, label: view, rows });
  const bos = [
    toLocalRow(race("a", [{ name: "Ann A", party: "R" }], [cand("Ann A", "R", true)]), "bos"),
    toLocalRow(race("b", [{ name: "Bob B", party: "D" }], [cand("Bob B", "D", true), cand("Dan D", "D")]), "bos"),
    toLocalRow(race("c", [{ name: "Cy C", party: "D" }], [cand("Rex R", "R")]), "bos"),
    toLocalRow(race("e", [{ name: "Eve E", party: null }], []), "bos"),
  ];
  const run = race("f", [{ name: "Fay F", party: "D" }], []);
  run.current_members![0].running_for = { office_id: "bos", race_id: "chair", office: "Chair" };
  bos.push(toLocalRow(run, "bos"));
  const sb = [toLocalRow(race("s1", [{ name: "Sue S" }, { name: "Sal T" }], [], { seats: 2 }), "sb"), toLocalRow(race("s2", [{ name: "Sam U" }], [cand("Ivy I", null)]), "sb")];
  assert.deepEqual(localGaps([sec("bos", bos), sec("sb", sb)]), { R: 1, D: 1, other: 1, schoolBoard: 2, total: 5 });
});

test("finance links: only official committee pages; incumbents fall back to their latest official committee, then their own check flag; never guessed", () => {
  const ok = "https://cfreports.elections.virginia.gov/Committee/Index/21c0c1c3-f8b4-e811-bffd-984be103f032";
  assert.equal(isFinanceUrl(ok), true);
  assert.equal(isFinanceUrl("https://example.com/Committee/Index/21c0c1c3-f8b4-e811-bffd-984be103f032"), false);
  assert.equal(candFinanceUrl({ committee_url: "cf/x" }), null);
  const r = race("g", [{ name: "Gil G", party: "D" }], []);
  const m = r.current_members![0];
  assert.equal(memberFinanceUrl(r, m), null);
  m.finance_committee = { committee_url: ok, committee_name: "Friends of Gil" };
  assert.equal(memberFinanceUrl(r, m), ok);
  m.finance_committee = null;
  r.check = { label: "x", member: "Gil G", note: "n", committee_url: ok };
  assert.equal(memberFinanceUrl(r, m), ok);
  r.check = { label: "x", member: "Someone Else", note: "n", committee_url: ok };
  assert.equal(memberFinanceUrl(r, m), null);
});

test("data: every finance link in the data is an official committee page, and every counted committee has one", () => {
  for (const o of ["house", "senate", "bos", "sb", "co"]) {
    const races = (JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${o}.json`), "utf8")) as { races: Race[] }).races;
    for (const r of races) {
      for (const c of r.candidates) assert.ok(candFinanceUrl(c), `${o} ${r.id} ${c.name}`);
      for (const m of r.current_members ?? (r.current_member ? [r.current_member] : [])) if (m.finance_committee) assert.ok(isFinanceUrl(m.finance_committee.committee_url), m.name);
    }
  }
});

test("data: Briskman is shown running for Loudoun Chair (editor's report, same party as Randall) and the Algonkian seat is marked, citing the official record", () => {
  const chair = toLocalRow(files.bos.races.find((r) => r.id === "loudoun-chair")!, "bos");
  assert.equal(chair.incumbents[0].member.name, "Phyllis J. Randall");
  assert.deepEqual(chair.announced.map((x) => [x.a.name, x.sameParty]), [["Juli E. Briskman", true]]);
  assert.match(chair.announced[0].a.note, /CC-18-00409.*Algonkian District.*final report/);
  assert.ok(!chair.challengers.some((c) => /Briskman/.test(c.name)) && !chair.same.some((c) => /Briskman/.test(c.name)));
  const alg = toLocalRow(files.bos.races.find((r) => r.id === "loudoun-algonkian")!, "bos");
  assert.equal(alg.incumbents[0].runningFor!.race_id, "loudoun-chair");
  assert.equal(alg.incumbents[0].runningFor!.basis, "editor");
  assert.equal(alg.incumbents[0].financeUrl, "https://cfreports.elections.virginia.gov/Committee/Index/21c0c1c3-f8b4-e811-bffd-984be103f032");
  const g = localGaps(localSections("loudoun", files).shown);
  assert.equal(g.total, g.R + g.D + g.other + g.schoolBoard);
});

test("data: Vicky Hu is an announced Democratic primary challenger to Saines in Sterling, not a counted committee", () => {
  const st = toLocalRow(files.bos.races.find((r) => r.id === "loudoun-sterling")!, "bos");
  assert.equal(st.incumbents[0].member.name, "Koran T. Saines");
  assert.equal(st.incumbents[0].party, "D");
  assert.deepEqual(st.announced.map((x) => [x.a.name, x.a.party, x.a.party_label, x.sameParty]), [["Vicky Hu", "D", "Democratic", true]]);
  assert.equal(st.announced[0].a.basis, "editor");
  assert.equal(st.announced[0].a.reported, "2026-11-16");
  assert.match(st.announced[0].a.note, /Loudoun Now.*Nov\. 16, 2026/);
  assert.match(st.announced[0].a.note, /Democratic primary/);
  assert.match(st.announced[0].a.note, /not an official filing/);
  assert.match(st.announced[0].a.note, /not on the ballot/);
  assert.match(st.announced[0].a.note, /no registered 2027 committee/);
  assert.ok(st.announced[0].a.note.includes("https://www.loudounnow.com/news/hu-announces-run-for-sterling-district-supervisor/article_112f7f3e-21c1-4125-a193-1a541fcaa63c.html"));
  assert.equal(st.announced[0].a.finance_committee_url ?? null, null);
  assert.equal(st.challengers.length, 0);
  assert.ok(!st.same.some((c) => /Hu/.test(c.name)) && !st.challengers.some((c) => /Hu/.test(c.name)));
  assert.equal(JSON.stringify(st.race).toLowerCase().includes("vpap"), false);
});

test("How to Use 2027 Election Dashboard: bullets carry the data date and cover every feature Scott listed", async () => {
  const { e27HowtoBullets, E27_HOWTO_TITLE } = await import("./election-2027-howto.ts");
  const b = e27HowtoBullets("2026-11-19");
  assert.equal(E27_HOWTO_TITLE, "How to Use 2027 Election Dashboard");
  const all = b.join(" ");
  for (const w of ["November 19, 2026", "official state and county records", "seat chart", "Tap a square", "Republican Challenger Gaps", "“gap”", "Board of Supervisors", "run again", "not put them on the ballot", "$ Finances", "search bar", "News box", "Filter by county or city"]) assert.ok(all.includes(w), w);
});
