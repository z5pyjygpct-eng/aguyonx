#!/usr/bin/env python3
"""Build the Virginia Senate floor Find the Moment catalog + recap vote files.

Inputs (all official):
  data/va-senate/chamber-2026.tsv   Senate of Virginia YouTube channel (@SenateofVirginia),
                                    "Senate Chamber on YYYY-MM-DD" streams: id<TAB>title<TAB>duration_s
                                    (refresh on the Mac mini: yt-dlp --flat-playlist .../streams and /videos)
  data/va-senate/senators-lis.json  current senators: name/district/party from the Senate's own
                                    directory (apps.senate.virginia.gov/Senator), member ids matched
                                    to LIS Members.csv (all 40 match)
  LIS public data files (downloaded fresh): https://lis.blob.core.windows.net/lisfiles/{session}/
                                    HISTORY.CSV, VOTE.CSV, BILLS.CSV, Members.csv for 20261 (Regular +
                                    Reconvened) and 20262 (Special Session I)
Outputs:
  src/content/va-senate-data.ts                 meetings, senators, recap index (generated)
  public/files/va-senate/votes/{date}.json       Senate floor roll calls for that day, per member
  data/va-senate/queue-rows.tsv                  Mac mini queue rows (body va-senate-floor)
Votes are ONLY LIS roll-call records (History_refid SV####) dated that day. Never from transcripts.
Usage: python3 scripts/va-senate-build.py [--cache DIR]
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
rows = [l.rstrip("\n").split("\t") for l in open(os.path.join(ROOT, "data/va-senate/chamber-2026.tsv")) if l.strip()]
meetings = []
for yid, title, d in rows:
    date = title.split(" on ")[1][:10]
    meetings.append(dict(id=f"vas-{yid}", youtubeId=yid, date=date, durationS=int(float(d)), finished="[Finished]" in title))
meetings.sort(key=lambda m: (m["date"], m["id"]), reverse=True)
by_date = collections.defaultdict(list)
for m in meetings: by_date[m["date"]].append(m)
for date, ms in by_date.items():
    ms.sort(key=lambda m: m["id"])
    for i, m in enumerate(ms):
        part = f" (stream {i+1} of {len(ms)})" if len(ms) > 1 else ""
        m["title"] = f"Senate Floor Session{part}"
        m["dateLabel"] = label(date)
        m["duration"] = dur(m["durationS"])
        m["session"] = "20261"

# ---- LIS roll calls ----
names = {}
for s in SESSIONS:
    for r in csv.reader(lis(s, "Members.csv")):
        if r and r[0] == "S": names[r[1]] = " ".join(r[2].split())
titles = {}
for s in SESSIONS:
    for r in csv.DictReader(lis(s, "BILLS.CSV")): titles[(s, r["Bill_id"])] = r["Bill_description"].strip()
votes = {}
for s in SESSIONS:
    for r in csv.reader(lis(s, "VOTE.CSV")):
        if r and r[0].startswith("SV"):
            votes[(s, r[0])] = [(r[i], r[i + 1]) for i in range(1, len(r) - 1, 2) if r[i].startswith("S")]
days = collections.defaultdict(dict)  # date -> (session, voteId) -> rollcall
for s in SESSIONS:
    for r in csv.DictReader(lis(s, "HISTORY.CSV")):
        ref, desc = r["History_refid"], r["History_description"]
        if not ref.startswith("SV") or not ref[2:].isdigit() or not desc.startswith("S "): continue
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

outdir = os.path.join(ROOT, "public/files/va-senate/votes"); os.makedirs(outdir, exist_ok=True)
recaps = []
for date in sorted(by_date, reverse=True):
    day = days.get(date, {})
    # 20261 HISTORY.CSV also logs Special Session I actions (June) with 20262 vote numbers: keep the 20262 copy
    for (s, ref) in list(day):
        if s == "20261" and ("20262", ref) in day: del day[(s, ref)]
    rcs = sorted(day.values(), key=lambda x: (x["session"], int(x["voteId"][2:])))
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
        votesUrl=f"/files/va-senate/votes/{date}.json" if rcs else None))

senators = json.load(open(os.path.join(ROOT, "data/va-senate/senators-lis.json")))
ts = ["/** GENERATED by scripts/va-senate-build.py — do not edit by hand. */",
      'import type { SenateMeeting, Senator, SenateRecapIndex } from "./va-senate";', "",
      "export const SENATE_MEETINGS: SenateMeeting[] = " + json.dumps([{k: m[k] for k in ("id","youtubeId","date","dateLabel","title","duration","durationS","session")} for m in meetings], indent=1) + ";", "",
      "export const SENATORS: Senator[] = " + json.dumps([{k: s[k] for k in ("name","district","party","lisId","senateId")} for s in senators], indent=1) + ";", "",
      "export const SENATE_RECAPS: SenateRecapIndex[] = " + json.dumps(recaps, indent=1) + ";", ""]
open(os.path.join(ROOT, "src/content/va-senate-data.ts"), "w").write("\n".join(ts))

q = []
for m in meetings:  # newest first
    u = f"https://www.youtube.com/watch?v={m['youtubeId']}"
    q.append("\t".join([m["id"], "va-senate-floor", "full_board", "1", m["date"], str(m["durationS"]), "yt-dlp", "youtube", u, u, m["id"], f"Senate of Virginia Floor Session {m['dateLabel']}"]))
open(os.path.join(ROOT, "data/va-senate/queue-rows.tsv"), "w").write("\n".join(q) + "\n")
print(f"meetings={len(meetings)} hours={sum(m['durationS'] for m in meetings)/3600:.1f} recap_days={len(recaps)} with_votes={sum(1 for r in recaps if r['votesUrl'])} rollcalls={sum(r['rollCallCount'] for r in recaps)}")
