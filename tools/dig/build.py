"""Builds public/files/dig/*.json for the "Do your own digging" page (/dig).

Inputs (all already on aguyonx.com or in the research money folder):
  src/lib/ga-members-2026-{house,senate}.json   LIS 2026 member rosters, bills, vote summaries
  src/lib/ga-party-categories.json              aguyonx categories per 2026 bill (official LIS subject where one exists)
  public/files/va-{house,senate}/votes/*.json   LIS HISTORY.CSV + VOTE.CSV floor roll calls
  src/content/virginia-2027-bills.json          LIS 2027 tracker
  tools/dig/.content.json                       dump of src/content (Loudoun meetings, recaps, transcripts, news) via tools/dig/dump.mjs
  tools/dig/.money.json                         Virginia Department of Elections Schedule A via tools/dig/money.py
Run: node tools/dig/dump.mjs && python3 tools/dig/money.py && python3 tools/dig/build.py
"""
import json, os, re, glob, collections, datetime
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = f"{ROOT}/public/files/dig"
os.makedirs(f"{OUT}/leg", exist_ok=True)
os.makedirs(f"{OUT}/money", exist_ok=True)
J = lambda p: json.load(open(f"{ROOT}/{p}"))
def dump(p, o): json.dump(o, open(f"{OUT}/{p}", "w"), separators=(",", ":"), ensure_ascii=False)

content = J("tools/dig/.content.json")
money = J("tools/dig/.money.json")
cats = J("src/lib/ga-party-categories.json")["bills"]
tracker = J("src/content/virginia-2027-bills.json")
tax = {t["id"]: t["label"] for t in tracker["taxonomy"]}

def iso(label):
    m = re.search(r"([A-Z][a-z]{2})[a-z]*\.? (\d{1,2}), (\d{4})", label)
    if not m: return None
    return datetime.datetime.strptime(f"{m[1]} {m[2]} {m[3]}", "%b %d %Y").date().isoformat()

# ---------- roll calls (final passage / third reading only; same rule as scripts/build-ga-passage-votes.mjs) ----------
def norm_action(a): return re.sub(r"\s*\(\s*(?:\d+-Y|Y-\d+)[^)]*\)?\s*$", "", re.sub(r"\s+", " ", a), flags=re.I).strip()
RE_PASS = re.compile(r"^(?:\([A-Z0-9]+\)\s*)?(?:Read third time and )?Passed (?:House|Senate)\b", re.I)
RE_DEFEAT = re.compile(r"^(?:Read third time and defeated by (?:House|Senate)|Defeated by Senate|Failed to pass House)\b", re.I)
RE_THIRD = re.compile(r"\(on 3rd reading\)", re.I)
RE_ADOPT = re.compile(r"^(?:VOTE: )?(?:Read third time and )?Agreed to by (?:House|Senate)$", re.I)
def kind(b):
    a = norm_action(b.get("action", ""))
    if RE_PASS.search(a): return "passage"
    if RE_DEFEAT.search(a): return "defeat"
    if RE_THIRD.search(a): return "thirdReading"
    if RE_ADOPT.search(a) and re.match(r"^(?:HJ|HR|SJ|SR)\d", b.get("bill", "")): return "adoption"
    return None

SUF = {"jr", "sr", "ii", "iii", "iv"}
def pkey(n):
    t = [w for w in re.sub(r"\s+", " ", re.sub(r"[\",.]", "", n.lower())).split() if w not in SUF]
    return f"{t[0]}|{t[-1]}" if t else ""

members, meta = {}, {}
for ch in ("house", "senate"):
    d = J(f"src/lib/ga-members-2026-{ch}.json")
    meta[ch] = {"generated": d["generated"], "floorRollCalls": d["floorRollCalls"]}
    for m in d["members"]: members[m["slug"]] = m

rc_index = {}
for ch in ("house", "senate"):
    roster = [m for m in members.values() if m["chamber"] == ch]
    by_name = {m["name"]: m["slug"] for m in roster}
    by_key = collections.defaultdict(list)
    for m in roster: by_key[pkey(m["name"])].append(m["slug"])
    rcs, votes, seen = [], collections.defaultdict(dict), set()
    for f in sorted(glob.glob(f"{ROOT}/public/files/va-{ch}/votes/*.json")):
        j = json.load(open(f))
        for rc in j["rollCalls"]:
            if not rc.get("members") or not rc.get("bills"): continue
            rid = f"{rc['session']}|{rc['voteId']}"
            if rid in seen: continue
            seen.add(rid)
            ks = [kind(b) for b in rc["bills"]]
            if not all(ks): continue
            cs = sorted({c for b in rc["bills"] for c in cats.get(f"{rc['session']}|{b['bill']}", [[], ""])[0]})
            tally = re.search(r"\((\d+)-Y (\d+)-N (\d+)-A\)", rc["bills"][0].get("action", ""))
            idx = len(rcs)
            rcs.append({"d": j["date"], "s": rc["session"], "k": ks[0][0], "b": [b["bill"] for b in rc["bills"]][:6], "nb": len(rc["bills"]),
                        "t": rc["bills"][0]["title"], "h": rc["bills"][0]["voteHref"], "c": cs, "ty": tally[0] if tally else None})
            for v, names in rc["members"].items():
                for n in names:
                    s = by_name.get(n) or (by_key[pkey(n)][0] if len(by_key[pkey(n)]) == 1 else None)
                    if s: votes[s][idx] = v if v in "YNA" else "X"
    rc_index[ch] = (rcs, votes)
    dump(f"rc-{ch}.json", {"chamber": ch, "source": "Legislative Information System (LIS) HISTORY.CSV + VOTE.CSV, https://lis.blob.core.windows.net/lisfiles/", "rule": "Final-passage, defeat, third-reading and resolution-adoption floor roll calls only (scripts/build-ga-passage-votes.mjs rule).", "rollCalls": rcs})

# ---------- news ----------
news = content["news"]
def ntok(s): return [w for w in re.sub(r"[^a-z ]", " ", s.lower().replace('"', " ")).split() if w not in SUF]
def news_for_member(m):
    toks = set(ntok(m["name"])); last = ntok(m["name"])[-1]
    office = "State Delegate" if m["chamber"] == "house" else "State Senator"
    out = []
    for n in news:
        for p in n["people"]:
            if p["office"] not in (office, office + " candidate"): continue
            pt = ntok(p["name"])
            if not pt or pt[-1] != last: continue
            first = pt[0]
            if first in toks or (len(first) == 1 and any(t.startswith(first) for t in toks)):
                out.append(n); break
    return out
def news_row(n): return {"d": n["date"], "h": n["headline"], "o": n["outlet"], "u": n["url"]}

# ---------- legislators ----------
SESSION = {"20261": "2026 Regular Session", "20262": "2026 Special Session I"}
index = []
for slug, m in members.items():
    ch = m["chamber"]
    rcs, votes = rc_index[ch]
    mv = votes.get(slug, {})
    vstr = "".join(mv.get(i, "-") for i in range(len(rcs)))
    bills = [{"s": b["session"], "b": b["bill"], "t": b["title"], "o": b["outcome"], "st": b["status"], "sd": b["statusDate"], "c": cats.get(f"{b['session']}|{b['bill']}", [[], ""])[0], "cs": cats.get(f"{b['session']}|{b['bill']}", [[], ""])[1], "h": b["href"]} for b in m["bills"]]
    b27 = []
    for cls, lst in (("new", tracker["new_filings"]), ("continued", tracker["continued"])):
        for b in lst:
            if b.get("chief_patron_id") == m["lisId"]:
                b27.append({"b": b["bill_number"], "t": b["title"], "cls": cls, "st": b.get("status_label"), "c": [tax.get(i, i) for i in (b.get("category_ids") or []) if not str(i).startswith("continued")], "h": f"https://lis.virginia.gov/bill-details/20271/{b['bill_number']}"})
    me = money["members"].get(slug, {"codes": [], "rows": [], "reports": [], "spend": []})
    mon = None
    if me["codes"] and (me["rows"] or me.get("spend")):
        own = {re.sub(r"[^a-z0-9]", "", r["cname"].lower()) for r in me["rows"]}
        me["rows"] = [r for r in me["rows"] if re.sub(r"[^a-z0-9]", "", r["name"].lower()) not in own]
        donors, agg = [], {}
        for r in me["rows"]:
            key = (re.sub(r"[^a-z0-9]", "", r["name"].lower()), r["ind"], r["st"])
            if key not in agg:
                agg[key] = len(donors); donors.append([r["name"], 1 if r["ind"] else 0, r["city"], r["st"]])
        cells = collections.defaultdict(lambda: [0.0, 0, 0])  # (donor, year) -> amt, n, latest report id
        for r in me["rows"]:
            c = cells[(agg[(re.sub(r"[^a-z0-9]", "", r["name"].lower()), r["ind"], r["st"])], r["y"])]
            c[0] += r["amt"]; c[1] += 1; c[2] = max(c[2], int(r["rid"]))
        mon = {"committees": sorted({(r["code"], r["cname"]) for r in me["rows"]}), "donors": donors,
               "cells": [[k[0], k[1], round(v[0], 2), v[1], v[2]] for k, v in cells.items()],
               "reports": len(me["reports"]), "months": [money["months"][0], money["months"][-1]]}
        # expenditures (Schedule D) go in a separate file, loaded only when the money section opens
        sp = [r for r in me.get("spend", []) if re.sub(r"[^a-z0-9]", "", r["name"].lower()) not in own]
        sp.sort(key=lambda r: (r["d"], r["amt"]), reverse=True)
        mon["committees"] = sorted(set(map(tuple, mon["committees"])) | {(r["code"], r["cname"]) for r in sp})
        mon["spendN"] = len(sp)
        dump(f"money/{slug}.json", {"spend": [[r["name"], r["what"], r["amt"], r["d"], int(r["rid"])] for r in sp]})
    nws = [news_row(n) for n in news_for_member(m)]
    pref = "house" if ch == "house" else "senate"
    rec = {"id": f"leg.{slug}", "slug": slug, "name": m["name"], "chamber": ch, "party": m["party"], "district": m["district"], "lisId": m["lisId"],
           "committees": m["committees"], "profile": f"/dashboards/{pref}/members/{slug}", "lis": f"https://lis.virginia.gov/member-details/20261/{m['lisId']}",
           "voteSummary": m["votes"], "billCounts": m["billCounts"], "coPatron": m.get("coPatronCounts", {}), "floorRollCalls": meta[ch]["floorRollCalls"],
           "bills": bills, "bills2027": b27, "votes": vstr, "money": mon, "news": nws,
           "transcripts": {"floor": content["houseTranscripts"] if ch == "house" else content["senateTranscripts"], "ftm": f"/dashboards/{pref}/find-the-moment" + (f"?q={ntok(m['name'])[-1].title()}" if ch == "senate" else ""), "recaps": f"/dashboards/{pref}/recaps", "q": ntok(m['name'])[-1].title()},
           "asOf": meta[ch]["generated"]}
    dump(f"leg/{slug}.json", rec)
    index.append({"id": f"leg.{slug}", "kind": "leg", "label": ("Del. " if ch == "house" else "Sen. ") + m["name"], "sub": f"{'House' if ch == 'house' else 'Senate'} District {m['district']} · {'Democrat' if m['party'] == 'D' else 'Republican' if m['party'] == 'R' else m['party']}", "party": m["party"]})

# ---------- boards ----------
TOPICS = {  # aguyonx categories: fixed keyword rules over each recap's agenda titles, moment labels and recorded actions
    "loudoun-bos": [
        ("data-centers", "Data centers", r"data cent"),
        ("budget-taxes", "Budget and taxes", r"budget|tax rate|\btax(es)?\b|appropriat|fiscal year|capital improvement"),
        ("land-use", "Zoning and land use", r"zoning|rezon|land use|comprehensive plan|special exception|\bzmap|\bspex"),
        ("transportation", "Roads and transportation", r"transportation|\broads?\b|traffic|transit|metrorail|\bbus(es)?\b|\bvdot\b|intersection|sidewalk"),
        ("public-safety", "Public safety", r"sheriff|police|fire and rescue|fire-rescue|\bfire\b|emergency management|public safety|\b911\b"),
        ("housing", "Housing", r"housing|affordable dwelling|homeless"),
        ("water-environment", "Water, energy and environment", r"\bwater\b|stormwater|environment|\benergy\b|solar|transmission line|\btrees?\b"),
        ("public-comment", "Public comment and hearings", r"public comment|public input|public hearing"),
    ],
    "loudoun-lcps": [
        ("budget", "Budget", r"budget|appropriat|fiscal year|capital improvement|\bcip\b"),
        ("boundaries-buildings", "School boundaries and buildings", r"boundar|attendance zone|construction|renovat|new school|capacity"),
        ("policy-curriculum", "Policy and curriculum", r"\bpolic(y|ies)\b|curricul|instruction|textbook|library|\bbooks?\b"),
        ("special-education", "Special education", r"special education|\bsped\b|\biep\b|disabilit|\bseac\b"),
        ("student-safety", "Student safety and discipline", r"discipline|bullying|safety|security|resource officer|\bsro\b|cell phone|title ix"),
        ("staff-pay", "Staff and pay", r"salary|salaries|compensation|personnel|staffing|hiring|teacher pay"),
        ("public-comment", "Public comment and hearings", r"public comment|public input|public hearing"),
    ],
}
VENUES = {"loudoun-bos": ("Loudoun County Board of Supervisors", content["bos"], content["bosMembers"], "/dashboards/loudoun/bos/find-the-moment", "/dashboards/loudoun/bos/recaps", "/dashboards/loudoun/bos/members", "https://www.loudoun.gov/129/Board-of-Supervisors"),
          "loudoun-lcps": ("Loudoun County Public Schools (LCPS) School Board", content["lcps"], content["lcpsMembers"], "/dashboards/loudoun/schools/find-the-moment", "/dashboards/loudoun/schools/recaps", "/dashboards/loudoun/schools/members", "https://go.boarddocs.com/vsba/loudoun/Board.nsf/Public")}
tx = {(t["venue"], t["meetingId"]) for t in content["transcripts"]}
for vid, (label, meetings, roster, ftm, recaps_url, members_url, official) in VENUES.items():
    recs = [r for r in content["recaps"] if (r.get("venue") or "loudoun-bos") == vid]
    by_meeting = {r["meetingId"]: r for r in recs}
    ms = []
    for mt in meetings:
        r = by_meeting.get(mt["id"])
        ms.append({"id": mt["id"], "d": iso(mt["dateLabel"]), "t": mt["title"], "k": mt.get("kind"), "tx": (vid, mt["id"]) in tx, "v": mt["playerUrl"], "r": r["slug"] if r else None})
    rr = []
    for r in recs:
        text = " ".join([i["title"] for g in r["agenda"] for i in g["items"]] + [m["label"] for m in r["moments"]] + [d["action"] for d in r["decisions"]]).lower()
        tps = [t[0] for t in TOPICS[vid] if re.search(t[2], text)]
        rr.append({"slug": r["slug"], "d": iso(r["dateLabel"]), "t": r["title"], "tp": tps, "posted": r["official"]["votesPosted"],
                   "src": r["official"]["links"][0]["href"] if r["official"]["links"] else None,
                   "dec": [{"i": d.get("item"), "a": d["action"][:280] + ("…" if len(d["action"]) > 280 else ""), "ty": d.get("tally"), "h": d["source"]["href"], "l": d["source"]["label"]} for d in r["decisions"]]})
    rr.sort(key=lambda x: x["d"] or "", reverse=True)
    dump(f"board-{vid}.json", {"id": f"board.{vid}", "label": label, "official": official, "roster": roster, "meetings": ms, "recaps": rr,
                               "topics": [[t[0], t[1]] for t in TOPICS[vid]], "links": {"ftm": ftm, "recaps": recaps_url, "members": members_url, "news": "/dashboards/loudoun/news"}})
    index.append({"id": f"board.{vid}", "kind": "board", "label": label, "sub": f"{len(ms)} meetings on file · {len(recs)} recaps"})

# ---------- locality ----------
LOUDOUN_DELEGATION = {"house": [26, 27, 28, 29, 30], "senate": [31, 32]}  # https://www.loudoun.gov/134/State-Federal-Legislators (checked Nov 13, 2026)
deleg = [s for s, m in members.items() if m["district"] in LOUDOUN_DELEGATION[m["chamber"]]]
deleg.sort(key=lambda s: (members[s]["chamber"] != "senate", members[s]["district"]))
dump("place-loudoun.json", {"id": "place.loudoun", "label": "Loudoun County", "boards": ["board.loudoun-bos", "board.loudoun-lcps"],
                            "delegation": [{"slug": s, "name": members[s]["name"], "chamber": members[s]["chamber"], "district": members[s]["district"], "party": members[s]["party"]} for s in deleg],
                            "delegationSource": "https://www.loudoun.gov/134/State-Federal-Legislators",
                            "news": [news_row(n) for n in news if "loudoun" in n["loc"]], "newsUrl": "/dashboards/loudoun/news"})
index.append({"id": "place.loudoun", "kind": "place", "label": "Loudoun County (everything Loudoun)", "sub": "Board of Supervisors, School Board, General Assembly delegation, news"})
dump("index.json", {"generated": datetime.date.today().isoformat(), "subjects": index})
print("subjects", len(index), "delegation", deleg)
