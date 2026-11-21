import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  countText, EMPTY, facetCount, filterEntries, flatten, groupEntries, isCheck, localityOptions, memberNotFiled, partyCount, seatPill, STATUS_LABEL, matches, OFFICE_ORDER, parseDirSearch, statusOf, toFilters, toggle,
  type Entry, type Office, type OfficeFile, type Race,
} from "./elections-2027.ts";

const load = (o: Office) => JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `elections-2027-${o}.json`), "utf8")) as OfficeFile;
const files = Object.fromEntries(OFFICE_ORDER.map((o) => [o, load(o)])) as Record<Office, OfficeFile>;
const all = flatten(files);

test("every race from all five official files is in the directory once", () => {
  const total = OFFICE_ORDER.reduce((n, o) => n + files[o].races.length, 0);
  assert.equal(all.length, total);
  assert.equal(new Set(all.map((e) => e.office + ":" + e.race.id)).size, total);
});

test("no VPAP source survives anywhere in the data", () => {
  for (const o of OFFICE_ORDER) assert.doesNotMatch(JSON.stringify(files[o]), /vpap/i, o);
});

test("every race keeps an official seat source and filing source", () => {
  for (const e of all) {
    assert.match(e.race.source_url, /^https:\/\//, e.race.id);
    assert.match(e.race.filing_source_url, /elections\.virginia\.gov/, e.race.id);
  }
});

test("status comes only from filings: no filing is never contested, and no seat is ever called open", () => {
  const blank: Race = { id: "x", seat: "X", seats: 1, source_url: "https://a", filing_source_url: "https://b", candidates: [] };
  assert.equal(statusOf(blank, "bos"), "none");
  assert.equal(memberNotFiled(blank), false, "no roster -> no member claim");
  assert.equal(memberNotFiled({ ...blank, members_known: true }), true);
  const two: Race = { ...blank, candidates: [{ name: "A", incumbent: false, party: "D", party_source_url: "u", filing_source_url: "u" }, { name: "B", incumbent: true, party: "R", party_source_url: "u", filing_source_url: "u" }] };
  assert.equal(statusOf(two, "bos"), "contested");
  assert.equal(memberNotFiled({ ...two, members_known: true }), false);
  assert.equal(statusOf({ ...two, seats: 2 }, "sb"), "unopposed");
});

test("status partitions cover every race exactly once", () => {
  const c = filterEntries(all, { ...EMPTY, statuses: ["contested"] }).length;
  const one = filterEntries(all, { ...EMPTY, statuses: ["one"] }).length;
  const none = filterEntries(all, { ...EMPTY, statuses: ["none"] }).length;
  assert.equal(c + one + none, all.length);
});

test("pills in one row widen (OR) and rows narrow (AND)", () => {
  const lou = filterEntries(all, { ...EMPTY, localities: ["loudoun"] });
  const ffx = filterEntries(all, { ...EMPTY, localities: ["fairfax-county"] });
  const both = filterEntries(all, { ...EMPTY, localities: ["loudoun", "fairfax-county"] });
  assert.equal(both.length, new Set([...lou, ...ffx].map((e) => e.office + e.race.id)).size);
  const louBos = filterEntries(all, { ...EMPTY, localities: ["loudoun"], offices: ["bos"] });
  assert.ok(louBos.length > 0 && louBos.every((e) => e.office === "bos" && e.race.locality_id === "loudoun"));
  assert.equal(facetCount(all, EMPTY, "localities", "loudoun"), lou.length);
});

test("shared offices show under the city too, without a duplicate race", () => {
  const city = filterEntries(all, { ...EMPTY, localities: ["fairfax-city"], offices: ["bos", "sb", "co"] });
  assert.deepEqual(city.map((e) => e.race.id).sort(), ["fairfax-county-commonwealth-s-attorney", "fairfax-county-sheriff"]);
  const man = filterEntries(all, { ...EMPTY, localities: ["manassas"], offices: ["bos", "sb", "co"] });
  assert.deepEqual(man.map((e) => e.race.id).sort(), ["prince-william-commonwealth-s-attorney", "prince-william-sheriff"]);
  assert.ok(!all.some((e) => e.race.id.startsWith("fairfax-city-") || e.race.id.startsWith("manassas-")));
});

test("search matches district number, office, locality and seat", () => {
  const q = (s: string) => filterEntries(all, { ...EMPTY, q: s });
  assert.deepEqual(q("House District 45").map((e) => e.race.id), ["hd45"]);
  assert.ok(q("45").some((e) => e.race.id === "hd45") && q("45").some((e) => e.race.id === "sd45") === false);
  assert.equal(q("henrico").filter((e) => e.race.locality_id).length, 12);
  assert.ok(q("sheriff").every((e) => e.office === "co"));
  assert.ok(q("Hunter Mill").length === 2);
  const withMember = all.find((e) => e.race.current_member)!;
  assert.ok(matches(withMember, { ...EMPTY, q: withMember.race.current_member!.name }));
});

test("localities are built from the data and include the new counties", () => {
  const ids = localityOptions(files).map((l) => l.id);
  for (const id of ["loudoun", "fairfax-county", "prince-william", "henrico", "chesterfield", "albemarle", "fairfax-city", "manassas"]) assert.ok(ids.includes(id), id);
});

test("groups are office then locality, with counts that add up", () => {
  const g = groupEntries(all);
  assert.deepEqual(g.map((x) => x.office), OFFICE_ORDER);
  for (const x of g) assert.equal(x.count, x.localities.reduce((n, l) => n + l.entries.length, 0));
  assert.equal(g.find((x) => x.office === "house")!.localities.length, 1);
});

test("URL query round-trips and drops unknown values", () => {
  const s = parseDirSearch({ r_office: "bos,house,bogus", r_loc: "loudoun", r_status: "contested,nope", r_party: "D,X", r_q: " Briskman " });
  assert.deepEqual(s, { r_office: "bos,house", r_loc: "loudoun", r_status: "contested", r_party: "D", r_q: " Briskman " });
  const f = toFilters(s);
  assert.deepEqual(f.offices, ["bos", "house"]);
  assert.equal(toggle(f.statuses, "contested"), undefined);
  assert.equal(toggle(f.statuses, "none"), "contested,none");
});

test("Loudoun + Contested is a valid, shareable view", () => {
  const f = toFilters(parseDirSearch({ r_loc: "loudoun", r_status: "contested" }));
  const out: Entry[] = filterEntries(all, f);
  assert.ok(out.length > 0 && out.every((e) => e.localityIds.includes("loudoun") && e.status === "contested"));
});

test("chart statuses line up with the filter statuses", async () => {
  const { chartStatus, statusMatches, tally } = await import("./elections-2027.ts");
  for (const e of all) {
    const k = chartStatus(e);
    assert.equal(k === "contested", statusMatches(e, "contested"), e.race.id);
    assert.equal(k === "none", statusMatches(e, "none"), e.race.id);
    assert.equal(k === "one" || k === "unopposed", statusMatches(e, "one"), e.race.id);
  }
  const t = tally(all);
  assert.equal(t.contested + t.one + t.unopposed + t.none, all.length);
});

test("party counts use only the record's party; a blank party is 'Party not listed', never R, D or Other", async () => {
  const { partyCount } = await import("./elections-2027.ts");
  const base = { id: "x", seat: "X", seats: 1, source_url: "https://a", filing_source_url: "https://b" };
  const c = (party: string | null) => ({ name: "n", incumbent: false, party, party_source_url: null, filing_source_url: "u" });
  const e: Entry = { office: "bos", status: "contested", localityIds: [], localityName: null, race: { ...base, candidates: [c("R"), c("D"), c("D"), c("Other")] } };
  assert.deepEqual(partyCount(e), { R: 1, D: 2, Other: 1, notListed: 0, total: 4 });
  const sb: Entry = { office: "sb", status: "contested", localityIds: [], localityName: null, race: { ...base, candidates: [c(null), c(null)] } };
  assert.deepEqual(partyCount(sb), { R: 0, D: 0, Other: 0, notListed: 2, total: 2 });
});

test("official filed-date windows count days in Eastern Time and never guess a date", async () => {
  const { candidateInWindow, isNewCandidate, hasOfficialDate, todayET, filedWindowCandidateCount, candidatesWithoutDate, parseDirSearch, toFilters } = await import("./elections-2027.ts");
  const src = "https://www.elections.virginia.gov/casting-a-ballot/candidate-list/";
  const c = (d: string | null, u: string | null = src) => ({ name: "n", incumbent: false, party: "D", party_source_url: u, filing_source_url: src, filed_date: d, filed_date_source_url: u });
  // 11:30 PM ET on Nov 19 is already Nov 20 in UTC; ET day must still be Nov 19.
  const late = todayET(new Date("2026-11-20T04:30:00Z"));
  assert.deepEqual(late, { y: 2026, m: 11, d: 19 });
  // 12:30 AM ET Nov 20 (05:30 UTC) is Nov 20.
  assert.deepEqual(todayET(new Date("2026-11-20T05:30:00Z")), { y: 2026, m: 11, d: 20 });
  assert.equal(candidateInWindow(c("11/19/2026"), "today", late), true);
  assert.equal(candidateInWindow(c("11/18/2026"), "today", late), false);
  assert.equal(candidateInWindow(c("11/12/2026"), "7d", late), true);
  assert.equal(candidateInWindow(c("11/11/2026"), "7d", late), false);
  assert.equal(candidateInWindow(c("10/20/2026"), "30d", late), true);
  assert.equal(candidateInWindow(c("10/05/2026"), "45d", late), true);
  assert.equal(candidateInWindow(c("10/04/2026"), "45d", late), false);
  assert.equal(candidateInWindow(c("9/20/2026"), "60d", late), true);
  assert.equal(candidateInWindow(c("9/19/2026"), "60d", late), false);
  assert.equal(candidateInWindow(c("11/20/2026"), "60d", late), false, "future date is never in a window");
  assert.equal(isNewCandidate(c("11/13/2026"), late), true);
  // No date, a bad date, or a date without its source never counts.
  for (const bad of [c(null), c("2026-11-19"), c("2/30/2026"), c("11/19/2026", null)]) {
    assert.equal(hasOfficialDate(bad), false);
    assert.equal(candidateInWindow(bad, "60d", late), false);
  }
  const race = { id: "r", seat: "S", seats: 1, source_url: src, filing_source_url: src, candidates: [c("11/19/2026"), c("10/30/2026"), c(null)] };
  const es: Entry[] = [{ office: "bos", race, status: "D", localityIds: ["loudoun"], localityName: "Loudoun" }];
  const f = { ...EMPTY, today: late };
  assert.deepEqual(["today", "7d", "30d", "45d", "60d"].map((w) => filedWindowCandidateCount(es, f, w as never)), [1, 1, 2, 2, 2]);
  assert.equal(candidatesWithoutDate(es), 1);
  assert.equal(filterEntries(es, { ...f, filed: "today" }).length, 1);
  assert.equal(filterEntries(es, { ...f, filed: "today", localities: ["albemarle"] }).length, 0, "combines with other pills");
  assert.equal(toFilters(parseDirSearch({ r_filed: "45d" })).filed, "45d");
  assert.equal(parseDirSearch({ r_filed: "90d" }).r_filed, undefined);
});

test("every filled seat is a registered campaign committee linked to its official record", () => {
  let n = 0;
  for (const e of all) for (const c of e.race.candidates) {
    n++;
    assert.equal(c.filing_kind, "registration", c.name);
    assert.equal(c.label, "Registered campaign committee, not yet on the ballot");
    assert.match(c.committee_url ?? "", /^https:\/\/cfreports\.elections\.virginia\.gov\/Committee\/Index\//, c.name);
    assert.ok(c.party === null || ["D", "R", "Other"].includes(c.party), c.name);
    if (c.party) assert.ok(c.party_source_url, "a party always has its record");
    assert.equal(c.filed_date, null, "the committee record prints no registration date, so none is invented");
    if (e.office !== "house" && e.office !== "senate") assert.match(c.statement_url ?? "", /StatementOfOrganization/, "local match uses the Statement of Organization");
  }
  assert.ok(n > 100, `registrations loaded (${n})`);
});

test("current members come only from official member lists", () => {
  for (const e of all) for (const m of e.race.current_members ?? []) {
    assert.match(m.source_url, /house\.vga\.virginia\.gov|apps\.senate\.virginia\.gov|loudoun\.gov|fairfaxcounty\.gov|fcps\.edu|pwcva\.gov|pwcvotes\.org|pwcs\.edu|henrico\.gov|henricoschools\.us|oneccps\.org|chesterfield\.gov|albemarle\.org/, m.name);
  }
  assert.equal(all.find((e) => e.race.id === "hd10")!.race.current_member!.name, "Dan Helmer");
});

test("coverage: House and Senate districts per locality come from the official registrant file, with full or part coverage", async () => {
  const { districtsForLocality } = await import("./elections-2027.ts");
  const ids = (o: "house" | "senate", l: string) => districtsForLocality(all, o, l).map((x) => `${x.e.race.district}:${x.cov.coverage}`);
  assert.deepEqual(ids("house", "loudoun"), ["26:part", "27:part", "28:part", "29:part", "30:part"]);
  assert.deepEqual(ids("senate", "loudoun"), ["31:part", "32:part"]);
  assert.deepEqual(ids("house", "fairfax-city"), ["11:all"]);
  assert.deepEqual(ids("senate", "fairfax-city"), ["37:all"]);
  assert.deepEqual(ids("house", "manassas"), ["20:all"]);
  assert.deepEqual(ids("senate", "manassas"), ["30:all"]);
  assert.deepEqual(ids("senate", "albemarle"), ["11:all"]);
  for (const l of ["loudoun", "fairfax-county", "prince-william", "henrico", "chesterfield", "albemarle", "fairfax-city", "manassas"]) {
    for (const o of ["house", "senate"] as const) {
      const d = districtsForLocality(all, o, l);
      assert.ok(d.length > 0, `${o} ${l}`);
      for (const x of d) assert.match(x.cov.source_url, /^https:\/\/www\.elections\.virginia\.gov\/media\/registration-statistics\/.*Daily_Registrant_Count_By_(House|Senate)_/, `${o} ${l}`);
      // "all" only when the locality sits in exactly one district of that chamber
      assert.ok(d.every((x) => (x.cov.coverage === "all") === (d.length === 1)), `${o} ${l}`);
    }
  }
});

test("the locality pill also filters House and Senate races to the districts touching that locality", () => {
  const lou = filterEntries(all, { ...EMPTY, localities: ["loudoun"], offices: ["house", "senate"] });
  assert.deepEqual(lou.map((e) => e.race.id).sort(), ["hd26", "hd27", "hd28", "hd29", "hd30", "sd31", "sd32"]);
  assert.ok(!filterEntries(all, { ...EMPTY, localities: ["loudoun"] }).some((e) => e.race.id === "hd10"));
});

// ---- Stricter 2027 counting rule (tools/elections-2027/registrations.py apply_rule) ----
const H = (n: number) => all.find((e) => e.office === "house" && e.race.district === n)!.race;
const S = (n: number) => all.find((e) => e.office === "senate" && e.race.district === n)!.race;
const names = (r: Race) => r.candidates.map((c) => c.name.toLowerCase());

test("stricter rule: HD 30 counts only McAuliff (D) and Higgins (R); Dippert (Culpeper, old district) and Banse (dormant 2023) are dropped", () => {
  const r = H(30);
  assert.equal(r.candidates.length, 2);
  assert.ok(names(r).some((n) => n.includes("mcauliff")) && names(r).some((n) => n.includes("higgins")));
  assert.ok(!names(r).some((n) => n.includes("dippert") || n.includes("banse")));
  assert.deepEqual(partyCount({ office: "house", race: r, status: statusOf(r, "house"), localityIds: [], localityName: null }), { R: 1, D: 1, Other: 0, notListed: 0, total: 2 });
});

test("stricter rule: HD 27 drops the stale Khan committee and says 'Member not filed', never 'Open seat'", () => {
  const r = H(27);
  assert.ok(!names(r).some((n) => n.includes("khan")));
  assert.equal(r.candidates.length, 0);
  assert.ok(r.members_known && r.current_member);
  assert.equal(memberNotFiled(r), true);
  assert.equal(seatPill(r), "Member not filed");
});

test("residence check applies to House and Senate seats too (pre-2023 districts with the same number are dropped)", () => {
  assert.ok(!names(H(29)).some((n) => n.includes("turben")), "Turben (Winchester) is not in the current HD 29");
  assert.ok(!names(S(32)).some((n) => n.includes("howell")), "Howell (Fairfax) is not in the current SD 32");
  assert.ok(!names(S(17)).some((n) => n.includes("dippert")), "Dippert (Culpeper) is not in the current SD 17");
});

test("every counted committee carries a 2027 activity signal and is on a 2027-cycle, non-final record", () => {
  for (const e of all) {
    for (const c of e.race.candidates) {
      if (c.filing_kind !== "registration") continue;
      assert.ok(c.activity && c.activity.length > 0, `${e.race.id} ${c.name}`);
      assert.ok(c.activity!.every((a) => /^(registered in 20\d\d|Statement of Organization amended in 20\d\d naming 2027|raised \$[\d,]+ on 2026 reports|current officeholder)$/.test(a)), `${e.race.id} ${c.name} ${c.activity}`);
      assert.doesNotMatch(c.office_sought_record ?? "", /do not use/i);
      assert.match(c.committee_url ?? "", /^https:\/\/cfreports\.elections\.virginia\.gov\/Committee\/Index\//);
      assert.equal(c.label, "Registered campaign committee, not yet on the ballot");
    }
  }
});

test("Loudoun totals under the stricter rule: 19 committees (7 Republican, 8 Democrat, 4 other party)", () => {
  const seen = new Set<string>();
  const t = { R: 0, D: 0, Other: 0, none: 0 };
  for (const e of all.filter((x) => x.localityIds.includes("loudoun"))) {
    if (e.office !== "house" && e.office !== "senate" && e.race.locality_id !== "loudoun") continue;
    for (const c of e.race.candidates) {
      if (seen.has(c.committee_code!)) continue;
      seen.add(c.committee_code!);
      t[(c.party === "R" || c.party === "D" ? c.party : c.party ? "Other" : "none") as keyof typeof t]++;
    }
  }
  assert.deepEqual(t, { R: 7, D: 8, Other: 4, none: 0 });
});

test("Check flags: Briskman (Algonkian, final after 2026 money) and Saines (Sterling, 'Do Not Use') show Check with a plain note", () => {
  const bos = (seat: string) => all.find((e) => e.office === "bos" && e.race.id === `loudoun-${seat}`)!.race;
  for (const [seat, who, word] of [["algonkian", "Briskman", /final/], ["sterling", "Saines", /Do Not Use/]] as const) {
    const r = bos(seat);
    assert.ok(isCheck(r), seat);
    assert.equal(seatPill(r), "Check");
    assert.match(r.check!.member, new RegExp(who));
    assert.match(r.check!.note, word);
    assert.match(r.check!.note, /Virginia Department of Elections/);
    assert.equal(memberNotFiled(r), false, "a Check seat is not also 'Member not filed'");
  }
});

test("no 'Open seat' label survives: status pills, filters and search use 'Member not filed yet'", () => {
  for (const v of Object.values(STATUS_LABEL)) assert.doesNotMatch(v, /open/i);
  assert.ok(!("open" in STATUS_LABEL));
  assert.deepEqual(parseDirSearch({ r_status: "open" }), {});
  const mnf = filterEntries(all, { ...EMPTY, statuses: ["member"] });
  assert.ok(mnf.length > 0 && mnf.every((e) => e.race.members_known && !e.race.candidates.some((c) => c.incumbent)));
  assert.ok(mnf.some((e) => e.race.id === "hd27"));
});

test("simple chart helpers: plain counts and one status pill per seat", () => {
  assert.equal(countText({ R: 1, D: 1, Other: 0, notListed: 0, total: 2 }), "Republican 1 · Democrat 1");
  assert.equal(countText({ R: 0, D: 0, Other: 0, notListed: 0, total: 0 }), "No counted committees");
  const base: Race = { id: "x", seat: "X", seats: 1, source_url: "https://a", filing_source_url: "https://b", candidates: [] };
  const c = (incumbent: boolean, party: string | null) => ({ name: "A", incumbent, party, party_source_url: "u", filing_source_url: "u" });
  assert.equal(seatPill(base), "None filed");
  assert.equal(seatPill({ ...base, members_known: true }), "Member not filed");
  assert.equal(seatPill({ ...base, candidates: [c(true, "D")] }), "Incumbent only");
  assert.equal(seatPill({ ...base, candidates: [c(false, "R")] }), "One filed");
  assert.equal(seatPill({ ...base, candidates: [c(true, "D"), c(false, "R")] }), "Contested");
  assert.equal(seatPill({ ...base, seats: 3, candidates: [c(false, null), c(false, null)] }), "One filed");
});

test("manual announcement overrides land on the matching counted candidate and do not change the filing label", () => {
  const raw = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../../tools/elections-2027/announcements.json"), "utf8")) as {
    candidates: { office: Office; race_id: string; name: string; announcement: { date: string; text: string; source_url: string; source_label: string } }[];
  };
  assert.ok(raw.candidates.length > 0);
  for (const item of raw.candidates) {
    const race = files[item.office].races.find((r) => r.id === item.race_id);
    assert.ok(race, item.race_id);
    const c = race!.candidates.find((x) => x.name === item.name);
    assert.ok(c, item.name);
    assert.equal(c!.filing_kind, "registration");
    assert.equal(c!.label, "Registered campaign committee, not yet on the ballot");
    assert.deepEqual(c!.announcement, item.announcement);
    assert.match(c!.announcement!.source_url, /^https:\/\//);
  }
  const watts = H(14).candidates.find((c) => c.name === "Vivian E. Watts");
  assert.ok(watts?.incumbent);
  assert.equal(watts!.announcement?.text, "Announced re-election Nov 20, 2026");
  assert.equal(watts!.announcement?.date, "2026-11-20");
  assert.equal(watts!.announcement?.source_url, "https://x.com/TylerEnglander/status/2123870156665536861");
});
