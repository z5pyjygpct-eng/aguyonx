// Builds src/lib/ga-party-passage.json: party tallies on FINAL-PASSAGE / THIRD-READING floor roll calls only.
// Input (already in the repo): public/files/va-{house,senate}/votes/*.json (LIS HISTORY.CSV + VOTE.CSV) and the member rosters
// src/lib/ga-members-2026-{house,senate}.json (party). Deterministic: re-run with `node scripts/build-ga-passage-votes.mjs`.
//
// MATCHING RULE (applied to each bill entry's LIS `action` text, after collapsing whitespace and dropping the trailing "(nn-Y nn-N nn-A)" tally):
//   1. passage      ^(optional "(S1234) ")(Read third time and )?Passed (House|Senate)   -> passed, with substitute, with amendment(s), Block Vote variants
//   2. defeat       ^Read third time and defeated by (House|Senate) | ^Defeated by Senate | ^Failed to pass House
//   3. 3rd reading  contains "(on 3rd reading)"  (Senate: "Constitutional reading dispensed ... (on 3rd reading)", "Reading waived (on 3rd reading)")
//   4. adoption     ^(VOTE: )?(Read third time and )?Agreed to by (House|Senate)$  AND every bill is a resolution (HJ/HR/SJ/SR)
// A roll call counts only if EVERY bill entry in it matches one of the four. Everything else is excluded: 1st/2nd reading, amendments,
// substitutes agreed/rejected, conference reports, concurrence in Governor's recommendations, reconsiderations, motions, "Passed in enrolled form", "Passed by".
// Defeat votes are included on purpose so that only-successful votes do not bias the Yea share.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const SUFFIX = new Set(["jr", "sr", "ii", "iii", "iv"]);
const strip = (s) => s.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[",.]/g, "").replace(/\s+/g, " ").trim();
function personKey(name) {
  const t = strip(name).split(" ").filter((w) => !SUFFIX.has(w));
  return t.length ? `${t[0]}|${t[t.length - 1]}` : "";
}

const roster = { house: new Map(), senate: new Map() };
const parties = new Map(); // personKey -> Set(party), across both chambers (a person keeps their party if they changed chambers)
for (const ch of ["house", "senate"]) {
  const d = JSON.parse(fs.readFileSync(path.join(ROOT, `src/lib/ga-members-2026-${ch}.json`), "utf8"));
  for (const m of d.members) {
    const k = personKey(m.name);
    (parties.get(k) ?? parties.set(k, new Set()).get(k)).add(m.party);
  }
}
const partyOf = (name) => { const s = parties.get(personKey(name)); return s && s.size === 1 ? [...s][0] : null; };

const norm = (a) => a.replace(/\s+/g, " ").replace(/\s*\(\s*(?:\d+-Y|Y-\d+)[^)]*\)?\s*$/i, "").trim();
const RE_PASS = /^(?:\([A-Z0-9]+\)\s*)?(?:Read third time and )?Passed (?:House|Senate)\b/i;
const RE_DEFEAT = /^(?:Read third time and defeated by (?:House|Senate)|Defeated by Senate|Failed to pass House)\b/i;
const RE_THIRD = /\(on 3rd reading\)/i;
const RE_ADOPT = /^(?:VOTE: )?(?:Read third time and )?Agreed to by (?:House|Senate)$/i;
const RESOLUTION = /^(?:HJ|HR|SJ|SR)\d/;
function kind(bill) {
  const a = norm(bill.action ?? "");
  if (RE_PASS.test(a)) return "passage";
  if (RE_DEFEAT.test(a)) return "defeat";
  if (RE_THIRD.test(a)) return "thirdReading";
  if (RE_ADOPT.test(a) && RESOLUTION.test(bill.bill ?? "")) return "adoption";
  return null;
}

const out = { rule: "see scripts/build-ga-passage-votes.mjs", generated: null, chambers: {} };
let newest = "";
for (const ch of ["house", "senate"]) {
  const dir = path.join(ROOT, `public/files/va-${ch}/votes`);
  const seen = new Set();
  const agg = {
    rollCallsWithMembers: 0, rollCallsCounted: 0, byKind: { passage: 0, defeat: 0, thirdReading: 0, adoption: 0 },
    party: { R: { Y: 0, N: 0, A: 0, X: 0, withMajority: 0, yeaNay: 0 }, D: { Y: 0, N: 0, A: 0, X: 0, withMajority: 0, yeaNay: 0 } },
    unmatchedMemberVotes: 0, matchedMemberVotes: 0, unmatchedNames: {},
    agreement: { unanimous: 0, sameSide: 0, opposite: 0, noMajority: 0 },
  };
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".json")).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    if (j.generated && j.generated > newest) newest = j.generated;
    for (const rc of j.rollCalls) {
      if (!rc.members || !rc.bills?.length) continue;
      const id = `${rc.session}|${rc.voteId}`;
      if (seen.has(id)) continue; // same roll call listed twice
      seen.add(id);
      agg.rollCallsWithMembers++;
      const kinds = rc.bills.map(kind);
      if (kinds.some((k) => !k)) continue;
      agg.rollCallsCounted++;
      agg.byKind[kinds[0]]++;
      const t = { R: { Y: 0, N: 0, A: 0, X: 0 }, D: { Y: 0, N: 0, A: 0, X: 0 } };
      for (const [v, names] of Object.entries(rc.members)) {
        const k = "YNAX".includes(v) ? v : "X";
        for (const n of names) {
          const p = partyOf(n);
          if (!p) { agg.unmatchedMemberVotes++; agg.unmatchedNames[n] = (agg.unmatchedNames[n] ?? 0) + 1; continue; }
          agg.matchedMemberVotes++;
          t[p][k]++; agg.party[p][k]++;
        }
      }
      const maj = (p) => (t[p].Y > t[p].N ? "Y" : t[p].N > t[p].Y ? "N" : null);
      for (const p of ["R", "D"]) {
        const m = maj(p);
        if (m) { agg.party[p].withMajority += t[p][m]; agg.party[p].yeaNay += t[p].Y + t[p].N; }
        else agg.party[p].yeaNay += 0;
      }
      const anyDissent = t.R.Y + t.D.Y > 0 && t.R.N + t.D.N > 0;
      const mr = maj("R"), md = maj("D");
      if (!anyDissent) agg.agreement.unanimous++;
      else if (!mr || !md) agg.agreement.noMajority++;
      else if (mr === md) agg.agreement.sameSide++;
      else agg.agreement.opposite++;
    }
  }
  agg.unmatchedMembers = Object.keys(agg.unmatchedNames).length; // names are not kept: this page names no individuals
  delete agg.unmatchedNames;
  out.chambers[ch] = agg;
}
out.generated = newest;
fs.writeFileSync(path.join(ROOT, "src/lib/ga-party-passage.json"), JSON.stringify(out, null, 1) + "\n");
console.log(JSON.stringify(out, null, 1));
