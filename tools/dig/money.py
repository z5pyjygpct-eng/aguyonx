"""Itemized campaign contributions (Schedule A) per General Assembly member, from the
Virginia Department of Elections campaign finance bulk files
(https://apps.elections.virginia.gov/SBE_CSV/CF/{YYYY_MM}/Report.csv + ScheduleA.csv),
as saved under /workspace/research/elect_hist/ (already filtered to General Assembly
candidate committees). No VPAP. Output: tools/dig/.money.json (intermediate, not committed).

Committee match rule (deterministic, no hand edits):
  1. A committee code matches a member when one of its reports in an election cycle of
     2023 or later lists the member's chamber and district number in District/OfficeSought
     AND the member's last name appears in CandidateName.
  2. Other codes whose CandidateName (normalized) equals a matched CandidateName are added
     (the same candidate's earlier committee).
Report de-duplication: "Large Contribution Report" filings are skipped (those gifts are
re-itemized in the next scheduled report). Scheduled reports are keyed by committee +
period start + period end; only the most recently submitted version (latest amendment) counts.
"""
import csv, glob, json, re, sys, collections, os
csv.field_size_limit(10**9)
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = "/workspace/research/elect_hist"

def norm(s): return re.sub(r"\s+", " ", re.sub(r"[^a-z ]", " ", s.lower())).strip()
SUFFIX = {"jr", "sr", "ii", "iii", "iv", "mr", "mrs", "ms", "dr"}
def last_name(name):
    t = [w for w in norm(name.split('"')[-1] if name.count('"') == 2 else name).split() if w not in SUFFIX]
    return t[-1] if t else ""

members = []
for ch in ("house", "senate"):
    d = json.load(open(f"{ROOT}/src/lib/ga-members-2026-{ch}.json"))
    for m in d["members"]: members.append({"slug": m["slug"], "name": m["name"], "chamber": ch, "district": m["district"]})

reports = {}  # ReportId -> row
for p in sorted(glob.glob(f"{SRC}/20*/Report.csv")):
    month = p.split("/")[-2]
    for r in csv.DictReader(open(p, encoding="latin-1", newline="")):
        r = {k.lstrip("\ufeff").lstrip("ï»¿"): v for k, v in r.items()}
        r["Month"] = month
        reports[r["ReportId"]] = r
months = sorted({r["Month"] for r in reports.values()})

def dist_match(r, ch, n):
    t = (r.get("District", "") + " " + r.get("OfficeSought", "")).lower()
    want = "house" if ch == "house" else "senate"
    if want == "house" and not ("house" in t or "delegate" in t): return False
    if want == "senate" and "senat" not in t: return False
    return re.search(rf"\b{n}(st|nd|rd|th)?\b", t) is not None

out = {"months": months, "source": "https://apps.elections.virginia.gov/SBE_CSV/CF/", "members": {}}
by_code = collections.defaultdict(list)
for r in reports.values(): by_code[r["CommitteeCode"]].append(r)
for m in members:
    ln = last_name(m["name"])
    codes, cands = set(), set()
    for code, rs in by_code.items():
        for r in rs:
            cyc = r.get("ElectionCycle", "")[-4:]
            if cyc.isdigit() and int(cyc) >= 2023 and ln and ln in norm(r["CandidateName"]).split() and dist_match(r, m["chamber"], m["district"]):
                codes.add(code); cands.add(norm(r["CandidateName"]))
    for code, rs in by_code.items():
        if any(norm(r["CandidateName"]) in cands for r in rs): codes.add(code)
    out["members"][m["slug"]] = {"codes": sorted(codes)}

# keep latest version of each scheduled report
latest = {}
for r in reports.values():
    if r["FilingType"] != "Report": continue
    k = (r["CommitteeCode"], r["StartDate"][:10], r["EndDate"][:10])
    cur = latest.get(k)
    if cur is None or (r["SubmittedDate"], int(r["ReportId"])) > (cur["SubmittedDate"], int(cur["ReportId"])): latest[k] = r
keep = {r["ReportId"]: r for r in latest.values()}

contribs = collections.defaultdict(list)  # code -> rows
for p in sorted(glob.glob(f"{SRC}/20*/ScheduleA.csv")):
    for a in csv.DictReader(open(p, encoding="latin-1", newline="")):
        a = {k.lstrip("\ufeff").lstrip("ï»¿"): v for k, v in a.items()}
        r = keep.get(a["ReportId"])
        if not r: continue
        contribs[r["CommitteeCode"]].append((a, r))

for slug, e in out["members"].items():
    rows, seen = [], set()
    for code in e["codes"]:
        for a, r in contribs.get(code, []):
            if a["ScheduleAId"] in seen: continue
            seen.add(a["ScheduleAId"])
            try: amt = round(float(a["Amount"]), 2)
            except ValueError: continue
            ind = a["IsIndividual"].lower() == "true"
            name = (" ".join(x for x in [a["FirstName"], a["LastOrCompanyName"]] if x.strip()) if ind else a["LastOrCompanyName"]).strip()
            d = a["TransactionDate"]  # MM/DD/YYYY
            y = d[-4:] if len(d) >= 4 else r["ReportYear"]
            rows.append({"name": re.sub(r"\s+", " ", name), "ind": ind, "city": a["City"].strip().title(), "st": a["StateCode"].strip(), "amt": amt, "y": y, "rid": r["ReportId"], "code": code, "cand": r["CandidateName"], "cname": r["CommitteeName"]})
    e["rows"] = rows
    e["reports"] = sorted({(r["ReportId"], r["CommitteeCode"], r["CommitteeName"], r["StartDate"][:10], r["EndDate"][:10], r["Month"]) for code in e["codes"] for r in keep.values() if r["CommitteeCode"] == code})
json.dump(out, open(f"{ROOT}/tools/dig/.money.json", "w"))
miss = [s for s, e in out["members"].items() if not e["codes"]]
print("members", len(out["members"]), "no committee match", len(miss), miss[:40])
for s in ("dan-i-helmer", "l-louise-lucas"): e = out["members"][s]; print(s, e["codes"], len(e["rows"]), round(sum(x["amt"] for x in e["rows"])), len(e["reports"]))
multi = {s: e["codes"] for s, e in out["members"].items() if len(e["codes"]) > 2}; print("multi", multi)
