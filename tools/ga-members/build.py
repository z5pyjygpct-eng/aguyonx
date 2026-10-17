#!/usr/bin/env python3
"""Build src/lib/ga-members-2026.json — per-member 2026 profiles for the v4 GA members pages.

Sources (official, public; LIS API key not used):
  LIS public data files https://lis.blob.core.windows.net/lisfiles/{20261,20262}/
    BILLS.CSV (chief patron = Patron_id, outcome flags), HISTORY.CSV (actions, floor roll-call refs),
    VOTE.CSV (per-member roll calls), Sponsors.csv (chief/co-patron), Committees.csv,
    CommitteeMembers.csv, CIBillSubjects.csv (LIS subjects; LIS publishes only a partial list)
  Roster (name/district/party): data/va-house/delegates-lis.json, data/va-senate/senators-lis.json
    (read only; routine-owned, from house.vga.virginia.gov / apps.senate.virginia.gov)
Floor votes only: House = numeric History_refid with "H " history line; Senate = SV#### with "S " line.
Usage: python3 tools/ga-members/build.py [--cache DIR]
"""
import csv, json, re, os, sys, urllib.request, collections, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CACHE = sys.argv[sys.argv.index("--cache") + 1] if "--cache" in sys.argv else "/tmp/lis-members-cache"
SESS = {"20261": "2026 Regular Session", "20262": "2026 Special Session I"}
BASE = "https://lis.blob.core.windows.net/lisfiles"
os.makedirs(CACHE, exist_ok=True)

def lis(s, name):
    p = os.path.join(CACHE, f"{s}-{name}")
    if not os.path.exists(p): urllib.request.urlretrieve(f"{BASE}/{s}/{name}", p)
    return open(p, encoding="latin-1", newline="")

def mdy(x):
    m, d, y = (int(v) for v in x.split("/")); return f"{y:04d}-{m:02d}-{d:02d}"

def slugify(n):
    n = re.sub(r'"[^"]*"', " ", n).replace("&quot;", " ")
    return re.sub(r"[^a-z0-9]+", "-", n.lower()).strip("-")

# ---- roster ----
roster = {"house": json.load(open(os.path.join(ROOT, "data/va-house/delegates-lis.json"))),
          "senate": json.load(open(os.path.join(ROOT, "data/va-senate/senators-lis.json")))}

# ---- committees ----
com_name, com_mem = {}, collections.defaultdict(list)
for r in csv.DictReader(lis("20261", "Committees.csv")): com_name[r["COM_COMNO"].strip()] = " ".join(r["COM_NAME"].split())
for r in csv.DictReader(lis("20261", "CommitteeMembers.csv")):
    c = r["CMB_COMNO"].strip()
    if c in com_name: com_mem[r["CMB_MBRNO"].strip()].append(com_name[c])

# ---- subjects (partial in LIS) ----
subjects = collections.defaultdict(list)
for s in SESS:
    for r in csv.DictReader(lis(s, "CIBillSubjects.csv")):
        if "Bill_Number" in r: subjects[(s, r["Bill_Number"].strip())].append(r["Subject_Name"].strip())

# ---- history ----
hist = collections.defaultdict(list)
for s in SESS:
    for r in csv.DictReader(lis(s, "HISTORY.CSV")): hist[(s, r["Bill_id"])].append(r)

DISP = re.compile(r"Left in|Continued to 20\d\d|Laid on the table|[Tt]abled|Stricken|Incorporated|Passed by indefinitely|"
                  r"Failed|[Dd]efeated|Rejected|Vetoed|Approved by Governor|Acts of Assembly Chapter|Agreed to|Signed by President|"
                  r"Governor's Action Deadline|Enrolled|passed (?:House|Senate)|Reported")
TABLED = re.compile(r"Left in|Continued to 20\d\d|Laid on the table|[Tt]abled")

def final_action(s, b):
    rows = hist.get((s, b), [])
    pick = [r for r in rows if DISP.search(r["History_description"])] or rows
    if not pick: return "", ""
    r = pick[-1]; return r["History_description"].strip(), mdy(r["History_date"])

bills_by_patron = collections.defaultdict(list)
for s in SESS:
    for r in csv.DictReader(lis(s, "BILLS.CSV")):
        pid, b = r["Patron_id"].strip(), r["Bill_id"].strip()
        Y = lambda k: r.get(k, "").strip() == "Y"
        act, date = final_action(s, b)
        if Y("Passed"):
            outcome = "vetoed" if Y("Vetoed") else "signed" if Y("Approved") else "passed"
        elif Y("Carried_over") or TABLED.search(act):
            outcome = "tabled"
        else:
            outcome = "failed"
        status = act[2:] if act[:2] in ("H ", "S ", "G ") else act
        if Y("Approved"): status = "Approved by Governor (Acts of Assembly)"
        elif Y("Vetoed"): status = "Vetoed by Governor"
        elif Y("Passed") and re.match(r"[HS][JR]", b): status = "Passed (resolution; no governor action)"
        elif Y("Passed"): status = "Passed General Assembly"
        elif Y("Carried_over"): status = "Continued to 2027"
        bills_by_patron[pid].append(dict(session=s, bill=b, title=r["Bill_description"].strip(), outcome=outcome,
            status=status, statusDate=date, subjects=subjects.get((s, b), []), href=f"https://lis.virginia.gov/bill-details/{s}/{b}"))

copat = collections.Counter()
for s in SESS:
    for r in csv.reader(lis(s, "Sponsors.csv")):
        if len(r) < 4 or r[0] == "MEMBER_NAME": continue
        if "Co-Patron" in r[3] and "Chief Co" not in r[3] or "Chief Co-Patron" in r[3]: copat[(r[1].strip(), s)] += 1

# ---- floor roll calls ----
titles = {}
for s in SESS:
    for r in csv.DictReader(lis(s, "BILLS.CSV")): titles[(s, r["Bill_id"])] = r["Bill_description"].strip()
def is_floor(ch, ref, desc):
    return (ch == "house" and ref.isdigit() and desc.startswith("H ")) or (ch == "senate" and ref.startswith("SV") and ref[2:].isdigit() and desc.startswith("S "))
votes = {}
for s in SESS:
    for r in csv.reader(lis(s, "VOTE.CSV")):
        if r and (r[0].isdigit() or r[0].startswith("SV")): votes[(s, r[0])] = {r[i]: r[i + 1] for i in range(1, len(r) - 1, 2)}
rollcalls = {"house": {}, "senate": {}}
for s in SESS:
    for b, rows in hist.items():
        if b[0] != s: continue
        for r in rows:
            ref, desc = r["History_refid"], r["History_description"]
            for ch in ("house", "senate"):
                if is_floor(ch, ref, desc) and (s, ref) in votes:
                    rc = rollcalls[ch].setdefault((s, ref), dict(session=s, ref=ref, date=mdy(r["History_date"]), bills=[]))
                    if all(x["bill"] != b[1] for x in rc["bills"]):
                        rc["bills"].append(dict(bill=b[1], title=titles.get((s, b[1]), ""), action=desc[2:].strip(),
                            voteHref=f"https://lis.virginia.gov/vote-details/{b[1]}/{s}/{ref}"))
for ch in rollcalls:  # 20261 HISTORY also logs Special Session I actions with 20262 vote numbers: keep 20262 copy
    for (s, ref) in list(rollcalls[ch]):
        if s == "20261" and ("20262", ref) in rollcalls[ch] and rollcalls[ch][("20262", ref)]["date"] == rollcalls[ch][(s, ref)]["date"]:
            del rollcalls[ch][(s, ref)]

def party_majority(ch, rc_key, party_of):
    tally = {"D": collections.Counter(), "R": collections.Counter()}
    for mid, v in votes[rc_key].items():
        p = party_of.get(mid)
        if p in tally and v in "YN": tally[p][v] += 1
    out = {}
    for p, t in tally.items():
        if t["Y"] != t["N"] and (t["Y"] or t["N"]): out[p] = "Y" if t["Y"] > t["N"] else "N"
    return out

out = {"generated": datetime.date.today().isoformat(), "sources": [f"{BASE}/{s}/" for s in SESS], "house": [], "senate": []}
for ch, members in roster.items():
    party_of = {m["lisId"]: m["party"] for m in members}
    maj = {k: party_majority(ch, k, party_of) for k in rollcalls[ch]}
    for m in sorted(members, key=lambda x: x["district"]):
        mid = m["lisId"]
        tot = collections.Counter(); withp = against = 0; recent = []
        for k, rc in rollcalls[ch].items():
            v = votes[k].get(mid)
            if v is None: continue
            tot[v] += 1
            pm = maj[k].get(m["party"])
            if pm and v in "YN": withp += v == pm; against += v != pm
            recent.append((rc["date"], rc["session"], int(re.sub(r"\D", "", rc["ref"])), v, rc))
        recent.sort(key=lambda x: (x[0], x[1], x[2]), reverse=True)
        bills = sorted(bills_by_patron.get(mid, []), key=lambda b: (b["session"], re.sub(r"\d", "", b["bill"]), int(re.sub(r"\D", "", b["bill"]) or 0)))
        def counts(bs):
            c = collections.Counter(b["outcome"] for b in bs)
            return dict(total=len(bs), passed=c["passed"] + c["signed"] + c["vetoed"], signed=c["signed"], vetoed=c["vetoed"],
                        passedNoGovAction=c["passed"], failed=c["failed"], tabled=c["tabled"])
        subj = collections.Counter(x for b in bills for x in b["subjects"])
        out[ch].append(dict(
            slug=slugify(m["name"]), name=m["name"], district=m["district"], party=m["party"], lisId=mid,
            chamber=ch, committees=sorted(set(com_mem.get(mid, []))),
            bills=bills, billCounts={s: counts([b for b in bills if b["session"] == s]) for s in SESS},
            coPatronCounts={s: copat[(mid, s)] for s in SESS},
            subjectCounts=subj.most_common(), subjectBills=sum(1 for b in bills if b["subjects"]),
            votes=dict(total=sum(tot.values()), yea=tot["Y"], nay=tot["N"], abstain=tot["A"], notVoting=tot["X"],
                       withParty=withp, againstParty=against),
            recentVotes=[dict(date=d, session=s, vote=v, bills=rc["bills"][:3], moreBills=max(0, len(rc["bills"]) - 3)) for d, s, _, v, rc in recent[:12]],
        ))
    slugs = [x["slug"] for x in out[ch]]; assert len(slugs) == len(set(slugs)), ch
    out[f"{ch}FloorRollCalls"] = len(rollcalls[ch])
for ch in ("house", "senate"):
    dst = os.path.join(ROOT, f"src/lib/ga-members-2026-{ch}.json")
    json.dump(dict(generated=out["generated"], sources=out["sources"], floorRollCalls=out[f"{ch}FloorRollCalls"], members=out[ch]),
              open(dst, "w"), separators=(",", ":"))
    print(ch, len(out[ch]), "rollcalls", out[f"{ch}FloorRollCalls"], os.path.getsize(dst))
idx = {ch: {str(m["district"]): m["slug"] for m in out[ch]} for ch in ("house", "senate")}
idx["house"]["20"] = "district-20-vacant"
json.dump(idx, open(os.path.join(ROOT, "src/lib/ga-members-2026-index.json"), "w"), separators=(",", ":"))
