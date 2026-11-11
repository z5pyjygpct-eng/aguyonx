#!/usr/bin/env python3
"""Build src/lib/ga-visual-{ranks,committee,demographics}.json for the Visual Data page.

Official sources only:
  LIS public files https://lis.blob.core.windows.net/lisfiles/{20261,20262}/
    BILLS.CSV, HISTORY.CSV, Sponsors.csv, VOTE.CSV, Committees.csv
  Member rosters: src/lib/ga-members-2026-{house,senate}.json
  Floor roll-call JSON (same passage rule as scripts/build-ga-passage-votes.mjs):
    public/files/va-{house,senate}/votes/*.json
  Census ACS 2020-2024 5-year Summary File extracts in tools/ga-members/acs-2024-sld/
    (B19013, B15003; 2024 legislative-session geography)

Usage: python3 tools/ga-members/visual-sections.py [--cache DIR]
Does not print or write secrets. Does not touch emergency-log or mockups.
"""
from __future__ import annotations

import csv, json, os, re, sys
from collections import Counter, defaultdict
from datetime import date

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = sys.argv[sys.argv.index("--cache") + 1] if "--cache" in sys.argv else "/tmp/lis-members-cache"
SESS = {"20261": "2026 Regular Session", "20262": "2026 Special Session I"}
LIS = "https://lis.blob.core.windows.net/lisfiles"
ACS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "acs-2024-sld")

# ---- passage-vote action rule (identical to scripts/build-ga-passage-votes.mjs) ----
RE_PASS = re.compile(r"^(?:\([A-Z0-9]+\)\s*)?(?:Read third time and )?Passed (?:House|Senate)\b", re.I)
RE_DEFEAT = re.compile(r"^(?:Read third time and defeated by (?:House|Senate)|Defeated by Senate|Failed to pass House)\b", re.I)
RE_THIRD = re.compile(r"\(on 3rd reading\)", re.I)
RE_ADOPT = re.compile(r"^(?:VOTE: )?(?:Read third time and )?Agreed to by (?:House|Senate)$", re.I)
RESOLUTION = re.compile(r"^(?:HJ|HR|SJ|SR)\d")

def norm_action(a: str) -> str:
    return re.sub(r"\s+", " ", a).replace("\n", " ")
    # trailing tally stripped below

def strip_tally(a: str) -> str:
    return re.sub(r"\s*\(\s*(?:\d+-Y|Y-\d+)[^)]*\)?\s*$", "", a, flags=re.I).strip()

def kind(bill: dict) -> str | None:
    a = strip_tally(norm_action(bill.get("action") or ""))
    if RE_PASS.search(a):
        return "passage"
    if RE_DEFEAT.search(a):
        return "defeat"
    if RE_THIRD.search(a):
        return "thirdReading"
    if RE_ADOPT.search(a) and RESOLUTION.search(bill.get("bill") or ""):
        return "adoption"
    return None

# ---- names / honor ----
SUFFIX = {"jr", "sr", "ii", "iii", "iv"}
HONOR_TITLE = re.compile(r"^(Celebrating the life of|Commending)\b", re.I)

def strip_acc(s: str) -> str:
    import unicodedata
    s = unicodedata.normalize("NFKD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"\s+", " ", re.sub(r'[",.]', "", s.lower())).strip()

def person_key(name: str) -> str:
    t = [w for w in strip_acc(name).split(" ") if w not in SUFFIX]
    return f"{t[0]}|{t[-1]}" if t else ""

def mdy(x: str) -> str:
    if not x or not x.strip():
        return ""
    m, d, y = (int(v) for v in x.split("/"))
    return f"{y:04d}-{m:02d}-{d:02d}"

def lis_open(s: str, name: str):
    p = os.path.join(CACHE, f"{s}-{name}")
    if not os.path.exists(p):
        raise FileNotFoundError(f"Missing LIS cache {p}; run tools/ga-members/build.py first")
    return open(p, encoding="latin-1", newline="")

# ---- rosters ----
rosters = {}
party_of_id = {}
name_to_ids = defaultdict(list)
floor_calls = {}
generated = ""
for ch in ("house", "senate"):
    data = json.load(open(os.path.join(ROOT, f"src/lib/ga-members-2026-{ch}.json")))
    if data.get("generated", "") > generated:
        generated = data["generated"]
    rosters[ch] = data["members"]
    floor_calls[ch] = data.get("floorRollCalls", 0)
    for m in data["members"]:
        party_of_id[m["lisId"]] = m["party"]
        name_to_ids[person_key(m["name"])].append(m["lisId"])

# ---- VOTE.CSV: (session, voteId) -> {lisId: vote} ----
votes_by_id = {}
for s in SESS:
    for r in csv.reader(lis_open(s, "VOTE.CSV")):
        if r and (r[0].isdigit() or r[0].startswith("SV")):
            votes_by_id[(s, r[0])] = {r[i]: r[i + 1] for i in range(1, len(r) - 1, 2)}

# =====================================================================
# 1) Member ranks on final-passage roll calls
# =====================================================================
rank = {
    "generated": generated,
    "rule": "Final-passage / third-reading roll calls only; same action rule as scripts/build-ga-passage-votes.mjs.",
    "sources": [
        f"{LIS}/20261/",
        f"{LIS}/20262/",
        "https://lis.virginia.gov",
    ],
    "lean": {
        "available": False,
        "reason": "The Virginia Department of Elections publishes official results for statewide races (Governor 2025, President 2024) by locality and precinct, not as official totals by current House or Senate district. This page does not re-add precincts into districts, because some precincts split across lines and no official public by-district statewide table was found to cite. Legislative-race results by district are official, but those are the members' own contests, not a statewide-race lean, so they are not used here.",
        "sought": [
            "https://www.elections.virginia.gov/resultsreports/election-results/",
            "https://enr.elections.virginia.gov/results/public/virginia/2025-November-General",
            "https://enr.elections.virginia.gov/results/public/Virginia/elections/2024NovemberGeneral",
        ],
    },
    "chambers": {},
}

for ch in ("house", "senate"):
    members = {m["lisId"]: dict(
        slug=m["slug"], name=m["name"], lisId=m["lisId"], district=m["district"], party=m["party"],
        href=f"/dashboards/{'house' if ch=='house' else 'senate'}/members/{m['slug']}",
        Y=0, N=0, A=0, X=0, withChamber=0, chamberN=0, withPartySplit=0, splitN=0,
        listed=0,
    ) for m in rosters[ch]}
    counted = 0
    splits = 0
    unmatched = 0
    vdir = os.path.join(ROOT, f"public/files/va-{ch}/votes")
    seen = set()
    for fn in sorted(x for x in os.listdir(vdir) if x.endswith(".json")):
        j = json.load(open(os.path.join(vdir, fn)))
        for rc in j["rollCalls"]:
            if not rc.get("members") or not rc.get("bills"):
                continue
            sid, vid = str(rc["session"]), str(rc["voteId"])
            key = f"{sid}|{vid}"
            if key in seen:
                continue
            seen.add(key)
            if any(kind(b) is None for b in rc["bills"]):
                continue
            counted += 1
            # Official roll-call tallies (all names) for the chamber majority
            cy = len(rc["members"].get("Y") or [])
            cn = len(rc["members"].get("N") or [])
            chamber_maj = "Y" if cy > cn else "N" if cn > cy else None
            by_id = votes_by_id.get((sid, vid), {})
            # Party tallies among roster members who voted Y/N
            pty = {"R": Counter(), "D": Counter()}
            member_vote = {}  # lisId -> Y/N/A/X
            for vcode, names in rc["members"].items():
                k = vcode if vcode in "YNAX" else "X"
                for n in names:
                    mid = None
                    # prefer VOTE.CSV id match by scanning names... we match name -> lisId uniquely
                    ids = name_to_ids.get(person_key(n), [])
                    # if VOTE.CSV has exactly one of those ids on this roll call, use it
                    csv_hits = [i for i in ids if i in by_id]
                    if len(csv_hits) == 1:
                        mid = csv_hits[0]
                    elif len(ids) == 1:
                        mid = ids[0]
                    elif len(csv_hits) > 1:
                        mid = None
                    if mid and mid in members:
                        member_vote[mid] = k
                    else:
                        unmatched += 1
            for mid, k in member_vote.items():
                p = members[mid]["party"]
                if k in "YN":
                    pty[p][k] += 1
            def maj(p):
                t = pty[p]
                if t["Y"] > t["N"]:
                    return "Y"
                if t["N"] > t["Y"]:
                    return "N"
                return None
            mr, md = maj("R"), maj("D")
            is_split = bool(mr and md and mr != md)
            if is_split:
                splits += 1
            for mid, rec in members.items():
                k = member_vote.get(mid)
                if k is None:
                    # listed on roll call via VOTE.CSV even if name match failed?
                    if mid in by_id:
                        k = by_id[mid] if by_id[mid] in "YNAX" else "X"
                    else:
                        continue
                rec["listed"] += 1
                if k in rec:
                    rec[k] += 1
                if k in "YN" and chamber_maj:
                    rec["chamberN"] += 1
                    if k == chamber_maj:
                        rec["withChamber"] += 1
                if is_split and k in "YN":
                    pm = maj(rec["party"])
                    if pm:
                        rec["splitN"] += 1
                        if k == pm:
                            rec["withPartySplit"] += 1
    out_members = []
    for rec in sorted(members.values(), key=lambda x: (x["district"], x["name"])):
        out_members.append({
            "slug": rec["slug"], "name": rec["name"], "lisId": rec["lisId"],
            "district": rec["district"], "party": rec["party"], "href": rec["href"],
            "Y": rec["Y"], "N": rec["N"], "A": rec["A"], "X": rec["X"],
            "withChamber": rec["withChamber"], "chamberN": rec["chamberN"],
            "withPartySplit": rec["withPartySplit"], "splitN": rec["splitN"],
            "listed": rec["listed"],
            "partialTerm": rec["listed"] < int(0.85 * counted) if counted else False,
        })
    rank["chambers"][ch] = {
        "rollCallsCounted": counted,
        "partySplitRollCalls": splits,
        "floorRollCalls": floor_calls[ch],
        "unmatchedNameSlots": unmatched,
        "members": out_members,
    }

# =====================================================================
# 2) Bipartisan-patron bills that died in committee
# =====================================================================
# Committee-death actions: last decisive action is one of these, and the bill
# never passed the General Assembly (BILLS.CSV Passed != Y).
COMMITTEE_DEATH = [
    re.compile(r"^Left in (?:Committee )?(?P<c>.+)$", re.I),
    re.compile(r"^Continued to next session in (?P<c>.+?)(?:\s*\(.*\))?$", re.I),
    re.compile(r"^Tabled in (?P<c>.+?)(?:\s*\(.*\))?$", re.I),
    re.compile(r"^Laid on the table in (?P<c>.+?)(?:\s*\(.*\))?$", re.I),
    re.compile(r"^Passed by indefinitely in (?P<c>.+?)(?:\s*\(.*\))?$", re.I),
    re.compile(r"^Stricken from docket by (?P<c>.+?)(?:\s*\(.*\))?$", re.I),
    re.compile(r"^Stricken at request of Patron in (?P<c>.+?)(?:\s*\(.*\))?$", re.I),
    re.compile(r"^Failed to report \(defeated\) in (?P<c>.+?)(?:\s*\(.*\))?$", re.I),
]
NOT_A_COMMITTEE = {"house", "senate", "calendar", "the calendar", "docket"}
KIND_LABEL = {
    "left": "Left in committee",
    "continued": "Continued in committee",
    "tabled": "Tabled in committee",
    "pbi": "Passed by indefinitely in committee",
    "stricken_docket": "Stricken from the docket in committee",
    "stricken_patron": "Stricken at the patron's request in committee",
    "failed_report": "Failed to report from committee",
}

def death_kind(pattern_index: int) -> str:
    return ["left", "continued", "tabled", "tabled", "pbi", "stricken_docket", "stricken_patron", "failed_report"][pattern_index]

def normalize_committee(name: str) -> str:
    name = re.sub(r"\s+", " ", name).strip(" .")
    name = re.sub(r"^Committee\s+", "", name, flags=re.I)
    # common LIS punctuation drop: "Agriculture Chesapeake and Natural Resources"
    fixes = {
        "Agriculture Chesapeake and Natural Resources": "Agriculture, Chesapeake and Natural Resources",
    }
    return fixes.get(name, name)

def parse_committee_death(desc: str):
    """Return (kind, committee, chamber) or None if this history line is not a committee death."""
    desc = desc.strip()
    chamber = None
    rest = desc
    if desc[:2] in ("H ", "S "):
        chamber = "house" if desc[0] == "H" else "senate"
        rest = desc[2:].strip()
    rest = strip_tally(rest)
    rest = re.sub(r"\s*\(Voice Vote\)\s*$", "", rest).strip()
    for i, rx in enumerate(COMMITTEE_DEATH):
        m = rx.match(rest)
        if not m:
            continue
        c = normalize_committee(m.group("c"))
        if not c or c.lower() in NOT_A_COMMITTEE:
            return None
        return death_kind(i), c, chamber
    return None

# later floor/governor actions that mean the bill left committee (supersede a prior death if they come after)
LEFT_COMMITTEE = re.compile(
    r"Reported|Passed (?:House|Senate)|Defeated by|Failed to pass|Agreed to by (?:House|Senate)|"
    r"Approved by Governor|Vetoed by Governor|Acts of Assembly",
    re.I,
)

com_names = {}
with lis_open("20261", "Committees.csv") as f:
    for r in csv.DictReader(f):
        com_names[r["COM_COMNO"].strip()] = normalize_committee(r["COM_NAME"])

# history per bill
hist = defaultdict(list)
for s in SESS:
    for i, r in enumerate(csv.DictReader(lis_open(s, "HISTORY.CSV"))):
        hist[(s, r["Bill_id"])].append((i, mdy(r["History_date"]), r["History_description"].strip()))

def final_committee_death(s, bill):
    """If the last decisive action is a committee death, return that event."""
    last_death = None
    for i, dt, desc in hist.get((s, bill), []):
        death = parse_committee_death(desc)
        if death:
            last_death = (death[0], death[1], death[2], dt, desc)
            continue
        # a later report / floor passage / floor defeat / governor action supersedes
        body = desc[2:].strip() if desc[:2] in ("H ", "S ", "G ") else desc
        if last_death and LEFT_COMMITTEE.search(body):
            last_death = None
    return last_death

# bills metadata
bills_meta = {}
for s in SESS:
    for r in csv.DictReader(lis_open(s, "BILLS.CSV")):
        bills_meta[(s, r["Bill_id"].strip())] = dict(
            title=r["Bill_description"].strip(),
            patron_id=r["Patron_id"].strip(),
            patron_name=r["Patron_name"].strip(),
            passed=r.get("Passed", "").strip() == "Y",
            failed=r.get("Failed", "").strip() == "Y",
            carried=r.get("Carried_over", "").strip() == "Y",
            approved=r.get("Approved", "").strip() == "Y",
            vetoed=r.get("Vetoed", "").strip() == "Y",
        )

# sponsors
sponsors = defaultdict(list)  # (session, bill) -> list of {id, name, type}
for s in SESS:
    for r in csv.reader(lis_open(s, "Sponsors.csv")):
        if len(r) < 4 or r[0] == "MEMBER_NAME":
            continue
        name, mid, bill, typ = r[0].strip(), r[1].strip(), r[2].strip(), r[3].strip()
        sponsors[(s, bill)].append({"id": mid, "name": " ".join(name.split()), "type": typ})

committee_bills = []
for (s, bill), meta in bills_meta.items():
    if meta["passed"] or meta["approved"]:
        continue  # enacted or passed GA — not a committee death
    death = final_committee_death(s, bill)
    if not death:
        continue
    kind_, committee, ch_of, dt, desc = death
    pats = sponsors.get((s, bill), [])
    # if Sponsors.csv missed the chief, add from BILLS.CSV
    if meta["patron_id"] and not any(p["id"] == meta["patron_id"] for p in pats):
        pats = [{"id": meta["patron_id"], "name": meta["patron_name"], "type": "1 - Chief Patron"}] + pats
    r_ids, d_ids, unk = [], [], []
    for p in pats:
        party = party_of_id.get(p["id"])
        if party == "R":
            r_ids.append(p)
        elif party == "D":
            d_ids.append(p)
        else:
            unk.append(p)
    if not r_ids or not d_ids:
        continue  # not verifiably bipartisan
    chief = next((p for p in pats if "Chief Patron" in p["type"] and "Co-" not in p["type"]), pats[0] if pats else None)
    chief_party = party_of_id.get(chief["id"]) if chief else None
    committee_bills.append({
        "session": s,
        "sessionLabel": SESS[s],
        "bill": bill,
        "title": meta["title"],
        "href": f"https://lis.virginia.gov/bill-details/{s}/{bill}",
        "honor": bool(HONOR_TITLE.search(meta["title"])),
        "chiefName": chief["name"] if chief else meta["patron_name"],
        "chiefParty": chief_party if chief_party in ("R", "D") else None,
        "rPatrons": len(r_ids),
        "dPatrons": len(d_ids),
        "unmatchedPatrons": len(unk),
        "kind": kind_,
        "kindLabel": KIND_LABEL[kind_],
        "committee": committee,
        "committeeChamber": ch_of,
        "date": dt,
        "action": desc[2:].strip() if desc[:2] in ("H ", "S ", "G ") else desc,
        "carriedOver": meta["carried"],
    })

committee_bills.sort(key=lambda b: (b["session"], re.sub(r"\d", "", b["bill"]), int(re.sub(r"\D", "", b["bill"]) or 0)))

def count_rows(rows):
    return {
        "total": len(rows),
        "legis": sum(1 for b in rows if not b["honor"]),
        "honor": sum(1 for b in rows if b["honor"]),
    }

by_session = []
for s, label in SESS.items():
    rows = [b for b in committee_bills if b["session"] == s]
    by_session.append({"session": s, "label": label, **count_rows(rows)})

by_committee = []
key_rows = defaultdict(list)
for b in committee_bills:
    key_rows[(b["committeeChamber"] or "?", b["committee"])].append(b)
for (chc, name), rows in sorted(key_rows.items(), key=lambda kv: (-len(kv[1]), kv[0][0] or "", kv[0][1])):
    by_committee.append({"chamber": chc, "committee": name, **count_rows(rows)})

by_kind = []
for k, lab in KIND_LABEL.items():
    rows = [b for b in committee_bills if b["kind"] == k]
    if rows:
        by_kind.append({"kind": k, "label": lab, **count_rows(rows)})

committee = {
    "generated": generated,
    "sources": [f"{LIS}/{s}/{fn}" for s in SESS for fn in ("BILLS.CSV", "HISTORY.CSV", "Sponsors.csv")] + [
        f"{LIS}/20261/Committees.csv",
        "https://lis.virginia.gov",
    ],
    "definition": (
        "A bill died in committee if it never passed both chambers (LIS Passed is not Y) and its last "
        "decisive history action is one of: Left in committee; Continued to next session in committee; "
        "Tabled in committee; Laid on the table in committee; Passed by indefinitely in committee; "
        "Stricken from the docket in committee; Stricken at the patron's request in committee; or "
        "Failed to report (defeated) in committee. If the bill was later reported, passed or defeated "
        "on the floor, or acted on by the Governor, that earlier committee action does not count. "
        "Floor defeats, vetoes, and bills incorporated into another bill are not counted here. "
        "Bipartisan means at least one Republican and one Democrat appear as chief patron, chief "
        "co-patron, or co-patron in official LIS Sponsors.csv, with party taken from the chamber rosters. "
        "Patrons who cannot be matched to a roster party are not guessed."
    ),
    "bySession": by_session,
    "byCommittee": by_committee,
    "byKind": by_kind,
    "bills": committee_bills,
}

# =====================================================================
# 3) District demographics (ACS 2020-2024 5-year, 2024 legislative geography)
# =====================================================================
def load_acs(path):
    rows = {}
    with open(path, encoding="utf-8") as f:
        header = f.readline().strip().split("|")
        for line in f:
            parts = line.strip().split("|")
            rec = dict(zip(header, parts))
            rows[rec["GEO_ID"]] = rec
    return rows

inc = load_acs(os.path.join(ACS_DIR, "b19013-va-sld.dat"))
edu = load_acs(os.path.join(ACS_DIR, "b15003-va-sld.dat"))

def geo_key(prefix, district: int) -> str:
    return f"{prefix}{district:03d}"

def num(x):
    try:
        if x in ("", ".", None, "-"):
            return None
        return int(x)
    except ValueError:
        try:
            return float(x)
        except ValueError:
            return None

def district_demo(prefix, n):
    gid = geo_key(prefix, n)
    i, e = inc.get(gid), edu.get(gid)
    if not i or not e:
        return None
    pop = num(e.get("B15003_E001"))
    bachelors = 0
    b_moe_sq = 0
    for c in ("022", "023", "024", "025"):
        v = num(e.get(f"B15003_E{c}")) or 0
        m = num(e.get(f"B15003_M{c}")) or 0
        bachelors += v
        b_moe_sq += m * m
    pop_moe = num(e.get("B15003_M001")) or 0
    share = (bachelors / pop) if pop else None
    # ACS approximation for a proportion's MOE (90% CI), when both numerator and denominator have MOEs
    share_moe = None
    if share is not None and pop:
        share_moe = (1 / pop) * (b_moe_sq + (share * share) * (pop_moe * pop_moe)) ** 0.5
    return {
        "medianIncome": num(i.get("B19013_E001")),
        "medianIncomeMoe": num(i.get("B19013_M001")),
        "medianIncomeTopcoded": (num(i.get("B19013_E001")) or 0) >= 250000,
        "pop25": pop,
        "pop25Moe": pop_moe,
        "bachelors": bachelors,
        "bachelorsShare": round(share, 6) if share is not None else None,
        "bachelorsShareMoe": round(share_moe, 6) if share_moe is not None else None,
        "geoId": gid,
    }

house_d, senate_d, missing = {}, {}, []
for n in range(1, 101):
    rec = district_demo("620L900US51", n)
    if rec:
        house_d[str(n)] = rec
    else:
        missing.append(f"house-{n}")
for n in range(1, 41):
    rec = district_demo("610U900US51", n)
    if rec:
        senate_d[str(n)] = rec
    else:
        missing.append(f"senate-{n}")

demographics = {
    "generated": date.today().isoformat(),
    "survey": "U.S. Census Bureau, 2020–2024 American Community Survey 5-year estimates",
    "geography": "2024 Legislative Session Year (current Virginia House and Senate maps, first used in the November 2023 elections and the 2024 session)",
    "geographyNote": "The 2019–2023 ACS 5-year estimates use 2022 legislative-session geography, which is the previous Virginia map. Those figures are not used here.",
    "urban": {
        "available": False,
        "reason": "The 2020–2024 ACS 5-year detailed tables published for state legislative districts do not include an official urban/rural population split. The 2020 Census urban/rural tables use earlier legislative-district lines, so they are not matched to the current map on this page.",
    },
    "sources": [
        "https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b19013.dat",
        "https://www2.census.gov/programs-surveys/acs/summary_file/2024/table-based-SF/data/5YRData/acsdt5y2024-b15003.dat",
        "https://www.census.gov/programs-surveys/acs/geography-acs/geography-boundaries-by-year/2024.html",
        "https://www.census.gov/programs-surveys/acs/data/summary-file/2024.html",
        "https://data.census.gov",
    ],
    "tables": {
        "income": "B19013 Median household income in the past 12 months (in 2024 inflation-adjusted dollars)",
        "education": "B15003 Educational attainment for the population 25 years and over; bachelor's or higher is the sum of bachelor's, master's, professional, and doctorate estimates",
    },
    "house": house_d,
    "senate": senate_d,
    "missing": missing,
}

# ---- write ----
def dump(name, obj):
    path = os.path.join(ROOT, "src/lib", name)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, separators=(",", ":"))
        f.write("\n")
    print(name, os.path.getsize(path), "bytes")

dump("ga-visual-ranks.json", rank)
dump("ga-visual-committee.json", committee)
dump("ga-visual-demographics.json", demographics)

# brief stdout summary (no secrets)
print("ranks house", len(rank["chambers"]["house"]["members"]), "passage", rank["chambers"]["house"]["rollCallsCounted"], "splits", rank["chambers"]["house"]["partySplitRollCalls"])
print("ranks senate", len(rank["chambers"]["senate"]["members"]), "passage", rank["chambers"]["senate"]["rollCallsCounted"], "splits", rank["chambers"]["senate"]["partySplitRollCalls"])
print("committee bills", len(committee_bills), "legis", sum(1 for b in committee_bills if not b["honor"]), "honor", sum(1 for b in committee_bills if b["honor"]))
print("demographics house", len(house_d), "senate", len(senate_d), "missing", missing)
