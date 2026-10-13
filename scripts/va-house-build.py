#!/usr/bin/env python3
"""Build the Virginia House of Delegates floor Find the Moment catalog + recap vote files.

Inputs (all official):
  data/va-house/floor-2026.tsv      House floor session videos from the official House archive
                                    (video.house.virginia.gov, "Floor Sessions"; YouTube-hosted):
                                    id<TAB>"Month D, YYYY - Regular Session Part N"<TAB>duration_s
  data/va-house/delegates-lis.json  current delegates: name/district/party from house.vga.virginia.gov/members,
                                    member ids = LIS Members.csv (H####)
  LIS public data files: https://lis.blob.core.windows.net/lisfiles/{20261,20262}/HISTORY.CSV, VOTE.CSV,
                                    BILLS.CSV, Members.csv
Outputs:
  src/content/va-house-data.ts                 meetings, delegates, recap index (generated)
  public/files/va-house/votes/{date}.json      House floor roll calls for that day, per member
  data/va-house/queue-rows.tsv                 Mac mini queue rows (body va-house-floor, file_key house-{youtubeId})
Votes are ONLY LIS House floor roll calls (numeric History_refid present in VOTE.CSV, "H " history lines)
dated that day; committee votes (H##V...) are excluded. Never from transcripts.
Usage: python3 scripts/va-house-build.py [--cache DIR]
"""
import csv, json, re, os, sys, urllib.request, datetime, collections, io

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE = sys.argv[sys.argv.index("--cache") + 1] if "--cache" in sys.argv else "/tmp/lis-cache"
SESSIONS = {"20261": "2026 Regular Session", "20262": "2026 Special Session I"}
os.makedirs(CACHE, exist_ok=True)

def lis(session, name):
    p = os.path.join(CACHE, f"{session}-{name}")
    if not os.path.exists(p):
        urllib.request.urlretrieve(f"https://lis.blob.core.windows.net/lisfiles/{session}/{name}", p)
    return open(p, encoding="latin-1", newline="")

def mdy(s):
    m, d, y = (int(x) for x in s.split("/"))
    return f"{y:04d}-{m:02d}-{d:02d}"

def label(iso):
    d = datetime.date.fromisoformat(iso)
    return d.strftime("%b ") + str(d.day) + d.strftime(", %Y")

def dur(s):
    s = int(s); return f"{s//3600}h {s%3600//60}m"

# ---- meetings (YouTube floor streams) ----
rows = [l.rstrip("\n").split("\t") for l in open(os.path.join(ROOT, "data/va-house/floor-2026.tsv")) if l.strip()]
meetings = []
for yid, title, d in rows:  # title like "March 14, 2026 - Regular Session Part 2" (video.house.virginia.gov)
    ds, kind = title.split(" - ", 1)
    date = datetime.datetime.strptime(ds.strip(), "%B %d, %Y").date().isoformat()
    meetings.append(dict(id=f"house-{yid}", youtubeId=yid, date=date, durationS=int(float(d)), kind=kind.strip()))
meetings.sort(key=lambda m: (m["date"], m["id"]), reverse=True)
by_date = collections.defaultdict(list)
for m in meetings: by_date[m["date"]].append(m)
for date, ms in by_date.items():
    def pn(m):
        x = re.search(r"Part (\d+)", m["kind"]); return (m["kind"].split(" Part")[0], int(x.group(1)) if x else 1)
    ms.sort(key=pn)
    for i, m in enumerate(ms):
        m["title"] = re.sub(r"\s+Part\s+(\d+)$", r" (Part \1)", m["kind"])
        m["dateLabel"] = label(date)
        m["duration"] = dur(m["durationS"])
        m["session"] = "20262" if "Special" in m["kind"] else "20261"

# ---- LIS roll calls ----
names = {}
for s in SESSIONS:
    for r in csv.reader(lis(s, "Members.csv")):
        if r and r[0] == "H": names[r[1]] = " ".join(r[2].split())
titles = {}
for s in SESSIONS:
    for r in csv.DictReader(lis(s, "BILLS.CSV")): titles[(s, r["Bill_id"])] = r["Bill_description"].strip()
votes = {}
for s in SESSIONS:
    for r in csv.reader(lis(s, "VOTE.CSV")):
        if r and r[0].isdigit():  # House floor roll calls are numeric ids (committee votes are H##V...)
            votes[(s, r[0])] = [(r[i], r[i + 1]) for i in range(1, len(r) - 1, 2) if r[i].startswith("H")]
days = collections.defaultdict(dict)  # date -> (session, voteId) -> rollcall
for s in SESSIONS:
    for r in csv.DictReader(lis(s, "HISTORY.CSV")):
        ref, desc = r["History_refid"], r["History_description"]
        if not ref.isdigit() or not desc.startswith("H ") or (s, ref) not in votes: continue
        date = mdy(r["History_date"]); key = (s, ref)
        rc = days[date].setdefault(key, dict(session=s, sessionName=SESSIONS[s], voteId=ref, bills=[], members=None))
        bill = r["Bill_id"]
        if any(b["bill"] == bill for b in rc["bills"]): continue
        rc["bills"].append(dict(bill=bill, title=titles.get((s, bill), ""), action=desc[2:].strip(),
            href=f"https://lis.virginia.gov/bill-details/{s}/{bill}",
            voteHref=f"https://lis.virginia.gov/vote-details/{bill}/{s}/{ref}"))
        if rc["members"] is None and key in votes:
            g = collections.defaultdict(list)
            for mid, v in votes[key]: g[v].append(names.get(mid, mid))
            rc["members"] = {k: sorted(v) for k, v in g.items()}

outdir = os.path.join(ROOT, "public/files/va-house/votes"); os.makedirs(outdir, exist_ok=True)
recaps = []
for date in sorted(by_date, reverse=True):
    day = days.get(date, {})
    # 20261 HISTORY.CSV also logs Special Session I actions (June) with 20262 vote numbers: keep the 20262 copy
    for (s, ref) in list(day):
        if s == "20261" and ("20262", ref) in day: del day[(s, ref)]
    rcs = sorted(day.values(), key=lambda x: (x["session"], int(x["voteId"])))
    for rc in rcs:
        mm = rc["members"]
        rc["memberTally"] = f'{len(mm.get("Y", []))}-Y {len(mm.get("N", []))}-N {len(mm.get("A", []))}-A' if mm else None
        # official tally = the one LIS prints in the history line; member list from VOTE.CSV
        t = re.search(r"\((\d+-Y \d+-N(?: \d+-A)?)\)", " ".join(b["action"] for b in rc["bills"]))
        rc["tally"] = t.group(1) if t else rc["memberTally"]
    if rcs:
        json.dump(dict(date=date, source="LIS public data files HISTORY.CSV + VOTE.CSV (lis.blob.core.windows.net/lisfiles)",
            generated=datetime.date.today().isoformat(), rollCalls=rcs), open(os.path.join(outdir, f"{date}.json"), "w"), separators=(",", ":"))
    recaps.append(dict(slug=date, date=date, dateLabel=label(date), meetingIds=[m["id"] for m in by_date[date]],
        rollCallCount=len(rcs), billCount=len({(b["bill"], rc["session"]) for rc in rcs for b in rc["bills"]}),
        sessions=sorted({rc["sessionName"] for rc in rcs}),
        votesUrl=f"/files/va-house/votes/{date}.json" if rcs else None))

delegates = json.load(open(os.path.join(ROOT, "data/va-house/delegates-lis.json")))
ts = ["/** GENERATED by scripts/va-house-build.py — do not edit by hand. */",
      'import type { HouseMeeting, Delegate, HouseRecapIndex } from "./va-house";', "",
      "export const HOUSE_MEETINGS: HouseMeeting[] = " + json.dumps([{k: m[k] for k in ("id","youtubeId","date","dateLabel","title","duration","durationS","session")} for m in meetings], indent=1) + ";", "",
      "export const DELEGATES: Delegate[] = " + json.dumps([{k: s[k] for k in ("name","district","party","lisId")} for s in delegates], indent=1) + ";", "",
      "export const HOUSE_RECAPS: HouseRecapIndex[] = " + json.dumps(recaps, indent=1) + ";", ""]
open(os.path.join(ROOT, "src/content/va-house-data.ts"), "w").write("\n".join(ts))

q = []
for m in meetings:  # newest first
    u = f"https://www.youtube.com/watch?v={m['youtubeId']}"
    q.append("\t".join([m["id"], "va-house-floor", "full_board", "1", m["date"], str(m["durationS"]), "yt-dlp", "youtube", u, u, m["id"], f"Virginia House of Delegates {m['title']} {m['dateLabel']}"]))
open(os.path.join(ROOT, "data/va-house/queue-rows.tsv"), "w").write("\n".join(q) + "\n")
print(f"meetings={len(meetings)} hours={sum(m['durationS'] for m in meetings)/3600:.1f} recap_days={len(recaps)} with_votes={sum(1 for r in recaps if r['votesUrl'])} rollcalls={sum(r['rollCallCount'] for r in recaps)}")


# Standard: refresh Find the Moment thumbnails (new meetings + changed recap text).
import subprocess as _sp, os as _os
_sp.run(["bash", _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "ftm-thumbs.sh")], check=False)
